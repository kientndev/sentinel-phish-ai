"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Upload,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Camera,
  Copy,
  Check,
  Globe,
  FileCode,
  Link as LinkIcon,
  ShieldAlert,
  Sparkles,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsQR from "jsqr";

interface DecodedResult {
  rawPayload: string;
  defangedPayload: string;
  isUrl: boolean;
  domain: string | null;
  payloadType: "URL Link" | "Suspicious Scheme" | "Plain Text";
  scheme: string;
  previewUrl: string | null;
}

function defangUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  return rawUrl.replace(/^https?:\/\//i, (match) =>
    match.toLowerCase().replace("http", "hxxp")
  );
}

function extractDomain(urlStr: string): string | null {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname;
  } catch {
    // Try prefixing https:// if it looks like a domain without scheme
    try {
      const parsed = new URL(`https://${urlStr}`);
      if (parsed.hostname.includes(".")) {
        return parsed.hostname;
      }
    } catch {
      // ignore
    }
    return null;
  }
}

function analyzePayload(payload: string): DecodedResult {
  const trimmed = payload.trim();
  const lower = trimmed.toLowerCase();
  const isHttp = lower.startsWith("http://") || lower.startsWith("https://");

  let payloadType: "URL Link" | "Suspicious Scheme" | "Plain Text" = "Plain Text";
  let scheme = "text";
  let isUrl = false;
  let domain: string | null = null;

  if (isHttp) {
    payloadType = "URL Link";
    isUrl = true;
    scheme = lower.startsWith("https://") ? "https" : "http";
    domain = extractDomain(trimmed);
  } else if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("vbscript:")
  ) {
    payloadType = "Suspicious Scheme";
    scheme = lower.split(":")[0];
  } else if (/^[a-z0-9+.-]+:\/\//i.test(trimmed)) {
    // Custom app deep link e.g. tg://, intent://, bitcoin://
    payloadType = "Suspicious Scheme";
    scheme = lower.split("://")[0];
  } else if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    // Domain without http/https prefix
    payloadType = "URL Link";
    isUrl = true;
    scheme = "http (implicit)";
    domain = extractDomain(`https://${trimmed}`);
  }

  return {
    rawPayload: trimmed,
    defangedPayload: defangUrl(trimmed),
    isUrl,
    domain,
    payloadType,
    scheme,
    previewUrl: null,
  };
}

