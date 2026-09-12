"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Zap, Shield, Sparkles, ArrowRight, ArrowUp } from "lucide-react";

interface LandingPricingProps {
  onStartFreeScan?: () => void;
}

export default function LandingPricing({ onStartFreeScan }: LandingPricingProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const handleFreeScan = () => {
    if (onStartFreeScan) {
      onStartFreeScan();
    } else {
      const el = document.getElementById("scanner-input");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      const input = document.getElementById("hero-url-input") as HTMLInputElement | null;
      if (input) {
        setTimeout(() => input.focus(), 500);
      }
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto my-24 px-4 sm:px-6 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-96 bg-cyan-500/5 blur-[140px] rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold tracking-widest mb-4">
          [ TRANSPARENT SECURITY PRICING ]
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          Investigate with Confidence. Upgrade for Full Forensics.
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Start analyzing suspicious links immediately on the Free tier, or unlock multi-hop redirects and deep AI heuristics with a 14-day Pro trial.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-2 mt-8 backdrop-blur-sm">
          <span className={`text-xs font-mono font-semibold transition-colors ${!isAnnual ? "text-white" : "text-slate-500"}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors p-0.5 border ${
              isAnnual ? "bg-cyan-500 border-cyan-400" : "bg-slate-800 border-slate-700"
            }`}
            aria-label="Toggle Annual Billing"
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                isAnnual ? "translate-x-6 bg-white shadow-md" : "translate-x-0 bg-white"
              }`}
            />
          </button>
          <span className={`text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${isAnnual ? "text-white" : "text-slate-500"}`}>
            <span>Annual</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Tier Comparison Grid (2 Cards: Free vs. Pro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
        
        {/* Tier 1: Free Community */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative backdrop-blur-md shadow-xl hover:border-slate-700 transition-all">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Community Free</h3>
                  <p className="text-xs text-slate-400">For individuals &amp; ad-hoc verification</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase">
                Active Tier
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">$0</span>
                <span className="text-slate-400 text-xs sm:text-sm font-mono">/ month</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">Free forever · No credit card required</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                Included Capabilities:
              </span>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>9 Daily URL Scans</strong> (resets midnight UTC)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Standard risk scoring (0–100) &amp; status verdicts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Automatic URL defanging (<code className="font-mono text-cyan-300">hxxps://</code>)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Full access to Community Threat Feed (/reports)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Domain age &amp; baseline reputation heuristics</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={handleFreeScan}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Start Free Scan</span>
              <ArrowUp className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Tier 2: Pro SecOps */}
        <div className="bg-slate-900/80 border-2 border-cyan-500/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative backdrop-blur-md shadow-2xl shadow-cyan-950/30 hover:border-cyan-500/70 transition-all">
          {/* Highlight Badge */}
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>14-Day Free Trial · No CC Required</span>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">SecOps Pro</h3>
                  <p className="text-xs text-cyan-400 font-medium">For security engineers &amp; teams</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                  ${isAnnual ? "12" : "15"}
                </span>
                <span className="text-slate-400 text-xs sm:text-sm font-mono">/ month</span>
                <span className="text-slate-600 line-through text-sm font-mono ml-1">$29</span>
              </div>
              <p className="text-xs text-emerald-400 font-mono font-medium">
                50% early access rate locked in for life
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block font-bold">
                Advanced Forensics Unlocked:
              </span>
              <ul className="space-y-2.5 text-xs text-slate-200 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>300 Scans / Day</strong> (Fair Use SecOps allocation)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Multi-Hop Redirect Tracing</strong> &amp; dynamic gateway unmasking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Headless DOM Analysis</strong> &amp; cross-origin iframe detection</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>AI Multimodal Vision</strong> (brand logo &amp; MFA spoof checks)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Exportable IOC Forensics</strong> ready for SIEM &amp; ticketing</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8">
            <Link
              href="/pricing"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all"
            >
              <span>Activate 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
