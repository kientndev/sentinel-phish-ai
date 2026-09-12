"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  HelpCircle, 
  Route, 
  Brain, 
  ShieldCheck, 
  Copy, 
  Check, 
  Lock, 
  FileText, 
  Sparkles,
  Code
} from "lucide-react";
import ProFeatureGate from "@/components/ProFeatureGate";

export default function EvidenceShowcase() {
  const [copied, setCopied] = useState(false);
  const [activeTierPreview, setActiveTierPreview] = useState<"free" | "pro">("free");

  const handleCopyIoc = () => {
    navigator.clipboard.writeText("hxxps://security-update-microsoft[.]cc/verify\nDomain: security-update-microsoft[.]cc\nIP: 198.51.100.27\nThreat: Credential Harvester (M365 Impersonation)");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-7xl mx-auto my-24 px-4 sm:px-6 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-4/5 h-96 bg-indigo-500/5 blur-[140px] rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold tracking-widest mb-4">
          [ FORENSIC EVIDENCE VS. BLACK-BOX SCORES ]
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          Don’t Just Get a Score. Understand Why.
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Most scanners leave you guessing with an opaque risk rating. Sentinel dissects the entire delivery chain, revealing the exact heuristics and behavioral signals behind every verdict.
        </p>

        {/* Interactive Mode Switcher for the Showcase */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 mt-6 text-xs font-mono">
          <span className="text-slate-500 px-2 font-semibold">Tier Preview:</span>
          <button
            onClick={() => setActiveTierPreview("free")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTierPreview === "free"
                ? "bg-slate-800 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Community (Free)
          </button>
          <button
            onClick={() => setActiveTierPreview("pro")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTierPreview === "pro"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-300" />
            Pro SecOps (Full Forensics)
          </button>
        </div>
      </div>

      {/* ── Side-by-Side Comparison Container ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT: The "Black Box" Approach (Compact Card) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
                Legacy Security Scanner
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                Black Box
              </span>
            </div>

            {/* Opaque Dial */}
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="relative w-36 h-36 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-950/60 shadow-inner">
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-slate-700/60" />
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-300">82%</span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-rose-400/80 mt-0.5">
                    Suspicious
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 max-w-[220px]">
                Arbitrary threat weight without forensic evidence.
              </p>
            </div>

            {/* Missing Context Checklist */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                Unanswered Questions
              </div>
              {[
                "Why is this score 82% instead of 20%?",
                "Which intermediate redirect hops were traversed?",
                "Was a credential form hidden in an iframe?",
                "What immediate action should SOC take?",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <HelpCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <span className="line-through decoration-slate-600 text-slate-500">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Caption */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs font-mono text-slate-400">
              The Old Way: High friction, zero context, and no actionable proof.
            </p>
          </div>
        </div>

        {/* RIGHT: The Sentinel Evidence Engine (Primary Focus Card) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-cyan-950/20 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold tracking-wide">
                [ Example Analysis Preview ]
              </span>
              <span className="text-xs font-mono text-slate-400">
                Target: <code className="text-slate-200 font-semibold select-all">hxxps://security-update-microsoft[.]cc/verify</code>
              </span>
            </div>

            {/* Verdict Tag */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                Phishing Confirmed — 92/100
              </span>
            </div>
          </div>

          {/* ── Multi-Layered Evidence Cards ── */}
          <div className="space-y-4 my-6">

            {/* 1. Redirect Trace: Hop-by-Hop Resolution */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
                  <Route className="w-4 h-4" />
                  Redirect Path Forensics (3 Hops)
                </div>
                <span className="text-slate-500 text-[11px]">Dynamic Gateway Cloaking</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">1. Initial:</span>
                    <span className="text-slate-300 truncate">bit[.]ly/m365-verify</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 shrink-0">
                    301 Redirect
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">2. Intermediate:</span>
                    <span className="text-slate-300 truncate">tracking.cloudgateway[.]org/hop?id=9a2b</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 shrink-0">
                    302 Gateway
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-rose-950/20 border border-rose-500/20">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-rose-400 font-bold">3. Terminal:</span>
                    <span className="text-rose-200 truncate font-semibold">security-update-microsoft[.]cc/verify</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 shrink-0">
                    200 Payload
                  </span>
                </div>
              </div>
            </div>

            {/* 2. DOM & Behavioral Heuristics */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-3">
                <Code className="w-4 h-4" />
                DOM Forensics &amp; Hidden Form Elements
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Cross-Origin Iframe Hijack:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Password input injected within sandboxed iframe to evade static crawlers.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Form Action Exfiltration:</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Credentials POST directly to unmapped IP destination <code className="text-amber-300">198.51.100.27</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. AI Threat Assessment Narrative */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
                <Brain className="w-4 h-4" />
                AI Threat Assessment (Grounded Narrative)
              </div>
              <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed italic">
                &ldquo;Credential harvesting workflow intentionally impersonating Microsoft 365 login portal. Attackers utilize an obfuscated 3-hop redirect chain and dynamic DOM injection to bypass standard email gateway filters.&rdquo;
              </p>
            </div>

            {/* 4. Pro Tier Touchpoint: Deep Forensic ASN / SSL Gate */}
            <ProFeatureGate
              isPro={activeTierPreview === "pro"}
              featureTitle="Deep Network ASN & Autonomous System Forensics"
              featureDescription="Inspect newly registered bulletproof ASN infrastructure, upstream peering anomalies, and automated SOC blocking playbooks."
            >
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Deep Autonomous System &amp; SSL Analysis
                  </div>
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    PRO TELEMETRY UNLOCKED
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900/60 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Registrar / Age:</span>
                    <span className="text-white font-semibold">NameSilo (3 days old)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Origin ASN:</span>
                    <span className="text-white font-semibold">AS208608 (Bulletproof)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">SSL Certificate:</span>
                    <span className="text-rose-400 font-semibold">Let&apos;s Encrypt (Untrusted CA)</span>
                  </div>
                </div>
              </div>
            </ProFeatureGate>

          </div>

          {/* Actionable Remediation & IOC Export */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recommended Action: Immediate perimeter DNS sinkhole and SSO session revocation.</span>
            </div>

            <button
              onClick={handleCopyIoc}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? "IOC Copied" : "Copy Forensic IOC"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── Supporting Capability Points (3-Column Micro-Grid) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Defensive De-Fanging</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatically neutralize URLs (<code className="text-cyan-300 font-mono">hxxps://</code>, <code className="text-cyan-300 font-mono">[.]</code>) and embedded payloads prior to evaluation, preventing accidental execution across SOC teams.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Zero Hallucination Grounding</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI assessments are anchored directly to real DOM nodes, redirect hops, and viewport pixel buffers—eliminating synthetic guesswork and false positives.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Exportable Forensics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate clean, concise technical threat summaries with defanged IOCs ready to paste directly into Jira tickets, Slack security channels, or SIEM rules.
          </p>
        </div>
      </div>
    </section>
  );
}
