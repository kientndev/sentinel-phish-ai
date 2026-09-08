"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  RotateCw,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import jsQR from "jsqr";

interface ScanResult {
  url: string;
  defangedUrl: string;
  domain: string | null;
  redFlags: string[];
  riskLevel: "Low" | "Medium" | "High";
  payloadType: "URL Link" | "Suspicious Scheme" | "Plain Text";
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

function evaluatePayload(rawPayload: string): ScanResult {
  const trimmed = rawPayload.trim();
  const lowerUrl = trimmed.toLowerCase();
  const isHttp = lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://");

  let payloadType: "URL Link" | "Suspicious Scheme" | "Plain Text" = "Plain Text";
  let domain: string | null = null;

  if (isHttp) {
    payloadType = "URL Link";
    domain = extractDomain(trimmed);
  } else if (
    lowerUrl.startsWith("javascript:") ||
    lowerUrl.startsWith("data:") ||
    lowerUrl.startsWith("file:") ||
    lowerUrl.startsWith("blob:") ||
    lowerUrl.startsWith("vbscript:")
  ) {
    payloadType = "Suspicious Scheme";
  } else if (/^[a-z0-9+.-]+:\/\//i.test(trimmed)) {
    payloadType = "Suspicious Scheme";
  } else if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    payloadType = "URL Link";
    domain = extractDomain(`https://${trimmed}`);
  }

  const redFlags: string[] = [];

  if (payloadType === "Suspicious Scheme") {
    redFlags.push("Dangerous application or executable protocol URI");
  }

  const suspiciousTLDs = [".top", ".xyz", ".link", ".info", ".biz", ".ru", ".cn", ".tk", ".ml", ".ga"];
  if (suspiciousTLDs.some((tld) => lowerUrl.includes(tld))) {
    redFlags.push("Suspicious or high-risk TLD detected");
  }

  const ipPattern = /https?:\/\/(\d{1,3}\.){3}\d{1,3}/;
  if (ipPattern.test(trimmed)) {
    redFlags.push("Direct IP address URL destination");
  }

  const shorteners = ["bit.ly", "t.co", "tinyurl", "goo.gl", "ow.ly", "is.gd", "cutt.ly"];
  if (shorteners.some((shortener) => lowerUrl.includes(shortener))) {
    redFlags.push("URL shortener obfuscation detected");
  }

  const sensitiveKeywords = [
    "login",
    "verify",
    "secure",
    "banking",
    "update",
    "account",
    "password",
    "signin",
    "wallet",
  ];
  if (sensitiveKeywords.some((keyword) => lowerUrl.includes(keyword))) {
    redFlags.push("Contains sensitive authentication keywords");
  }

  let riskLevel: "Low" | "Medium" | "High" = "Low";
  if (redFlags.length >= 3 || payloadType === "Suspicious Scheme") {
    riskLevel = "High";
  } else if (redFlags.length >= 1) {
    riskLevel = "Medium";
  }

  return {
    url: trimmed,
    defangedUrl: defangUrl(trimmed),
    domain,
    redFlags,
    riskLevel,
    payloadType,
  };
}

