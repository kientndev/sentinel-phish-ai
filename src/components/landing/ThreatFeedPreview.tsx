"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Radio, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Clock, 
  ArrowUpRight,
  Search
} from "lucide-react";

function defangDomain(rawDomainOrUrl: string): string {
  if (!rawDomainOrUrl) return "unknown[.]host";
  const clean = rawDomainOrUrl.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
  return clean.replace(/\./g, "[.]");
}

function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return "just now";
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

interface ScanRecord {
  _id: string;
  url: string;
  domain: string;
  verdict: string;
  riskScore: number;
  heuristics?: string[];
  createdAt: number;
}

export default function ThreatFeedPreview() {
  const feedData = useQuery(api.scans.getPublicFeed);
  const isLoading = feedData === undefined;
  const recentScans: ScanRecord[] = (feedData?.scans?.slice(0, 5) as ScanRecord[]) ?? [];

  const handleScrollToScanner = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const input = document.querySelector<HTMLInputElement>('input[aria-label="Target URL to inspect"]');
    if (input) {
      setTimeout(() => input.focus(), 600);
    }
  };

  const getVerdictBadge = (verdict: string, score: number) => {
    const isMalicious = verdict === "MALICIOUS" || score >= 75;
    const isSuspicious = verdict === "SUSPICIOUS" || (score >= 40 && score < 75);

    if (isMalicious) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          Malicious ({score}%)
        </span>
      );
    }

    if (isSuspicious) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Suspicious ({score}%)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        Clean ({score}%)
      </span>
    );
  };

  return (
    <section className="w-full max-w-7xl mx-auto my-24 px-4 sm:px-6 relative">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-cyan-500/5 blur-[120px] rounded-full" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold tracking-widest mb-3">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            [ LIVE THREAT TELEMETRY ]
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Recently Investigated Threats
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed max-w-2xl">
            Real-time URLs analyzed and defanged across the Sentinel platform. Backed exclusively by genuine inspection telemetry.
          </p>
        </div>

        <Link
          href="/reports"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.98] text-slate-300 hover:text-white font-mono text-xs font-semibold transition-all duration-100 ease-out shadow-sm shrink-0 group"
        >
          <span>View Complete Threat Archive</span>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Content Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl shadow-cyan-950/20">
        
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="animate-pulse bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-slate-800 rounded" />
                    <div className="h-3 w-32 bg-slate-800/60 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-24 bg-slate-800 rounded-full" />
                  <div className="h-4 w-16 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scans List (When Records Exist) */}
        {!isLoading && recentScans.length > 0 && (
          <div className="divide-y divide-slate-800/80">
            {recentScans.map((scan) => {
              const defangedHost = defangDomain(scan.domain || scan.url);
              const attackTags = scan.heuristics && scan.heuristics.length > 0
                ? scan.heuristics.slice(0, 3)
                : [scan.verdict === "MALICIOUS" ? "High Risk Indicators" : "Standard Inspection Rules"];

              return (
                <div
                  key={scan._id}
                  className="animate-fade-in py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-950/40 px-3 rounded-xl transition-all duration-300 ease-out"
                >
                  {/* Left: Defanged Domain & Category Tags */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-400 mt-0.5 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-white truncate select-all">
                          {defangedHost}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500 bg-slate-800/60 uppercase tracking-widest hidden xs:inline shrink-0">
                          Defanged
                        </span>
                      </div>

                      {/* Attack Vector Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {attackTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/40 text-[10px] font-mono text-slate-300 truncate max-w-[200px]"
                            title={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Verdict, Timestamp & Link to Report */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 font-mono text-xs">
                    {getVerdictBadge(scan.verdict, scan.riskScore)}

                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimeAgo(scan.createdAt)}</span>
                    </div>

                    <Link
                      href={`/scanning?url=${encodeURIComponent(scan.url)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-[0.98] border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 font-bold transition-all duration-100 ease-out group-hover:border-cyan-500/60"
                      title="Inspect full forensic report"
                    >
                      <span>Report</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Strict Honest Empty State (When 0 Records Return) */}
        {!isLoading && recentScans.length === 0 && (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">No Public Threats Logged Yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                All recent public submissions have cleared inspection, or no public scans have been recorded today.
              </p>
            </div>

            <button
              onClick={handleScrollToScanner}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-mono text-xs font-bold transition-all duration-100 ease-out shadow-[0_0_15px_rgba(0,210,255,0.25)] cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Scan a suspicious link to test the pipeline</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
