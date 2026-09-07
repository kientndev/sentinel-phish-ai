"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Search,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Radio,
  Globe,
  Filter,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type VerdictFilter = "ALL" | "MALICIOUS" | "SUSPICIOUS" | "CLEAN";

function defangUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  return rawUrl.replace(/^https?:\/\//i, (match) =>
    match.toLowerCase().replace("http", "hxxp")
  );
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

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>("ALL");

  useEffect(() => {
    document.title = "Threat Reports | SentinelPhish";
  }, []);

  // Reactive live subscription from Convex
  const feedData = useQuery(api.reports.getPublicFeed);
  const isLoading = feedData === undefined;
  const scans = useMemo(() => feedData?.scans ?? [], [feedData]);

  // Live Counter Statistics
  const totalVerifiedThreats = useMemo(
    () => scans.filter((s) => s.verdict === "MALICIOUS" || s.riskScore >= 75).length,
    [scans]
  );

  const activeHeuristicsCount = useMemo(
    () => scans.reduce((acc, s) => acc + (s.heuristics?.length || 0), 0),
    [scans]
  );

  // Filtered threat list
  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const target = (scan.url + " " + scan.domain).toLowerCase();
      const matchesSearch = searchTerm.trim() === "" || target.includes(searchTerm.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (verdictFilter === "ALL") return true;
      if (verdictFilter === "MALICIOUS") return scan.verdict === "MALICIOUS" || scan.riskScore >= 75;
      if (verdictFilter === "SUSPICIOUS")
        return scan.verdict === "SUSPICIOUS" || (scan.riskScore >= 40 && scan.riskScore < 75);
      if (verdictFilter === "CLEAN")
        return scan.verdict === "CLEAN" || scan.riskScore < 40;
      return true;
    });
  }, [scans, searchTerm, verdictFilter]);

  const getVerdictStyle = (score: number, verdict?: string) => {
    if (verdict === "MALICIOUS" || score >= 75) {
      return {
        label: "PHISH / DANGER",
        badge: "bg-red-500/15 text-red-400 border-red-500/30",
        bar: "bg-gradient-to-r from-red-600 to-red-400",
        scoreColor: "text-red-400",
        icon: AlertTriangle,
      };
    }
    if (verdict === "SUSPICIOUS" || score >= 40) {
      return {
        label: "SUSPICIOUS",
        badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        bar: "bg-gradient-to-r from-amber-600 to-yellow-400",
        scoreColor: "text-amber-400",
        icon: AlertTriangle,
      };
    }
    return {
      label: "CLEAN / VERIFIED",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      bar: "bg-gradient-to-r from-emerald-600 to-emerald-400",
      scoreColor: "text-emerald-400",
      icon: CheckCircle2,
    };
  };

  return (
    <main className="flex flex-col flex-1 items-center px-4 sm:px-6 md:px-10 py-10 relative overflow-hidden text-[#fafafa] bg-[#0b0e14]">
      {/* Ambient Cyber Grid Glows */}
      <div className="pointer-events-none absolute top-12 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-36 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/8 rounded-full blur-[140px]" />

      <div className="max-w-6xl w-full space-y-8 relative z-10">
        {/* Header Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20">
              <ShieldAlert className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">
                Public Threat Feed · PhishTank Architecture
              </span>
            </div>

            {/* Live Stream Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                LIVE FEED MONITORING
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                SentinelPhish Threat Feed
              </h1>
              <p className="text-sm md:text-base text-zinc-400 font-medium max-w-2xl mt-1.5 leading-relaxed">
                Global community-submitted URLs, live heuristic verdicts, and consensus verification.
              </p>
            </div>
          </div>
        </section>

        {/* Live Counters Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Verified Threats */}
          <div className="bg-[#0f1422]/80 backdrop-blur-md rounded-2xl border border-red-500/20 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Total Verified Threats
              </span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-red-400 font-mono">
              {isLoading ? "--" : totalVerifiedThreats}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Malicious phishing &amp; credential harvesters</p>
          </div>

          {/* Card 2: Active Heuristics */}
          <div className="bg-[#0f1422]/80 backdrop-blur-md rounded-2xl border border-[#00d2ff]/20 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d2ff]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Active Heuristics Analyzed
              </span>
              <Activity className="w-4 h-4 text-[#00d2ff]" />
            </div>
            <div className="text-3xl font-black text-[#00d2ff] font-mono">
              {isLoading ? "--" : activeHeuristicsCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Heuristic red flags extracted in real time</p>
          </div>

          {/* Card 3: Real-Time Stream Status */}
          <div className="bg-[#0f1422]/80 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Real-Time Stream
              </span>
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono flex items-center gap-2">
              ACTIVE
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Subscribed to WebSocket security events</p>
          </div>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
          {/* Verdict Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
            {(
              [
                { id: "ALL", label: "All Feeds" },
                { id: "MALICIOUS", label: "Phishing / Malicious" },
                { id: "SUSPICIOUS", label: "Suspicious" },
                { id: "CLEAN", label: "Clean" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVerdictFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  verdictFilter === tab.id
                    ? "bg-[#00d2ff] text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search domain or URL keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#00d2ff]/50 focus:ring-1 focus:ring-[#00d2ff]/40 text-xs text-white placeholder:text-zinc-500 transition-all font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Threat Feed Table */}
        <div className="bg-[#0A0F1D]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Target Domain / Defanged URL</th>
                  <th className="px-5 py-3.5">Risk Score</th>
                  <th className="px-5 py-3.5">Community Consensus</th>
                  <th className="px-5 py-3.5">Detected</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {isLoading ? (
                  // Skeleton Loading Shimmer
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="h-5 w-24 bg-white/10 rounded-full" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-48 bg-white/10 rounded mb-1" />
                        <div className="h-3 w-64 bg-white/5 rounded" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-3 w-28 bg-white/10 rounded mb-1.5" />
                        <div className="h-1.5 w-28 bg-white/5 rounded" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-5 w-20 bg-white/10 rounded-full" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-16 bg-white/10 rounded" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-7 w-20 bg-white/10 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredScans.length > 0 ? (
                  filteredScans.map((scan, idx) => {
                    const style = getVerdictStyle(scan.riskScore, scan.verdict);
                    const defanged = defangUrl(scan.url);

                    return (
                      <motion.tr
                        key={scan._id || idx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        {/* Status Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border tracking-wider ${style.badge}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {style.label}
                          </span>
                        </td>

                        {/* Target Domain / Defanged URL */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col max-w-[280px] sm:max-w-md">
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-[#00d2ff] opacity-60 shrink-0" />
                              <span className="font-bold text-white font-mono text-xs truncate">
                                {scan.domain}
                              </span>
                            </div>
                            <span
                              className="text-[11px] font-mono text-zinc-500 truncate mt-0.5"
                              title={defanged}
                            >
                              {defanged}
                            </span>
                            {scan.heuristics && scan.heuristics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {scan.heuristics.slice(0, 2).map((h, hIdx) => (
                                  <span
                                    key={hIdx}
                                    className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-400"
                                  >
                                    {h.length > 32 ? h.substring(0, 32) + "..." : h}
                                  </span>
                                ))}
                                {scan.heuristics.length > 2 && (
                                  <span className="text-[9px] font-mono text-zinc-500">
                                    +{scan.heuristics.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Risk Score */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="space-y-1 w-28">
                            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                              <span className={style.scoreColor}>{scan.riskScore}%</span>
                              <span className="text-[10px] text-zinc-500">RISK</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${style.bar}`}
                                style={{ width: `${Math.min(100, Math.max(5, scan.riskScore))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Community Consensus Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <ThumbsUp size={11} />
                              <span>{scan.helpfulCount || 0}</span>
                            </span>
                            <span className="text-zinc-600">/</span>
                            <span className="flex items-center gap-1 text-red-400">
                              <ThumbsDown size={11} />
                              <span>{scan.disputeCount || 0}</span>
                            </span>
                          </div>
                        </td>

                        {/* Detected Relative Time */}
                        <td className="px-5 py-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                          {formatTimeAgo(scan.createdAt)}
                        </td>

                        {/* Inspect Action Button */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/scanning?url=${encodeURIComponent(scan.url)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-[#00d2ff] hover:text-white font-mono font-bold text-[11px] transition-all shadow-sm group-hover:border-[#00d2ff]/60"
                          >
                            <span>Inspect</span>
                            <span className="text-xs transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  // Empty State
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                          <Filter className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white">No Threat Intelligence Found</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          No scans matched the selected verdict filter or keyword search. Try switching tabs or searching a different domain.
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-xs text-[#00d2ff] underline underline-offset-2 font-semibold"
                          >
                            Clear Search Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Community Defense Callout */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-[#00d2ff]/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-2">
              <ShieldAlert className="w-5 h-5 text-[#00d2ff]" />
              Crowdsourced Zero-Day Defense
            </h3>
            <p className="text-xs md:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Every analyzed URL contributes to our global threat matrix. Our neural heuristics and community consensus continuously train SentinelPhish to prevent zero-day attacks.
            </p>
          </div>
          <Link
            href="/scanning"
            className="px-6 py-3.5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] shrink-0"
          >
            Submit a Target URL →
          </Link>
        </section>
      </div>
    </main>
  );
}