export default function QRScannerView() {
  const router = useRouter();

  // Mode: "camera" vs "upload"
  const [activeMode, setActiveMode] = useState<"camera" | "upload">("camera");

  // Camera & Stream states
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Upload & File states
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Result state
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [copied, setCopied] = useState(false);

  // DOM Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isCameraActiveRef = useRef(false);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    isCameraActiveRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Handle successful payload detection
  const handleDecodedPayload = useCallback(
    (rawPayload: string) => {
      stopCamera();
      const result = evaluatePayload(rawPayload);
      setScanResult(result);
      setCameraError(null);
      setUploadError(null);
    },
    [stopCamera]
  );

  // Continuous Camera Frame QR Scanner Loop
  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const scan = () => {
      if (!isCameraActiveRef.current || !videoRef.current) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data && code.data.trim()) {
          handleDecodedPayload(code.data);
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  }, [handleDecodedPayload]);

  // Start Camera with flexible constraints and fallback
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    // Short pause for hardware release
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      let stream: MediaStream;

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode }, // Allows fallback to front camera on laptops
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn("Primary camera constraints failed, falling back to simple { video: true }:", err);
        // Fallback if environment mode throws OverconstrainedError on desktop webcams
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      isCameraActiveRef.current = true;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => {
              scanQRCode();
            })
            .catch((playErr) => {
              console.error("Video play error:", playErr);
            });
        };
      }
    } catch (fallbackErr) {
      console.error("Unable to access any camera:", fallbackErr);
      setCameraError(
        "Unable to access camera. Please verify camera permissions or switch to the Upload / Paste tab."
      );
      isCameraActiveRef.current = false;
    }
  }, [facingMode, stopCamera, scanQRCode]);

  // Flip Camera (environment <-> user)
  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Trigger camera restart when facingMode changes in camera mode
  useEffect(() => {
    if (activeMode === "camera" && !scanResult) {
      startCamera();
    }
  }, [facingMode, activeMode, scanResult, startCamera]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Process File Object (Dropzone, Browse, or Paste)
  const handleImageFile = useCallback(
    (file: File) => {
      setUploadError(null);
      setIsAnalyzing(true);
      stopCamera();

      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload a valid image file (.png, .jpg, .jpeg, .webp).");
        setIsAnalyzing(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) {
              setUploadError("Canvas context unavailable. Please try again.");
              setIsAnalyzing(false);
              return;
            }

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });

            // If initial pass fails and image is very large, try downscaling
            if (!code && (canvas.width > 1200 || canvas.height > 1200)) {
              const scale = Math.min(800 / canvas.width, 800 / canvas.height);
              const scaledCanvas = document.createElement("canvas");
              scaledCanvas.width = Math.round(canvas.width * scale);
              scaledCanvas.height = Math.round(canvas.height * scale);
              const scaledCtx = scaledCanvas.getContext("2d", { willReadFrequently: true });
              if (scaledCtx) {
                scaledCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
                const scaledData = scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
                code = jsQR(scaledData.data, scaledData.width, scaledData.height, {
                  inversionAttempts: "attemptBoth",
                });
              }
            }

            if (code && code.data) {
              handleDecodedPayload(code.data);
            } else {
              setUploadError("No QR code detected in this image. Please try a clearer screenshot.");
            }
          } catch (err) {
            console.error("Decode error:", err);
            setUploadError("Failed to decode the selected image file.");
          } finally {
            setIsAnalyzing(false);
          }
        };
        img.onerror = () => {
          setUploadError("Failed to load the selected image.");
          setIsAnalyzing(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setUploadError("Failed to read the file.");
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    },
    [stopCamera, handleDecodedPayload]
  );

  // Global Clipboard Paste Listener (Ctrl + V / Cmd + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            setActiveMode("upload");
            handleImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImageFile]);

  // Drag and Drop handlers
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

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    },
    [handleImageFile]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setCameraError(null);
    setUploadError(null);
    setCopied(false);
    if (inputRef.current) inputRef.current.value = "";
    if (activeMode === "camera") {
      startCamera();
    }
  };

  const copyUrl = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeepScan = () => {
    if (!scanResult) return;
    let target = scanResult.url;
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = `https://${target}`;
    }
    router.push(`/scanning?url=${encodeURIComponent(target)}`);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "Medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "Low":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      default:
        return "text-zinc-300 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="max-w-2xl w-full space-y-6">
      {/* Dual-Mode Segmented Switch */}
      {!scanResult && (
        <div className="flex items-center justify-center p-1.5 bg-[#0b0e14]/90 border border-white/10 rounded-2xl max-w-md mx-auto shadow-lg backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setActiveMode("camera");
              setUploadError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all ${
              activeMode === "camera"
                ? "bg-[#00d2ff] text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Scan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("upload");
              stopCamera();
              setCameraError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all ${
              activeMode === "upload"
                ? "bg-[#00d2ff] text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload / Paste</span>
          </button>
        </div>
      )}

      {/* Main Interactive Viewfinder / Dropzone Area */}
      <AnimatePresence mode="wait">
        {scanResult ? (
          /* Decoded Result Module */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            className="bg-[#0A0F1D]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">QR Payload Decoded</h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Extracted optical payload ready for threat analysis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border tracking-wider flex items-center gap-1.5 ${getRiskColor(
                    scanResult.riskLevel
                  )}`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{scanResult.riskLevel} Risk</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                  {scanResult.payloadType}
                </span>
              </div>
            </div>

            {/* Target Domain Grid */}
            {scanResult.domain && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#00d2ff]" />
                  Extracted Domain
                </div>
                <div className="text-base font-mono font-bold text-white truncate">
                  {scanResult.domain}
                </div>
              </div>
            )}

            {/* Defanged Decoded URL Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-400 uppercase text-[10px] tracking-wider">
                  Decoded URL (Defanged for Safety)
                </span>
                <button
                  onClick={copyUrl}
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
              <div className="bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-[#00d2ff] break-all select-all leading-relaxed">
                {scanResult.defangedUrl}
              </div>
            </div>

            {/* Red Flags list */}
            {scanResult.redFlags.length > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Preliminary Optical Heuristics:
                </span>
                <ul className="space-y-1 text-xs text-amber-200/90 font-mono">
                  {scanResult.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No high-risk URL anomalies detected in optical payload</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetScanner}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Scan Another QR Code
              </button>

              <button
                type="button"
                onClick={handleDeepScan}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] flex items-center justify-center gap-2"
              >
                <span>Analyze in Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : activeMode === "camera" ? (
          /* Live Camera Viewfinder Mode */
          <motion.div
            key="camera-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-[#0A0F1D]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl"
          >
            {cameraError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Camera Access Notification</p>
                  <p className="text-red-300/80 leading-relaxed">{cameraError}</p>
                </div>
              </div>
            )}

            {/* Video Viewfinder Container */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className="relative w-full aspect-[4/3] sm:aspect-video bg-[#0b0e14] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-inner"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-xl"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Crosshair Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-[#00d2ff] rounded-2xl relative shadow-[0_0_25px_rgba(0,210,255,0.25)]">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#00d2ff] rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#00d2ff] rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#00d2ff] rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#00d2ff] rounded-br" />

                  {/* Horizontal sweeping laser animation */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent animate-pulse top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Camera status badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Scanning Optical Feed...</span>
              </div>
            </div>

            {/* Camera Controls Bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={flipCamera}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-all flex items-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>Flip Camera ({facingMode === "environment" ? "Rear" : "Front"})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode("upload");
                  stopCamera();
                }}
                className="text-xs font-mono text-zinc-400 hover:text-[#00d2ff] transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload file instead</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Upload or Paste Image Mode */
          <motion.div
            key="upload-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all flex flex-col items-center justify-center text-center backdrop-blur-xl ${
                dragActive
                  ? "border-[#00d2ff] bg-[#00d2ff]/10 shadow-[0_0_30px_rgba(0,210,255,0.2)]"
                  : "border-white/10 hover:border-[#00d2ff]/40 bg-[#0A0F1D]/80 hover:bg-[#0A0F1D]"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 border-3 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-zinc-400">Decoding Optical Payload...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8 text-[#00d2ff]" />
                  </div>

                  <div className="space-y-1.5 max-w-sm">
                    <p className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Drag &amp; drop a QR code image, click to browse, or press Ctrl + V anywhere
                    </p>
                    <p className="text-xs font-mono text-zinc-500">
                      Accepts .png, .jpg, .jpeg, .webp
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-white text-[10px]">
                      Ctrl + V
                    </span>
                    <span>Paste screenshot directly from clipboard</span>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p>{uploadError}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
