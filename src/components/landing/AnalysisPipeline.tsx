"use client";

import React from "react";
import { 
  Network, 
  Code2, 
  Terminal, 
  ShieldCheck, 
  ArrowDown,
  CheckCircle2
} from "lucide-react";

interface PipelineStage {
  step: string;
  title: string;
  icon: React.ReactNode;
  focus: string;
  signals: string[];
}

const STAGES: PipelineStage[] = [
  {
    step: "STAGE 01",
    title: "Pre-Flight & Network Routing",
    icon: <Network className="w-5 h-5 text-cyan-400" />,
    focus: "Resolving destination status codes, inspecting multi-hop redirect chains, and detecting immediate cloaking techniques or IP circuit-breakers.",
    signals: ["URL Normalization", "5-Hop Redirect Trace", "Threat Intel (URLhaus)", "Circuit Breaker Tripping"],
  },
  {
    step: "STAGE 02",
    title: "Heuristics & Static Inspection",
    icon: <Code2 className="w-5 h-5 text-indigo-400" />,
    focus: "Evaluating suspicious domain patterns, misleading subdomains, obfuscated paths, and embedded form fields before browser execution.",
    signals: ["Brand Typosquatting", "Shady TLD Matching", "Form Action Hijacks", "WHOIS/RDAP Age Verification"],
  },
  {
    step: "STAGE 03",
    title: "Headless Sandbox & AI Vision",
    icon: <Terminal className="w-5 h-5 text-purple-400" />,
    focus: "Rendering the page in an isolated headless environment to capture DOM behavior and AI visual brand impersonation checks.",
    signals: ["Isolated Chromium Runtime", "Full-Viewport Screenshot", "Multimodal Vision AI", "Deceptive MFA & Urgency Audit"],
  },
  {
    step: "STAGE 04",
    title: "Evidence Synthesis & Verdict",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    focus: "Correlating findings into a categorized threat verdict with concrete forensic evidence and defanged URLs.",
    signals: ["0–100 Unified Risk Score", "SOC Quarantine Protocol", "Defanged Telemetry (hxxps://)", "Convex Threat Persistence"],
  },
];

export default function AnalysisPipeline() {
  return (
    <section className="w-full max-w-7xl mx-auto my-24 px-4 sm:px-6 relative">
      {/* Subtle section background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-cyan-500/5 blur-[120px] rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold tracking-widest mb-4">
          ANALYSIS ARCHITECTURE
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          How Sentinel Investigates a Suspicious Link
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Every submitted URL traverses a multi-layered inspection engine to expose deceptive behavior before any human clicks.
        </p>
      </div>

      {/* Pipeline Grid & Connections */}
      <div className="relative">
        {/* Desktop Horizontal Connecting Line (visible only on lg screens) */}
        <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 z-0 pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {STAGES.map((stage, idx) => (
            <div key={stage.step} className="flex flex-col relative group">
              {/* Card Container */}
              <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-200 backdrop-blur-sm relative">
                {/* Header: Stage Tag + Icon */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="font-mono text-xs font-semibold text-slate-400 tracking-wider bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-md">
                    [ {stage.step} ]
                  </span>
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 group-hover:border-slate-600 transition-colors">
                    {stage.icon}
                  </div>
                </div>

                {/* Stage Title */}
                <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                  {stage.title}
                </h3>

                {/* Stage Focus Description */}
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-5">
                  {stage.focus}
                </p>

                {/* Concrete Signals / Technical Breakdown */}
                <div className="mt-auto pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Verified Execution
                  </div>
                  <ul className="space-y-1.5">
                    {stage.signals.map((sig) => (
                      <li key={sig} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
                        <span className="truncate">{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mobile / Tablet Connector Line (down arrow between cards) */}
              {idx < STAGES.length - 1 && (
                <div className="flex lg:hidden justify-center items-center py-2 text-slate-600">
                  <ArrowDown className="w-4 h-4 text-slate-600 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
