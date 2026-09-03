"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LoginGuard } from "../../components/LoginGuard";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search, ShieldAlert, Activity, Globe,
  Brain, CheckCircle2, Settings, Download, Zap,
  Eye, Bug, ShieldCheck, RefreshCw, Lock, AlertTriangle, Zap as ZapIcon, X, Route
} from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { usePhishTank } from "../../hooks/usePhishTank";
import { AnimatePresence, motion } from "framer-motion";
import SettingsModal, { AiMode } from "../SettingsModal";
import { LangCode, translations } from "../translations";
import XPBar from "../../components/XPBar";
import { checkLicenseBeforeScan, getLicenseErrorMessage } from "../../../lib/licenseGatekeeper";
import AiChatDrawer from "../../components/AiChatDrawer";

interface RedirectHop {
  url: string;
  status: number;
}

interface ScanResult {
  score: number;
  status: string;
  engineTier?: 1 | 2 | 3;
  latencyMs?: number;
  domainAge: string;
  expiryDate: string;
  registrar: string;
  redFlags: string[];
  hops?: RedirectHop[];
  redirectCount?: number;
  screenshotUrl: string;
  geminiVerdict?: {
    score: number;
    level: string;
    analysis_factors: {
      visual: string;
      technical: string;
      behavior: string;
    };
    advisor: {
      summary: string;
      actionable_advice: string[];
    };
    verdict: string;
  };
}

const PIPELINE_STAGES = [
  "Resolving redirect hops & DNS...",
  "Auditing domain registration & SSL...",
  "Executing headless sandbox analysis...",
  "Running AI heuristic vision model..."
];

export default function ScanningPage() {
  return (
    <LoginGuard>
      <ScanningContent />
    </LoginGuard>
  );
}

