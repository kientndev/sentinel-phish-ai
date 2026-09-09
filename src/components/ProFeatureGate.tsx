"use client";

import React from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export interface ProFeatureGateProps {
  isPro: boolean;
  featureTitle: string;
  featureDescription: string;
  children: React.ReactNode;
  className?: string;
}

export default function ProFeatureGate({
  isPro,
  featureTitle,
  featureDescription,
  children,
  className = "",
}: ProFeatureGateProps) {
  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Blurred & Disabled Content */}
      <div
        className="filter blur-md opacity-30 select-none pointer-events-none transition-all duration-300"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Frosted-Glass Gating Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6">
        <div className="backdrop-blur-sm bg-slate-950/70 border border-slate-800 rounded-xl p-6 text-center max-w-md w-full shadow-2xl space-y-4 relative group hover:border-[#a855f7]/40 transition-all">
          {/* Glowing Ambient Indicator */}
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d2ff]/20 to-[#a855f7]/20 border border-[#a855f7]/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Lock className="w-6 h-6 text-[#00d2ff]" />
          </div>

          {/* Title & PRO Badge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h4 className="text-base font-black text-white tracking-tight">
                {featureTitle}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-slate-950 uppercase tracking-wider shadow-sm">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              {featureDescription}
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-1">
            <Link
              href="/pricing"
              onClick={() => {
                trackEvent("pro_gate_clicked", {
                  feature_locked: featureTitle,
                });
              }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:opacity-95 hover:shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock with 14-Day Free Trial</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
