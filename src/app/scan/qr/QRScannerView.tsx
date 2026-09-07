"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, AlertTriangle, Shield, ArrowRight, AlertCircle, Camera, CameraOff, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

interface ScanResult {
  url: string;
  redFlags: string[];
  riskLevel: "Low" | "Medium" | "High";
}

export default function QRScannerView() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isCameraActiveRef = useRef(false);

  const evaluateUrl = (url: string): ScanResult => {
    const redFlags: string[] = [];
    const lowerUrl = url.toLowerCase();

    const suspiciousTLDs = [".top", ".xyz", ".link", ".info", ".biz"];
    if (suspiciousTLDs.some(tld => lowerUrl.includes(tld))) {
      redFlags.push("Suspicious TLD detected");
    }

    const ipPattern = /https?:\/\/(\d{1,3}\.){3}\d{1,3}/;
    if (ipPattern.test(url)) {
      redFlags.push("Direct IP address URL");
    }

    const shorteners = ["bit.ly", "t.co", "tinyurl", "goo.gl", "ow.ly", "is.gd"];
    if (shorteners.some(shortener => lowerUrl.includes(shortener))) {
      redFlags.push("URL shortener detected");
    }

    const sensitiveKeywords = ["login", "verify", "secure", "banking", "update", "account", "password", "signin"];
    if (sensitiveKeywords.some(keyword => lowerUrl.includes(keyword))) {
      redFlags.push("Contains sensitive keywords");
    }

    let riskLevel: "Low" | "Medium" | "High" = "Low";
    if (redFlags.length >= 3) {
      riskLevel = "High";
    } else if (redFlags.length >= 1) {
      riskLevel = "Medium";
    }

    return { url, redFlags, riskLevel };
  };

  const isValidUrl = useCallback((string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }, []);

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const stopCamera = async () => {
    isCameraActiveRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setScanResult(null);
    
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (.png, .jpg, .jpeg, .webp)");
      return;
    }

    // Stop active camera when image file is uploaded
    await stopCamera();

    setIsAnalyzing(true);

    try {
      const imageData = await readFile(file);
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to process image");
      }
      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageDataObj.data, imageDataObj.width, imageDataObj.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        const url = code.data;
        if (isValidUrl(url)) {
          const result = evaluateUrl(url);
          setScanResult(result);
        } else {
          setError("QR code does not contain a valid URL");
        }
      } else {
        setError("No QR code detected in the image");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [isValidUrl]);

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
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleDeepScan = () => {
    if (scanResult) {
      router.push(`/scanning?url=${encodeURIComponent(scanResult.url)}`);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "Medium":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "Low":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      default:
        return "text-[#a1a1aa] bg-white/5 border-white/10";
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scan = () => {
      if (!isCameraActiveRef.current || !videoRef.current) return;

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          if (isValidUrl(code.data)) {
            stopCamera();
            const result = evaluateUrl(code.data);
            setScanResult(result);
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsStartingCamera(true);
    await stopCamera();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      let stream: MediaStream;

      // Update constraints from { facingMode: { exact: "environment" } } to { video: { facingMode: "environment" } }
      // with a graceful fallback to { video: true } if environment mode fails.
      try {
        const constraints: MediaStreamConstraints = {
          video: { facingMode: facingMode },
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (envErr) {
        console.warn("Camera with facingMode failed, falling back to { video: true }:", envErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      isCameraActiveRef.current = true;
      setIsCameraActive(true);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');

        video.onloadedmetadata = async () => {
          try {
            await video.play();
            scanQRCode();
          } catch (playErr) {
            console.error("Error playing video:", playErr);
          }
        };
      }
    } catch (err) {
      setCameraError(`Unable to access camera: ${err instanceof Error ? err.message : 'Unknown error'}`);
      isCameraActiveRef.current = false;
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const flipCamera = async () => {
    await stopCamera();
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  return (
    <div className="max-w-2xl w-full">
      <div
        className={`glass-card p-12 border-2 border-dashed transition-all ${
          dragActive
            ? "border-[#00d2ff] bg-[#00d2ff]/10"
            : "border-white/10 bg-white/5 hover:border-white/20"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#a1a1aa] font-medium">Analyzing QR code...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-[#00d2ff]/10 p-4 flex items-center justify-center">
              <Upload className="w-12 h-12 text-[#00d2ff]" />
            </div>
            <div>
              <p className="text-white font-bold text-lg mb-2">
                Drag &amp; drop your QR code image here
              </p>
              <p className="text-[#a1a1aa] text-sm mb-4">
                Supports .png, .jpg, .jpeg, and .webp files
              </p>
              <button
                onClick={onButtonClick}
                className="px-6 py-3 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all uppercase tracking-widest text-xs mb-3 w-full"
              >
                Browse Files
              </button>
              <button
                onClick={() => {
                  setScanResult(null);
                  setError(null);
                  startCamera();
                }}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs w-full flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Scan via Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 glass-card p-4 border-red-500/20 bg-red-500/10 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {isStartingCamera && (
        <div className="mt-6 glass-card p-6 border-white/10 bg-white/5 flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#a1a1aa] font-medium">Starting camera...</p>
        </div>
      )}

      {isCameraActive && (
        <div className="mt-6 glass-card p-6 border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#00d2ff]" />
              <h3 className="text-white font-bold">Scanning via Camera</h3>
            </div>
            <button
              onClick={stopCamera}
              className="p-2 text-[#a1a1aa] hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <CameraOff className="w-5 h-5" />
            </button>
          </div>

          {cameraError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{cameraError}</p>
            </div>
          )}

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="relative w-full max-w-md mx-auto bg-[#0b0e14] rounded-xl overflow-hidden border border-white/10"
            style={{ minHeight: '300px' }}
          >
            <video
              ref={videoRef}
              className="w-full h-auto object-cover"
              autoPlay
              playsInline
              muted
              style={{ minHeight: '300px', backgroundColor: '#1a1d24' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-4 border-[#00d2ff]/30 rounded-xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#00d2ff] rounded-lg" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={flipCamera}
              className="px-4 py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Flip Camera
            </button>
            <label className="px-4 py-3.5 bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-[#00d2ff] hover:text-white font-bold rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.15)]">
              <Upload className="w-4 h-4" />
              <span>Upload Image / Drop QR</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {scanResult && (
        <div className="mt-6 glass-card p-6 border-white/10 bg-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#00d2ff]" />
            <h3 className="text-white font-bold">Detection Result</h3>
          </div>

          <div className={`mb-4 px-3 py-2 rounded-lg border flex items-center justify-center gap-2 ${getRiskColor(scanResult.riskLevel)}`}>
            <AlertCircle className="w-4 h-4" />
            <span className="font-bold">Risk Level: {scanResult.riskLevel}</span>
          </div>

          <div className="mb-4">
            <p className="text-[#a1a1aa] text-sm mb-2 font-medium">Decoded URL:</p>
            <div className="bg-[#0b0e14] border border-white/10 rounded-lg px-4 py-3 break-all">
              <p className="text-white text-sm font-mono">{scanResult.url}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[#a1a1aa] text-sm mb-2 font-medium">Heuristic Red Flags:</p>
            {scanResult.redFlags.length > 0 ? (
              <ul className="space-y-2">
                {scanResult.redFlags.map((flag, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-[#a1a1aa]">{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                No immediate red flags detected
              </p>
            )}
          </div>

          <button
            onClick={handleDeepScan}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2"
          >
            <span>Analyze with SentinelPhish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
