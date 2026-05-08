"use client";

import { QrCode, Upload, X, AlertTriangle, Shield, ArrowRight, AlertCircle } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
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
      setError("Failed to process image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

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
                  className="px-6 py-3 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all uppercase tracking-widest text-xs"
                >
                  Browse Files
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
