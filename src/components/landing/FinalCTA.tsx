"use client";

import React from "react";
import { ArrowUp, Search, ShieldCheck } from "lucide-react";

export default function FinalCTA() {
  const handleScrollToScanner = () => {
    const el = document.getElementById("scanner-input");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const input = document.getElementById("hero-url-input") as HTMLInputElement | null;
    if (input) {
      setTimeout(() => input.focus(), 600);
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto my-20 px-4 text-center relative">
      <div className="relative rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-10 sm:p-14 backdrop-blur-md shadow-2xl shadow-cyan-950/20 overflow-hidden">
        {/* Subtle Ambient Backglow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-3xl" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>ZERO CLICK EXPOSURE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          Got a suspicious link?
        </h2>
        
        <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Let SentinelPhish investigate it before anyone clicks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleScrollToScanner}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_25px_rgba(0,210,255,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Search className="w-4 h-4" />
            <span>Scan a URL</span>
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        <p className="mt-6 text-xs text-slate-500 font-mono">
          2 free guest scans · Instant heuristic verdict · No account required
        </p>
      </div>
    </section>
  );
}
