"use client";

import { QrCode, Upload, X, AlertTriangle, Shield, ArrowRight, AlertCircle, Camera, CameraOff, RotateCw } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

interface ScanResult {
  url: string;
  redFlags: string[];
  riskLevel: "Low" | "Medium" | "High";
}

export default function QRScannerPage() {
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

  // Heuristic evaluation function
  const evaluateUrl = (url: string): ScanResult => {
    const redFlags: string[] = [];
    const lowerUrl = url.toLowerCase();

    // Check for suspicious TLDs
    const suspiciousTLDs = [".top", ".xyz", ".link", ".info", ".biz"];
    if (suspiciousTLDs.some(tld => lowerUrl.includes(tld))) {
      redFlags.push("Suspicious TLD detected");
    }

    // Check for IP Address URLs
    const ipPattern = /https?:\/\/(\d{1,3}\.){3}\d{1,3}/;
    if (ipPattern.test(url)) {
      redFlags.push("Direct IP address URL");
    }

    // Check for URL shorteners
    const shorteners = ["bit.ly", "t.co", "tinyurl", "goo.gl", "ow.ly", "is.gd"];
    if (shorteners.some(shortener => lowerUrl.includes(shortener))) {
      redFlags.push("URL shortener detected");
    }

    // Check for sensitive keywords
    const sensitiveKeywords = ["login", "verify", "secure", "banking", "update", "account", "password", "signin"];
    if (sensitiveKeywords.some(keyword => lowerUrl.includes(keyword))) {
      redFlags.push("Contains sensitive keywords");
    }

    // Determine risk level
    let riskLevel: "Low" | "Medium" | "High" = "Low";
    if (redFlags.length >= 3) {
      riskLevel = "High";
    } else if (redFlags.length >= 1) {
      riskLevel = "Medium";
    }

    return { url, redFlags, riskLevel };
  };

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

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setScanResult(null);
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|png)/)) {
      setError("Please upload a .jpg or .png file");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Read file
      const imageData = await readFile(file);
      
      // Create image element to get dimensions
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create canvas to extract image data
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to process image");
      }
      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Scan for QR code
      const code = jsQR(imageDataObj.data, imageDataObj.width, imageDataObj.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        // Extract URL from QR code
        const url = code.data;
        if (isValidUrl(url)) {
          // Perform heuristic evaluation instead of redirecting
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
  }, []);

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const isValidUrl = useCallback((string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }, []);

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

  const startCamera = async () => {
    setCameraError(null);
    setIsStartingCamera(true);
    
    console.log("[Camera] Starting camera initialization...");
    
    // Clean slate: stop any existing camera first
    await stopCamera();
    
    // Add delay to allow DOM and hardware to sync
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      console.log("[Camera] Enumerating available cameras...");
      
      // Enumerate devices to find cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log("[Camera] Found video devices:", videoDevices.length);
      
      let deviceId: string | undefined;
      
      if (videoDevices.length > 0) {
        // Try to find back camera first
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          deviceId = backCamera.deviceId;
          console.log("[Camera] Using back camera:", backCamera.label);
        } else {
          // Use first available camera
          deviceId = videoDevices[0].deviceId;
          console.log("[Camera] Using first available camera:", videoDevices[0].label);
        }
      }
      
      // Relaxed constraints - no strict width/height, just basic video
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId }, aspectRatio: 1.0 }
          : { facingMode: facingMode, aspectRatio: 1.0 },
      };

      console.log("[Camera] Requesting camera with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("[Camera] Stream obtained successfully");
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('autoplay', '');
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.setAttribute('muted', '');
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("[Camera] Video metadata loaded, dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
        };
        
        await videoRef.current.play();
        console.log("[Camera] Video playing successfully");
        
        // Start scanning loop
        scanQRCode();
      }

      setIsCameraActive(true);
      console.log("[Camera] Camera active and ready");
    } catch (err) {
      console.error("[Camera] Error caught:", err);
      setCameraError(`Unable to access camera: ${err instanceof Error ? err.message : 'Unknown error'}. Please check permissions or try a different browser.`);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = async () => {
    console.log("[Camera] Stopping camera...");
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      console.log("[Camera] Animation frame cancelled");
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("[Camera] Track stopped:", track.kind);
      });
      streamRef.current = null;
      console.log("[Camera] Stream stopped");
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      console.log("[Camera] Video source cleared");
    }

    setIsCameraActive(false);
    console.log("[Camera] Camera stopped");
  };

  const scanQRCode = () => {
    console.log("[Camera] Starting QR code scanning loop...");
    
    if (!videoRef.current || !canvasRef.current) {
      console.error("[Camera] Video or canvas ref not available");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("[Camera] Canvas context not available");
      return;
    }

    console.log("[Camera] Video ready state:", video.readyState);
    console.log("[Camera] Video dimensions:", video.videoWidth, "x", video.videoHeight);

    const scan = () => {
      if (!isCameraActive || !videoRef.current) {
        console.log("[Camera] Scanning loop stopped (camera inactive)");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      console.log("[Camera] Image data captured:", imageData.width, "x", imageData.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        console.log("[Camera] QR code detected:", code.data);
        if (isValidUrl(code.data)) {
          console.log("[Camera] Valid URL detected, stopping camera and evaluating...");
          stopCamera();
          const result = evaluateUrl(code.data);
          setScanResult(result);
          return;
        } else {
          console.log("[Camera] QR detected but not a valid URL, continuing scan...");
        }
      }

      animationFrameRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  const flipCamera = async () => {
    await stopCamera();
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleCameraScan = () => {
    setScanResult(null);
    setError(null);
    setCameraError(null);
    console.log("Camera button clicked, starting...");
    startCamera();
  };

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-16 relative">
      <div className="max-w-2xl w-full text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <QrCode className="w-10 h-10 text-[#00d2ff]" />
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tight">
            QR Scanner
          </h1>
        </div>
        <p className="text-[#a1a1aa] font-medium text-lg italic">
          Upload a QR code image to scan for malicious links
        </p>
      </div>

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
            accept=".jpg,.jpeg,.png"
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
                  Drag & drop your QR code image here
                </p>
                <p className="text-[#a1a1aa] text-sm mb-4">
                  Supports .jpg and .png files
                </p>
                <button
                  onClick={onButtonClick}
                  className="px-6 py-3 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all uppercase tracking-widest text-xs mb-3 w-full"
                >
                  Browse Files
                </button>
                <button
                  onClick={handleCameraScan}
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
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Camera Loading Indicator */}
        {isStartingCamera && (
          <div className="mt-6 glass-card p-6 border-white/10 bg-white/5 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#a1a1aa] font-medium">Starting camera...</p>
          </div>
        )}

        {/* Camera Modal */}
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

            {/* Camera Error Message */}
            {cameraError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{cameraError}</p>
              </div>
            )}

            {/* Video Container */}
            <div className="relative w-full max-w-md mx-auto bg-[#0b0e14] rounded-xl overflow-hidden border border-white/10" style={{ minHeight: '300px' }}>
              <video
                ref={videoRef}
                className="w-full h-auto object-cover"
                autoPlay
                playsInline
                muted
                style={{ minHeight: '300px', backgroundColor: '#1a1d24' }}
              />
              {!videoRef.current?.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center text-[#52525b]">
                  <p>Camera loading...</p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-4 border-[#00d2ff]/30 rounded-xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#00d2ff] rounded-lg" />
              </div>
            </div>

            {/* Flip Camera Button */}
            <button
              onClick={flipCamera}
              className="mt-4 w-full px-6 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <RotateCw className="w-5 h-5" />
              Flip Camera
            </button>
          </div>
        )}

        {scanResult && (
          <div className="mt-6 glass-card p-6 border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#00d2ff]" />
              <h3 className="text-white font-bold">Detection Result</h3>
            </div>

            {/* Risk Level Indicator */}
            <div className={`mb-4 px-3 py-2 rounded-lg border flex items-center justify-center gap-2 ${getRiskColor(scanResult.riskLevel)}`}>
              <AlertCircle className="w-4 h-4" />
              <span className="font-bold">Risk Level: {scanResult.riskLevel}</span>
            </div>

            {/* Decoded URL */}
            <div className="mb-4">
              <p className="text-[#a1a1aa] text-sm mb-2 font-medium">Decoded URL:</p>
              <div className="bg-[#0b0e14] border border-white/10 rounded-lg px-4 py-3 break-all">
                <p className="text-white text-sm font-mono">{scanResult.url}</p>
              </div>
            </div>

            {/* Red Flags */}
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

            {/* Deep Scan Button */}
            <button
              onClick={handleDeepScan}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <span>Perform Deep AI Scan with Gemini 3 Flash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-8 glass-card p-6 border-white/10 bg-white/5">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Quishing Protection
          </h3>
          <p className="text-[#a1a1aa] text-sm leading-relaxed">
            QR code phishing (quishing) is a growing threat where malicious actors embed
            harmful URLs in QR codes. Our scanner extracts the URL and performs a comprehensive
            security analysis to detect phishing sites, credential harvesters, and other threats.
          </p>
        </div>
      </div>
    </main>
  );
}
