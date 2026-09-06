"use client";

import Link from "next/link";
import { QrCode, ArrowLeft, Sparkles, Scan } from "lucide-react";
import { motion } from "framer-motion";

export default function QRShieldPreviewPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-[75vh] bg-[#0b0e14] relative overflow-hidden text-[#fafafa]">
      {/* Ambient Cyber Glows */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#00d2ff]/8 rounded-full blur-[140px]" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 text-center glow-sm relative z-10 space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00d2ff]/20 to-[#a855f7]/20 rounded-3xl flex items-center justify-center border border-white/10 glow-sm">
            <QrCode className="w-10 h-10 text-[#00d2ff]" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">
              Feature In Preview · Version 1.1
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            QR Shield Intelligence
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            AI-driven malicious QR payload inspection launching in v1.1. Autonomous quishing protection detects deceptive redirection chains before mobile payloads execute.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/scanning"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scanner
          </Link>
          <Link
            href="/scan/qr"
            className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-semibold rounded-xl border border-white/10 transition-all text-xs flex items-center justify-center gap-2"
          >
            <Scan className="w-4 h-4 text-[#00d2ff]" />
            Open QR Camera
          </Link>
        </div>

        <p className="text-[11px] text-zinc-500 font-mono">
          Engine Tier 3 Sandbox · Real-Time QR Redirection Defense
        </p>
      </motion.div>
    </main>
  );
}
