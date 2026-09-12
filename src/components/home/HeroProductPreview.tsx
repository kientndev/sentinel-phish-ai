"use client";

import React from "react";
import { 
  ShieldAlert, 
  ExternalLink, 
  Code2, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  Clock, 
  FileSearch,
  ShieldCheck
} from "lucide-react";

export default function HeroProductPreview() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10 text-left">
      {/* Container with dark cinematic aesthetic */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-cyan-950/30 overflow-hidden">
        {/* Subtle Top Border Highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        
        {/* Ambient background glow inside card */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />

        {/* ── Top Bar: Mandatory Demonstration Label, Defanged URL, Timestamp, Threat Severity ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mandatory Demonstration Label */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold tracking-wide">
              [ Example Analysis ]
            </span>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden xs:inline">
              Demonstration Sample
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>2026-09-12 09:42 UTC</span>
            </div>

            {/* Threat Severity Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span>High Risk — 88/100</span>
            </div>
          </div>
        </div>

        {/* Target URL Defanged Display */}
        <div className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 overflow-hidden">
          <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-500 select-none">Target:</span>
          <span className="text-slate-200 font-medium truncate select-all">
            hxxps://auth-verification-portal[.]net/login
          </span>
          <span className="ml-auto text-[10px] text-slate-500 uppercase tracking-widest hidden sm:inline shrink-0 font-mono">
            Defanged
          </span>
        </div>

        {/* ── Signal Badges: Compact pills representing real checks ── */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Brand Impersonation Detected</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Suspicious Redirect Hop</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Obfuscated DOM Inputs</span>
          </div>
        </div>

        {/* ── Evidence Preview: 2-Column Forensic Breakdown ── */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Detection Summary */}
          <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              <FileSearch className="w-3.5 h-3.5" />
              <span>Detection Summary</span>
            </div>
            
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  High-fidelity credential harvesting form impersonating corporate Single Sign-On (SSO).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Double HTTP 302 redirect hop through intermediate dynamic DNS host (<code className="font-mono text-[11px] text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded">hop-02.dyndns[.]org</code>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Headless DOM analysis captured hidden Base64 JavaScript listeners capturing input keystrokes.
                </span>
              </li>
            </ul>
          </div>

          {/* Right Column: Recommended Action */}
          <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Recommended Action</span>
            </div>

            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              Immediate containment &amp; perimeter blocking recommended
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Blacklist domain and resolve destination IP in boundary firewalls &amp; DNS sinkholes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Invalidate active SSO sessions for any user who accessed this URL within the past 4 hours.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Quarantine inbound email messages containing matching domain or redirect signatures.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
          <span>Security Engine: Sentinel Hybrid Heuristics + Vision LLM Sandbox</span>
          <span className="text-slate-400">Status: Quarantine Enforced</span>
        </div>
      </div>
    </div>
  );
}
