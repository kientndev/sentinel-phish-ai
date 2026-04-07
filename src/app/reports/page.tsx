"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Calendar, Globe, AlertTriangle, ExternalLink, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ReportedPhish {
  id: string;
  url: string;
  score: number;
  status: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportedPhish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/report")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch reports:", err);
        setLoading(false);
      });
  }, []);

  const filteredReports = reports.filter((r) => 
    r.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500 border-red-500/20 bg-red-500/5";
    if (score >= 30) return "text-orange-400 border-orange-400/20 bg-orange-400/5";
    return "text-emerald-400 border-emerald-400/20 bg-emerald-400/5";
  };

  const maskUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.hostname.split(".");
      if (parts.length > 2) {
        return `***.${parts.slice(-2).join(".")}`;
      }
      return urlObj.hostname;
    } catch {
      return url.length > 30 ? url.substring(0, 30) + "..." : url;
    }
  };

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-12 relative overflow-hidden text-[#fafafa]">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/8 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-40 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/8 rounded-full blur-[120px]" />

      <div className="max-w-6xl w-full space-y-10 relative z-10">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">Community Vault · Verified Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">Recently Caught</h1>
            <p className="text-[#a1a1aa] font-medium max-w-lg">
              Live database of malicious URLs reported by the community. Stay ahead of emerging zero-day phishing threats.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Filter by domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all text-sm font-medium"
            />
          </div>
        </section>

        {/* Reports Table */}
        <div className="glass-card overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] uppercase font-black tracking-[0.2em] text-[#a1a1aa]">Target Domain</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-black tracking-[0.2em] text-[#a1a1aa]">Risk Score</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-black tracking-[0.2em] text-[#a1a1aa]">Verdict</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-black tracking-[0.2em] text-[#a1a1aa]">Detected</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-black tracking-[0.2em] text-[#a1a1aa] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="h-4 bg-white/5 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report, i) => (
                    <motion.tr 
                      key={report.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-[#00d2ff] opacity-40" />
                          <span className="text-sm font-mono text-zinc-300">{maskUrl(report.url)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className={`inline-flex px-3 py-1 rounded-lg border text-xs font-black tracking-wider ${getRiskColor(report.score)}`}>
                          {report.score}%
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-3.5 h-3.5 ${report.score >= 70 ? "text-red-500" : "text-emerald-400"}`} />
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{report.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-[#a1a1aa]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <Link 
                           href={`/scanning?url=${report.url}`}
                           className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00d2ff] hover:text-[#00d2ff]/80 transition-colors bg-[#00d2ff]/10 px-3 py-2 rounded-lg border border-[#00d2ff]/20"
                        >
                          Re-Scan
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-[#a1a1aa] font-medium italic">
                      No reported threats found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#00d2ff]/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Crowdsourced Shield</h3>
            <p className="text-sm text-[#a1a1aa] max-w-xl">
              By reporting suspicious activity, you contribute to our global threat network. Our AI constantly learns from these reports to improve detection accuracy for everyone.
            </p>
          </div>
          <Link 
            href="/scanning"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            Scan a New URL
          </Link>
        </section>
      </div>
    </main>
  );
}