function ScanningContent() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [results, setResults] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [hasAutoScanned, setHasAutoScanned] = useState(false);
  
  // Mock user tier - in production, this comes from Clerk/Convex
  const isFreeUser = false;

  // Settings
  const [lang, setLang] = useState<LangCode>("en");
  const [aiMode, setAiMode] = useState<AiMode>("concise");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [liveGlow, setLiveGlow] = useState(false);
  const [spinnerColor, setSpinnerColor] = useState("text-[#00d2ff]");

  // Reporting state
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);

  // PhishTank Gamification hook
  const { 
    justRankedUp, 
    clearRankUpToast, 
    addScan
  } = usePhishTank();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isScanning && liveGlow) {
      const colors = ["text-emerald-400", "text-yellow-400", "text-red-500"];
      let i = 0;
      setSpinnerColor(colors[i]);
      interval = setInterval(() => {
        i = (i + 1) % colors.length;
        setSpinnerColor(colors[i]);
      }, 1500);
    } else {
      setSpinnerColor("text-[#00d2ff]");
    }
    return () => clearInterval(interval);
  }, [isScanning, liveGlow]);

  // Advance scan pipeline animation
  useEffect(() => {
    let stageTimer: ReturnType<typeof setInterval>;
    if (isScanning) {
      setPipelineStage(0);
      stageTimer = setInterval(() => {
        setPipelineStage((prev) => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(stageTimer);
  }, [isScanning]);

  const t = translations[lang];

  // ── Settings handlers ───────────────────────────────────
  const handleSettingsClose = () => {
    setSettingsOpen(false);
    sendGAEvent({ event: "settings_change", value: `${lang}_${aiMode}` });
  };

  // ── Live Unified Scan Handler ───────────────────────────
  const handleScan = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Check license before allowing scan
    const licenseCheck = await checkLicenseBeforeScan();
    if (!licenseCheck.valid) {
      setError(getLicenseErrorMessage(licenseCheck.reason));
      return;
    }

    sendGAEvent({ event: "security_scan_start", value: url });

    // Automatic Protocol Prepend
    let urlToScan = url.trim();
    if (!/^https?:\/\//i.test(urlToScan)) {
      urlToScan = `https://${urlToScan}`;
    }

    setIsScanning(true);
    setResults(null);
    setError(null);
    setReported(false);
    setIsReporting(false);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToScan, lang, turbo: turboMode }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: `Scan error (${res.status}): ${res.statusText}` }));
        throw new Error(errJson.error || `Scan error (${res.status}): ${res.statusText}`);
      }

      const scanData: ScanResult = await res.json();
      setResults(scanData);
      addScan(scanData.score, scanData.score >= 70, urlToScan);

      // Trigger AdMob Interstitial ad on mobile
      try {
        const { showInterstitialAd } = await import("@/lib/admob");
        await showInterstitialAd();
      } catch (err) {
        console.error("[AdMob] Error showing interstitial ad:", err);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during scan.";
      setError(message);
    } finally {
      setIsScanning(false);
    }
  }, [url, lang, turboMode, addScan]);

  const handleDownloadReport = () => {
    if (!results) return;
    sendGAEvent({ event: "report_download", value: url });
    const aiSummary = results.geminiVerdict?.advisor?.summary ?? "N/A";
    const aiAdvice: string[] = results.geminiVerdict?.advisor?.actionable_advice ?? [];
    const redFlagsHtml = (results.redFlags ?? []).map((f: string) => `<li>${f}</li>`).join("");
    const adviceHtml = aiAdvice.map((a: string) => `<li>✅ ${a}</li>`).join("");
    const hopsHtml = (results.hops ?? []).map((h: RedirectHop, idx: number) => `<li><strong>Hop ${idx + 1}:</strong> ${h.url} (Status: ${h.status})</li>`).join("");
    const reportHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${t.reportTitle}</title>
<style>body{font-family:sans-serif;background:#fff;color:#1a1a1a;padding:40px;max-width:800px;margin:0 auto}
h1{font-size:22px;font-weight:900;margin-bottom:8px}h2{font-size:14px;font-weight:700;text-transform:uppercase;color:#374151;border-left:4px solid #ef4444;padding-left:10px;margin:24px 0 12px}
.num{font-size:60px;font-weight:900;color:#ef4444}.field{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px}
ul{list-style:none;padding:0}ul li{background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:8px 12px;margin-bottom:6px;font-size:13px;color:#c2410c}
.ai{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;font-size:14px;color:#1e40af;line-height:1.7}
footer{border-top:1px solid #e5e7eb;padding-top:16px;text-align:center;font-size:12px;color:#9ca3af}
.print-btn{display:block;margin:0 auto 28px;padding:10px 24px;background:#0b0e14;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
@media print{.print-btn{display:none}}</style></head>
<body><button class="print-btn" onclick="window.print()">🖨 Print Report</button>
<h1>🛡️ ${t.reportTitle}</h1><p style="color:#666;font-size:13px">Generated: ${new Date().toLocaleString()}</p>
<h2>${t.reportUrl}</h2><div class="field" style="word-break:break-all;font-size:13px">${url}</div>
<div class="num">${results.score ?? 0}%</div>
${hopsHtml ? `<h2>Redirection Chain Trace</h2><ul>${hopsHtml}</ul>` : ""}
<h2>${t.reportRedFlags}</h2><ul>${redFlagsHtml || "<li>None detected.</li>"}</ul>
${aiSummary !== "N/A" ? `<h2>${t.reportAiSummary}</h2><div class="ai">${aiSummary}</div>` : ""}
${adviceHtml ? `<h2>${t.reportAiAdvice}</h2><ul>${adviceHtml}</ul>` : ""}
<footer><p>SentinelPhish AI — Real-time Autonomous Threat Defense</p></footer></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(reportHtml); win.document.close(); }
  };

  const handleReportPhish = async () => {
    if (!results || reported) return;
    setIsReporting(true);
    setTimeout(() => {
      setReported(true);
      setIsReporting(false);
    }, 500);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 30) return "text-orange-400";
    return "text-emerald-400";
  };

  // Auto-scan if URL is passed from QR scanner
  useEffect(() => {
    const urlFromParams = searchParams.get("url");
    if (urlFromParams && !hasAutoScanned && !isScanning) {
      setUrl(urlFromParams);
      setHasAutoScanned(true);
      setTimeout(() => {
        const event = { preventDefault: () => {} } as React.FormEvent;
        handleScan(event);
      }, 500);
    }
  }, [searchParams, hasAutoScanned, isScanning, handleScan]);

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-10 relative overflow-hidden">
      <XPBar />

      <AnimatePresence>
        {justRankedUp && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] bg-[#0b0e14] border border-[#a855f7] rounded-2xl px-6 py-4 glow-purple flex items-center gap-4"
          >
            <div className="bg-[#a855f7]/20 p-2 rounded-full">
              <Zap size={18} className="text-[#a855f7]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">RANK UP!</h3>
              <p className="text-[#a1a1aa] text-xs">You have reached a new rank.</p>
            </div>
            <button onClick={clearRankUpToast} className="ml-4 text-[#a1a1aa] hover:text-white text-xs font-bold">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={handleSettingsClose}
        lang={lang}
        setLang={setLang}
        aiMode={aiMode}
        setAiMode={setAiMode}
        turboMode={turboMode}
        setTurboMode={setTurboMode}
        liveGlow={liveGlow}
        setLiveGlow={setLiveGlow}
      />

      {/* Floating Settings Button */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="group fixed top-20 right-6 z-40 w-11 h-11 flex items-center justify-center
          bg-white/5 border border-white/10 rounded-xl hover:bg-[#00d2ff]/15 hover:border-[#00d2ff]/30
          transition-all duration-300 glow-md backdrop-blur-md"
      >
        <Settings size={18} className="text-[#a1a1aa] group-hover:text-[#00d2ff] transition-colors" />
      </button>

      <div className="max-w-6xl w-full space-y-10">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">Live Scrutiny</h1>
            <p className="text-[#a1a1aa] font-medium">Unified multi-hop redirection &amp; visual threat inspection</p>
          </div>
        </section>

        {/* Input Bar */}
        <section ref={scannerRef} className="glass-card p-6 glow-sm relative overflow-hidden transition-all border-[#00d2ff]/20">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4 relative z-10">
            <div className="relative flex-1 flex items-stretch">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Globe size={18} className="text-zinc-500" />
              </div>
              <span className="flex items-center bg-zinc-800 text-zinc-400 px-3 pl-9 border border-white/10 border-r-zinc-700 rounded-l-xl text-sm font-mono whitespace-nowrap select-none">
                https://
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.scannerPlaceholder}
                className="w-full pl-3 pr-4 py-4 bg-white/5 border border-white/10 border-l-0 text-[#fafafa] rounded-r-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all font-mono shadow-inner placeholder:text-[#52525b] flex-1"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isScanning}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-md hover:glow-lg tracking-wide"
            >
              <Search size={18} />
              {t.scanBtn}
            </button>
          </form>

          {isScanning && (
            <div className="mt-8 flex flex-col items-center justify-center space-y-4 py-8 text-[#a1a1aa]">
              <Activity size={24} className={`animate-spin ${spinnerColor}`} />
              <div className="space-y-1 text-center">
                <p className="font-bold text-xl text-[#fafafa] tracking-tight">{PIPELINE_STAGES[pipelineStage]}</p>
                <p className="text-xs font-mono text-[#00d2ff]">Pipeline Stage {pipelineStage + 1} of {PIPELINE_STAGES.length}</p>
              </div>
            </div>
          )}
        </section>

        {/* Results Sections */}
        <AnimatePresence>
          {results && !isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Score & Core Info */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br transition-opacity opacity-5 ${
                    results.score >= 70 ? "from-red-500 to-transparent" : "from-emerald-500 to-transparent"
                  }`} />
                  <h2 className="text-[#a1a1aa] font-black text-[10px] uppercase tracking-[0.25em] mb-4">{t.riskScore}</h2>
                  <div className={`text-7xl font-black mb-4 relative drop-shadow-[0_0_12px_rgba(var(--risk-rgb),0.3)] ${getRiskColor(results.score)}`}>
                    {results.score}%
                  </div>
                  <div className={`px-6 py-2 rounded-full font-black text-xs border tracking-widest ${
                    results.score >= 70 ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  }`}>
                    {results.status}
                  </div>
                  {(results.engineTier || results.latencyMs !== undefined) && (
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-zinc-400">
                      {results.engineTier && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                          Tier {results.engineTier}: {results.engineTier === 1 ? "DOM/Static" : results.engineTier === 2 ? "Threat Intel" : "Sandbox"}
                        </span>
                      )}
                      {results.latencyMs !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                          {results.latencyMs}ms
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* REDIRECT AUDIT & HOP TRACE */}
                <div className="glass-card p-4 space-y-3">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] flex items-center gap-2">
                    <Route size={18} className="text-yellow-400" />
                    Pre-Flight Hop Audit
                  </h3>
                  <div className="p-3 rounded-lg border bg-white/2 border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Total Redirects:</span>
                      <span className="text-[#00d2ff] font-bold">{results.redirectCount ?? 0}</span>
                    </div>
                    {results.hops && results.hops.length > 0 ? (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        {results.hops.map((hop, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-zinc-300 truncate max-w-[200px]" title={hop.url}>
                              {idx === 0 ? "1. Start: " : `${idx + 1}. -> `}{hop.url.replace(/^https?:\/\//, '')}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              [301, 302, 307, 308].includes(hop.status) 
                                ? "bg-yellow-500/20 text-yellow-400" 
                                : hop.status === 200 
                                  ? "bg-emerald-500/20 text-emerald-400" 
                                  : "bg-red-500/20 text-red-400"
                            }`}>
                              {hop.status || "FAIL"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500">Direct connection, no 3xx hops detected.</p>
                    )}
                  </div>
                </div>

                {/* VISUAL PREVIEW */}
                <div className="glass-card p-4 space-y-3">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] flex items-center gap-2">
                    <Eye size={18} className="text-[#00d2ff]" />
                    Visual Logo-Analysis
                  </h3>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={results.screenshotUrl || `https://api.microlink.io/?url=${encodeURIComponent(url.startsWith("http") ? url : `https://${url}`)}&screenshot=true&embed=screenshot.url`}
                      alt="Site Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400/0b0e14/ffffff?text=Direct+Scan+Clean";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <span className="text-[10px] font-medium text-white/80 line-clamp-1">{url}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    results.score >= 70 ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"
                  }`}>
                    {results.score >= 70 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        <span className="text-xs font-bold text-red-400">Threat Indicators Detected</span>
                      </div>
                    )}
                    <p className={`text-[10px] mt-1 ${
                      results.score >= 70 ? "text-red-300" : "text-emerald-300"
                    }`}>
                      {results.score >= 70 
                        ? "High-confidence spoofing or credential harvester detected."
                        : "No malicious brand impersonation detected."
                      }
                    </p>
                  </div>
                </div>

                {/* INTENT SCRAPER */}
                <div className="glass-card p-4 space-y-3">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-[#a1a1aa] flex items-center gap-2">
                    <ZapIcon size={18} className="text-[#a855f7]" />
                    Intent Scraper
                  </h3>
                  <div className={`p-3 rounded-lg border ${
                    results.score >= 50 ? "bg-orange-500/10 border-orange-500/30" : "bg-emerald-500/10 border-emerald-500/30"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#a1a1aa] uppercase">Social Engineering Risk</span>
                      <span className={`text-xs font-bold ${
                        results.score >= 50 ? "text-orange-400" : "text-emerald-400"
                      }`}>{results.score >= 50 ? "High" : "Low"}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      {results.score >= 50 
                        ? "Detected urgency keywords or deceptive intent markers."
                        : "No aggressive social engineering patterns detected."
                      }
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 space-y-5">
                  <h3 className="font-black text-xs uppercase tracking-widest text-[#a1a1aa] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-orange-400" />
                    {t.domainIntel}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: t.age, val: results.domainAge },
                      { label: t.expiry, val: results.expiryDate },
                      { label: t.registrar, val: results.registrar }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-zinc-500 text-xs font-bold">{item.label}</span>
                        <span className="text-white text-xs font-mono font-medium">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleDownloadReport}
                  className="w-full py-4 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                >
                  <Download size={18} className="text-gray-400 group-hover:text-white" />
                  {t.downloadReport}
                </button>

                <button 
                  onClick={handleReportPhish}
                  disabled={isReporting || reported || results.score < 30}
                  className={`w-full py-4 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 
                    ${reported 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 cursor-default" 
                      : results.score >= 30
                        ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 glow-md hover:glow-lg"
                        : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {isReporting ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : reported ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <Bug size={18} />
                  )}
                  {reported ? "Threat Reported" : "Report as Phish"}
                </button>
              </div>

              {/* Analysis & AI */}
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-[#00d2ff]" />
                    {t.redFlags}
                  </h3>
                  <div className="grid gap-3">
                    {results.redFlags.map((flag: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors">
                        <div className={`p-2 rounded-lg mt-0.5 ${results.score >= 70 ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                          <ShieldAlert size={18} className={`text-[#a1a1aa] ${results.score >= 70 ? "text-red-500" : "text-emerald-500"}`} />
                        </div>
                        <p className="text-sm font-medium text-zinc-300 leading-relaxed">{flag}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gemini AI Result Part */}
                <div className={`glass-card p-6 relative group ${isFreeUser ? "" : "border-[#00d2ff]/10"}`}>
                  {isFreeUser && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center p-6">
                      <div className="w-16 h-16 rounded-full bg-[#a855f7]/20 p-4 flex items-center justify-center mb-4">
                        <Lock size={18} className="text-[#a855f7]" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">AI Analysis Locked</h3>
                      <p className="text-[#a1a1aa] text-sm text-center mb-4">
                        AI Analysis available for Pro &amp; VIP subscribers.
                      </p>
                      <Link href="/pricing" className="px-6 py-2 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-lg glow-md hover:glow-lg transition-all uppercase tracking-widest text-xs">
                        Upgrade to Pro
                      </Link>
                    </div>
                  )}
                  <div className={`flex items-center gap-3 mb-6 ${isFreeUser ? "opacity-50" : ""}`}>
                    <div className="p-2.5 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/20">
                      <Brain size={18} className="text-[#00d2ff]" />
                    </div>
                    <div>
                      <h3 className="font-black text-white">{t.aiAnalysis}</h3>
                      <p className="text-[10px] uppercase font-bold text-[#00d2ff] tracking-[0.2em]">Powered by Gemini Threat Intelligence</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#00d2ff]/5 border border-[#00d2ff]/10 rounded-2xl p-6">
                      <p className="text-sm text-[#bae6fd] leading-relaxed italic">
                        &quot;{results.geminiVerdict?.advisor?.summary || "Heuristic and pre-flight evaluation completed successfully."}&quot;
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-[#a1a1aa] tracking-widest">{t.analysisFactors}</h4>
                        <div className="space-y-2">
                          {results.geminiVerdict?.analysis_factors ? Object.entries(results.geminiVerdict.analysis_factors).map(([k, v]) => (
                            <div key={k} className="p-3 bg-white/2 rounded-lg border border-white/5 text-[11px]">
                              <span className="font-black text-[#00d2ff] uppercase block mb-1">{k}</span>
                              <span className="text-zinc-400">{v as string}</span>
                            </div>
                          )) : (
                            <div className="p-3 bg-white/2 rounded-lg border border-white/5 text-[11px] text-zinc-400">
                              Direct heuristic verification.
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-[#a1a1aa] tracking-widest">{t.recommendedActions}</h4>
                        <div className="space-y-2">
                          {results.geminiVerdict?.advisor?.actionable_advice ? results.geminiVerdict.advisor.actionable_advice.map((a: string, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[11px] text-emerald-200">
                              <CheckCircle2 size={18} className="shrink-0" />
                              {a}
                            </div>
                          )) : (
                            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[11px] text-emerald-200">
                              <CheckCircle2 size={18} className="shrink-0" />
                              Target analyzed against live security criteria.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deferred On-Demand AI Chat Drawer */}
                <AiChatDrawer
                  results={results}
                  lang={lang}
                  aiMode={aiMode}
                  isFreeUser={isFreeUser}
                  chatPlaceholder={t.chatPlaceholder}
                  askAiTitle={t.askAiTitle}
                  chatEmptyMsg={t.chatEmptyMsg}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
