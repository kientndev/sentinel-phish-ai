"use client";

import { 
  ShieldAlert, Activity, 
  BarChart2, Flame, Clock, Zap, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { usePhishTank } from "../../hooks/usePhishTank";

interface DisplayScanItem {
  url: string;
  score: number;
  engineTier?: number;
  latencyMs?: number;
  timestamp: number;
}

interface ConvexScanDoc {
  _id: string;
  userId?: string;
  targetUrl: string;
  riskScore: number;
  status: string;
  engineTier: number;
  latencyMs: number;
  threatDetails: string[];
  createdAt: number;
}

export default function DashboardMetrics() {
  const { user } = useUser();
  const convexScans = useQuery(
    api.scans.getUserScans,
    user?.id ? { userId: user.id } : "skip"
  ) as ConvexScanDoc[] | undefined;

  const { totalScans: localScans, threatsBlocked: localBlocked, scanHistory: localHistory } = usePhishTank();

  // Prefer live Convex authenticated scans if user is logged in and scans exist
  const hasConvexData = Array.isArray(convexScans) && convexScans.length > 0;
  
  const totalScans = hasConvexData ? convexScans.length : localScans;
  const threatsBlocked = hasConvexData
    ? convexScans.filter((s: ConvexScanDoc) => (s.riskScore ?? 0) >= 70 || s.status === "DANGEROUS" || s.status === "MALICIOUS").length
    : localBlocked;

  const avgLatency = hasConvexData
    ? Math.round(
        convexScans.reduce((acc: number, curr: ConvexScanDoc) => acc + (curr.latencyMs || 250), 0) /
          Math.max(1, convexScans.length)
      )
    : 240;

  const scanHistory: DisplayScanItem[] = hasConvexData
    ? convexScans.map((s: ConvexScanDoc) => ({
        url: s.targetUrl,
        score: s.riskScore,
        engineTier: s.engineTier,
        latencyMs: s.latencyMs,
        timestamp: s.createdAt,
      }))
    : localHistory;

  const dailyScans = scanHistory.filter((s: DisplayScanItem) => {
    const scanDate = new Date(s.timestamp);
    const today = new Date();
    return scanDate.toDateString() === today.toDateString();
  }).length;

  const maxVisibleScans = 30;
  const historyData = [...scanHistory].slice(0, maxVisibleScans).reverse(); 
  const chartHeight = 100;
  const chartWidth = 1000;

  let dPath = `M 0 ${chartHeight}`;
  if (historyData.length > 0) {
    const stepX = chartWidth / Math.max(1, historyData.length - 1);
    const points = historyData.map((d, i) => ({
      x: i * stepX,
      y: chartHeight - (d.score / 100) * chartHeight,
    }));
    dPath = `M ${points[0].x} ${points[0].y}`;
    if (points.length === 1) {
      dPath += ` L ${chartWidth} ${points[0].y}`;
    } else {
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        dPath += ` C ${p0.x + (p1.x - p0.x) / 3} ${p0.y}, ${p0.x + (p1.x - p0.x) * 2 / 3} ${p1.y}, ${p1.x} ${p1.y}`;
      }
    }
  } else {
    dPath = `M 0 ${chartHeight} L ${chartWidth} ${chartHeight}`;
  }
  const areaPath = `${dPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 30) return "text-orange-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-10">
      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <BarChart2 className="w-8 h-8 text-[#00d2ff] mb-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a1a1aa] mb-1">Total Scans</span>
          <span className="text-4xl font-black text-white">{totalScans}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-8 h-8 text-red-500 mb-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a1a1aa] mb-1">Threats Blocked</span>
          <span className="text-4xl font-black text-white">{threatsBlocked}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Zap className="w-8 h-8 text-cyan-400 mb-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a1a1aa] mb-1">Avg Resolution</span>
          <span className="text-4xl font-black text-white">{avgLatency}ms</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Flame className="w-8 h-8 text-orange-500 mb-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a1a1aa] mb-1">Daily Activity</span>
          <span className="text-4xl font-black text-white">{dailyScans}</span>
        </motion.div>
      </div>

      {/* Threat Trend Chart */}
      <section className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00d2ff]" />
            Threat Activity Trend
          </h2>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00d2ff]" /> Risk Score</div>
          </div>
        </div>

        <div className="relative h-[200px] w-full mt-10">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-full overflow-visible preserve-3d"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00d2ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {[0, 25, 50, 75, 100].map((level) => (
              <line key={level} x1="0" y1={chartHeight - level} x2={chartWidth} y2={chartHeight - level} 
                stroke="white" strokeOpacity="0.05" strokeWidth="1" />
            ))}

            <motion.path 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d={dPath} fill="none" stroke="#00d2ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <motion.path 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              d={areaPath} fill="url(#chartGradient)" />

            {historyData.map((d, i) => (
              <circle key={i} cx={(chartWidth / Math.max(1, historyData.length - 1)) * i} cy={chartHeight - (d.score / 100) * chartHeight}
                r="4" fill="#0b0e14" stroke="#00d2ff" strokeWidth="2" />
            ))}
          </svg>
        </div>
      </section>

      {/* Detailed History Table */}
      <section className="glass-card p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-500" />
            Incidence Log (Last 30)
          </h2>
          {hasConvexData && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              Live Cloud Sync
            </span>
          )}
        </div>
        
        {scanHistory.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">No Scans Recorded Yet</p>
              <p className="text-slate-400 text-sm mt-1">Run your first threat analysis to populate your live telemetry.</p>
            </div>
            <Link
              href="/scanning"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              Run First Scan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/5">
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a1a1aa]">
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Target URL</th>
                  <th className="px-4 py-4">Engine Tier</th>
                  <th className="px-4 py-4">Risk %</th>
                  <th className="px-4 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scanHistory.slice(0, 30).map((scan: DisplayScanItem, i: number) => (
                  <tr key={i} className="group hover:bg-white/2 transition-colors">
                    <td className="px-4 py-4">
                      <div className={`p-2 w-fit rounded-lg ${scan.score >= 70 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-[280px] truncate font-mono text-xs text-white group-hover:text-[#00d2ff] transition-colors">{scan.url}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        scan.engineTier === 1 
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                          : scan.engineTier === 2 
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" 
                            : "bg-purple-500/15 text-cyan-300 border border-cyan-500/30"
                      }`}>
                        Tier {scan.engineTier || 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-black text-sm">
                      <span className={getRiskColor(scan.score)}>{scan.score}%</span>
                    </td>
                    <td className="px-4 py-4 text-[10px] font-bold text-[#52525b] font-mono">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
