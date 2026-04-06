"use client";

import { 
  ShieldAlert, Activity, Globe, Monitor, 
  BarChart2, Flame, Trophy, Zap, Clock, TrendingUp
} from "lucide-react";
import { usePhishTank } from "../../hooks/usePhishTank";
import { motion } from "framer-motion";
import XPBar from "../../components/XPBar";

export default function DashboardPage() {
  const { 
    totalScans,
    threatsBlocked,
    scanHistory,
    userXP,
    dailyScans
  } = usePhishTank();

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

  const safetyRating = totalScans > 0 ? Math.round(((totalScans - threatsBlocked) / totalScans) * 100) : 100;
  const ringCircumference = 2 * Math.PI * 28;
  const dashoffset = ringCircumference - (safetyRating / 100) * ringCircumference;

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 30) return "text-orange-400";
    return "text-emerald-400";
  };

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-10 relative overflow-hidden">
      <XPBar />

      <div className="max-w-6xl w-full space-y-10">
        {/* Header */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
           <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">Agent Analytics</h1>
              <p className="text-[#a1a1aa] font-medium">Real-time threat intelligence performance</p>
           </div>
        </section>

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
              <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                 <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="white" strokeOpacity="0.05" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#10b981" strokeWidth="4" 
                       strokeDasharray={ringCircumference} strokeDashoffset={dashoffset} strokeLinecap="round" />
                 </svg>
                 <TrendingUp className="w-6 h-6 text-[#10b981]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a1a1aa] mb-1">Safety Rating</span>
              <span className="text-4xl font-black text-white">{safetyRating}%</span>
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
                 
                 {/* Grid Lines */}
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

                 {/* Data Points */}
                 {historyData.map((d, i) => (
                    <circle key={i} cx={(chartWidth / Math.max(1, historyData.length - 1)) * i} cy={chartHeight - (d.score / 100) * chartHeight}
                       r="4" fill="#0b0e14" stroke="#00d2ff" strokeWidth="2" />
                 ))}
              </svg>
           </div>
        </section>

        {/* Detailed History Table */}
        <section className="glass-card p-6 overflow-hidden">
           <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-500" />
              Incidence Log (Last 30)
           </h2>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="border-b border-white/5">
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a1a1aa]">
                       <th className="px-4 py-4">Status</th>
                       <th className="px-4 py-4">Target URL</th>
                       <th className="px-4 py-4">Risk %</th>
                       <th className="px-4 py-4">Timestamp</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {scanHistory.slice(0, 30).map((scan, i) => (
                       <tr key={i} className="group hover:bg-white/2 transition-colors">
                          <td className="px-4 py-4">
                             <div className={`p-2 w-fit rounded-lg ${scan.score >= 70 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                                <ShieldAlert className="w-4 h-4" />
                             </div>
                          </td>
                          <td className="px-4 py-4">
                             <div className="max-w-[300px] truncate font-mono text-xs text-white group-hover:text-[#00d2ff] transition-colors">{scan.url}</div>
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
        </section>
      </div>
    </main>
  );
}