export default function QRShieldPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [decodedResult, setDecodedResult] = useState<DecodedResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "QR Shield - Malicious Payload Decoder | SentinelPhish";
  }, []);

  // Decode an Image element using off-screen HTML canvas & jsQR
  const decodeImageElement = useCallback((img: HTMLImageElement): DecodedResult | null => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    // Minimum size safeguard
    if (canvas.width === 0 || canvas.height === 0) return null;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Primary jsQR attempt
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    // If initial pass fails and image is very large, try downscaling to standard 800px width
    if (!code && (canvas.width > 1200 || canvas.height > 1200)) {
      const maxDim = 800;
      const scale = Math.min(maxDim / canvas.width, maxDim / canvas.height);
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = Math.round(canvas.width * scale);
      scaledCanvas.height = Math.round(canvas.height * scale);
      const scaledCtx = scaledCanvas.getContext("2d", { willReadFrequently: true });
      if (scaledCtx) {
        scaledCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
        const scaledData = scaledCtx.getImageData(
          0,
          0,
          scaledCanvas.width,
          scaledCanvas.height
        );
        code = jsQR(scaledData.data, scaledData.width, scaledData.height, {
          inversionAttempts: "attemptBoth",
        });
      }
    }

    if (!code || !code.data) {
      return null;
    }

    return analyzePayload(code.data);
  }, []);

  // Process File object
  const processImageFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setIsDecoding(true);

      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please upload a valid image file (.png, .jpg, .jpeg, .webp).");
        setIsDecoding(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreview(dataUrl);

        const img = new Image();
        img.onload = () => {
          try {
            const result = decodeImageElement(img);
            if (result) {
              setDecodedResult({
                ...result,
                previewUrl: dataUrl,
              });
              setErrorMessage(null);
            } else {
              setErrorMessage(
                "No readable QR code found in this image. Ensure the image is clear and well-lit."
              );
              setDecodedResult(null);
            }
          } catch (err) {
            console.error("QR decoding error:", err);
            setErrorMessage("Failed to process the QR code. Please try a different image.");
            setDecodedResult(null);
          } finally {
            setIsDecoding(false);
          }
        };
        img.onerror = () => {
          setErrorMessage("Failed to load the selected image file.");
          setIsDecoding(false);
        };
        img.src = dataUrl;
      };
      reader.onerror = () => {
        setErrorMessage("Failed to read the file. Please try again.");
        setIsDecoding(false);
      };
      reader.readAsDataURL(file);
    },
    [decodeImageElement]
  );

  // Global Clipboard Paste Listener (Win + Shift + S, Cmd + Shift + 4, Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [processImageFile]);

  // Drag & drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processImageFile(e.dataTransfer.files[0]);
      }
    },
    [processImageFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const resetScanner = () => {
    setDecodedResult(null);
    setErrorMessage(null);
    setImagePreview(null);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const copyPayload = () => {
    if (!decodedResult) return;
    navigator.clipboard.writeText(decodedResult.rawPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inspect in SentinelPhish scanner
  const handleInspect = () => {
    if (!decodedResult) return;
    let target = decodedResult.rawPayload;
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `https://${target}`;
    }
    router.push(`/scanning?url=${encodeURIComponent(target)}`);
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-10 min-h-[85vh] bg-[#0b0e14] relative overflow-hidden text-[#fafafa]">
      {/* Ambient Cyber Grid Glows */}
      <div className="pointer-events-none absolute top-12 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-36 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/8 rounded-full blur-[140px]" />

      <div className="max-w-4xl w-full space-y-6 relative z-10">
        {/* Section A: Header & Status */}
        <section className="space-y-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20">
              <QrCode className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">
                Optical Intelligence · Quishing Sandbox
              </span>
            </div>

            {/* Active Protection Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                Active Protection
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              QR Shield - Malicious Payload Decoder
            </h1>
            <p className="text-sm md:text-base text-zinc-400 font-medium max-w-2xl mt-1.5 leading-relaxed">
              Inspect physical and digital QR codes for quishing attempts, hidden redirects, and embedded exploits.
            </p>
          </div>
        </section>

        {/* Section B & C: Dropzone & Upload Methods */}
        <AnimatePresence mode="wait">
          {!decodedResult ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all flex flex-col items-center justify-center text-center backdrop-blur-xl ${
                  dragActive
                    ? "border-[#00d2ff] bg-[#00d2ff]/10 shadow-[0_0_30px_rgba(0,210,255,0.2)]"
                    : "border-white/10 hover:border-[#00d2ff]/40 bg-[#0A0F1D]/80 hover:bg-[#0A0F1D]"
                }`}
              >
                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Ambient Icon Glow */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d2ff]/15 to-[#a855f7]/15 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  {isDecoding ? (
                    <div className="w-8 h-8 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-9 h-9 text-[#00d2ff]" />
                  )}
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {isDecoding ? "Extracting Optical Payload..." : "Drop QR Code Image Here"}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Drag and drop your QR screenshot, click to browse, or take a capture on mobile.
                  </p>
                </div>

                {/* Paste Shortcut Pill */}
                <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-white text-[10px]">
                    Ctrl + V
                  </span>
                  <span>Paste screenshot directly from clipboard</span>
                </div>

                {/* Mobile Camera & Live Webcam Triggers */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>Take Mobile Photo</span>
                  </button>
                  <Link
                    href="/scan/qr"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-xs font-medium text-[#00d2ff] hover:text-white transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Live Webcam Scanner →</span>
                  </Link>
                </div>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <span className="font-bold">Decoding Warning:</span>
                    <p className="text-red-300/90 leading-relaxed">{errorMessage}</p>
                  </div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-red-400 hover:text-red-200 text-xs font-bold"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Section D: Inspection / Decoded Result Card */
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              className="bg-[#0A0F1D]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Header inside Result Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="w-12 h-12 rounded-xl border border-white/15 overflow-hidden bg-black/40 shrink-0 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Scanned QR Code"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">QR Payload Decoded</h3>
                    <p className="text-[11px] font-mono text-zinc-400">
                      Optical signature successfully extracted via pure client canvas
                    </p>
                  </div>
                </div>

                {/* Payload Type Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border tracking-wider ${
                      decodedResult.payloadType === "URL Link"
                        ? "bg-[#00d2ff]/15 text-[#00d2ff] border-[#00d2ff]/30"
                        : decodedResult.payloadType === "Suspicious Scheme"
                        ? "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse"
                        : "bg-zinc-500/15 text-zinc-300 border-zinc-500/30"
                    }`}
                  >
                    {decodedResult.payloadType === "URL Link" ? (
                      <LinkIcon className="w-3 h-3" />
                    ) : decodedResult.payloadType === "Suspicious Scheme" ? (
                      <ShieldAlert className="w-3 h-3" />
                    ) : (
                      <FileCode className="w-3 h-3" />
                    )}
                    {decodedResult.payloadType}
                  </span>
                </div>
              </div>

              {/* Target Domain & Protocol Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Domain Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#00d2ff]" />
                    Target Domain
                  </div>
                  <div className="text-base font-mono font-bold text-white truncate">
                    {decodedResult.domain || "No domain (Raw Text)"}
                  </div>
                </div>

                {/* Scheme & Format Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
                    Protocol Scheme
                  </div>
                  <div className="text-base font-mono font-bold text-[#00d2ff] uppercase truncate">
                    {decodedResult.scheme}
                  </div>
                </div>
              </div>

              {/* Decoded Defanged Payload Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-400 uppercase text-[10px] tracking-wider">
                    Decoded Payload (Defanged for Safety)
                  </span>
                  <button
                    onClick={copyPayload}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Original</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs text-[#00d2ff] break-all leading-relaxed select-all">
                  {decodedResult.defangedPayload}
                </div>
              </div>

              {/* Quishing Security Warning if suspicious scheme */}
              {decodedResult.payloadType === "Suspicious Scheme" && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Dangerous Protocol Detected:</span>
                    <p className="mt-0.5 text-red-300/90 leading-relaxed">
                      This QR code contains an executable or application protocol URI ({decodedResult.scheme}).
                      Scanning or executing this may trigger an OS-level exploit or unauthorized app action.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={resetScanner}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Scan Another QR Code
                </button>

                {decodedResult.isUrl ? (
                  <button
                    onClick={handleInspect}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] flex items-center justify-center gap-2"
                  >
                    <span>Inspect in SentinelPhish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href={`/scanning?url=${encodeURIComponent(decodedResult.rawPayload)}`}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] flex items-center justify-center gap-2"
                  >
                    <span>Inspect Text Target</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quishing Education Module */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-[#00d2ff]/5 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-[#00d2ff]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Understanding Quishing Attacks
              </h3>
              <p className="text-xs text-zinc-400">
                How malicious actors exploit optical redirects to bypass enterprise security gateways
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <span className="font-bold text-[#00d2ff] font-mono">01. Gateway Bypass</span>
              <p className="text-zinc-400 leading-relaxed">
                Standard email security gateways cannot easily parse image-based QR barcodes, allowing fraudulent links to reach inboxes unnoticed.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <span className="font-bold text-amber-400 font-mono">02. Mobile Context Switching</span>
              <p className="text-zinc-400 leading-relaxed">
                Users scan with personal smartphones, moving away from protected corporate networks into unmonitored mobile browsers.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <span className="font-bold text-emerald-400 font-mono">03. Sentinel Sandbox</span>
              <p className="text-zinc-400 leading-relaxed">
                QR Shield renders the payload on an isolated canvas and defangs the destination before any network request or redirect occurs.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
