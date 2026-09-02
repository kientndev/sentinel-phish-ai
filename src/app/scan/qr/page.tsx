"use client";

import dynamic from "next/dynamic";
import { QrCode, AlertTriangle } from "lucide-react";

// Dynamically import QR scanner camera reader on-demand (no SSR)
const QRScannerView = dynamic(() => import("./QRScannerView"), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl w-full p-12 glass-card flex flex-col items-center justify-center space-y-4 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-white/10" />
      <div className="h-4 w-48 bg-white/10 rounded" />
      <div className="h-10 w-full max-w-xs bg-white/5 rounded-xl" />
    </div>
  ),
});

export default function QRScannerPage() {
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

      <QRScannerView />

      <div className="max-w-2xl w-full mt-8 glass-card p-6 border-white/10 bg-white/5">
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
    </main>
  );
}
