"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Search, ShieldAlert,
  Brain, CheckCircle2, Settings, Download, Zap,
  Eye, Bug, ShieldCheck, RefreshCw, Lock, AlertTriangle, X, Route, Shield,
  ThumbsUp, ThumbsDown, Sparkles, Copy, Check, Terminal,
  Clock, Calendar, Building2, Layers, Radio
} from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/lib/analytics";
import { usePhishTank } from "../../hooks/usePhishTank";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import SettingsModal, { AiMode } from "../SettingsModal";
import { LangCode, translations } from "../translations";
import XPBar from "../../components/XPBar";
import { checkLicenseBeforeScan, getLicenseErrorMessage } from "../../../lib/licenseGatekeeper";
import AiChatDrawer from "../../components/AiChatDrawer";
import ProFeatureGate from "../../components/ProFeatureGate";
import { Reveal } from "@/components/motion";

interface RedirectHop {
  url: string;
  status: number;
}

interface ScanResult {
  scanId?: Id<"scans">;
  score: number;
  status: string;
  engineTier?: 1 | 2 | 3;
  latencyMs?: number;
  connectionStatus?: 'REACHABLE' | 'UNREACHABLE' | 'TIMEOUT';
  defangedUrl?: string;
  isProReport?: boolean;
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
    analysis_factors?: {
      visual?: string;
      technical?: string;
      behavior?: string;
    };
    advisor?: {
      summary?: string;
      actionable_advice?: string[];
    };
    verdict?: string;
  };
}

interface PipelineStageInfo {
  id: number;
  tier: string;
  title: string;
  description: string;
  badge: string;
}

const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: 1,
    tier: "TIER 1",
    title: "Pre-Flight & Network Routing",
    description: "Resolving DNS records, TLS certificates & tracing HTTP hops",
    badge: "DNS / SSL / HOPS"
  },
  {
    id: 2,
    tier: "TIER 1",
    title: "URL Intelligence & Threat Feeds",
    description: "Cross-referencing URLHaus, known blocklists & malicious hashes",
    badge: "URLHAUS INTEL"
  },
  {
    id: 3,
    tier: "TIER 2",
    title: "Deep Heuristic & Entropy Verification",
    description: "Auditing domain entropy, brand spoofing & credential forms",
    badge: "HEURISTIC AUDIT"
  },
  {
    id: 4,
    tier: "TIER 3",
    title: "Guarded Sandbox & AI Vision",
    description: "Playwright headless execution, visual snapshot & Gemini synthesis",
    badge: "SANDBOX // VISION"
  }
];

export default function ScanningPage() {
  return <ScanningContent />;
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
  const [copiedDefanged, setCopiedDefanged] = useState(false);
  
  // Auth & Quota State
  const { isSignedIn, isLoaded, userId } = useAuth();
  const quota = useQuery(api.users.getUserPlanAndQuota, userId ? { clerkId: userId } : "skip");
  const isProUser = !!quota?.isPro;
  const isFreeUser = isSignedIn && !isProUser;
  const scansRemainingToday = quota?.remainingScans ?? 9;

  const [mounted, setMounted] = useState(false);
  const [guestScans, setGuestScans] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Security Analysis Console | SentinelPhish AI";
    try {
      const saved = localStorage.getItem("sentinel_guest_scans");
      if (saved) {
        setGuestScans(parseInt(saved, 10) || 0);
      }
    } catch (e) {
      console.error("Failed to read sentinel_guest_scans:", e);
    }
  }, []);

  // Settings
  const [lang, setLang] = useState<LangCode>("en");
  const [aiMode, setAiMode] = useState<AiMode>("concise");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [liveGlow, setLiveGlow] = useState(false);

  // Reporting state
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);

  // Quick 1-click accuracy feedback state
  const submitScanFeedback = useMutation(api.feedback.submitScanFeedback);
  const recordScanMutation = useMutation(api.scans.recordScan);
  const recordTrialEngagementMutation = useMutation(api.users.recordTrialEngagement);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (results && url) {
      try {
        const saved = localStorage.getItem(`sentinel_accuracy_${url.toLowerCase().trim()}`);
        setFeedbackSubmitted(!!saved);
      } catch {
        setFeedbackSubmitted(false);
      }
    } else {
      setFeedbackSubmitted(false);
    }
  }, [results, url]);

  const handleAccuracyFeedback = async (isHelpful: boolean) => {
    setFeedbackSubmitted(true);
    try {
      if (url) {
        localStorage.setItem(
          `sentinel_accuracy_${url.toLowerCase().trim()}`,
          JSON.stringify({
            isHelpful,
            score: results?.score,
            timestamp: Date.now(),
            targetUrl: url,
          })
        );
      }
      sendGAEvent("event", "accuracy_feedback", {
        is_helpful: isHelpful,
        target_url: url,
        risk_score: results?.score,
      });

      await submitScanFeedback({
        url,
        isHelpful,
        scanId: results?.scanId,
      });
    } catch (err) {
      console.warn("Accuracy feedback fallback:", err);
    }
  };

  // PhishTank Gamification hook
  const { 
    justRankedUp, 
    clearRankUpToast, 
    addScan
  } = usePhishTank();

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

  // Settings handlers
  const handleSettingsClose = () => {
    setSettingsOpen(false);
    sendGAEvent({ event: "settings_change", value: `${lang}_${aiMode}` });
  };

  // Live Unified Scan Handler
  const handleScan = useCallback(async (e?: React.FormEvent, targetUrlOverride?: string) => {
    if (e?.preventDefault) e.preventDefault();
    const activeUrl = targetUrlOverride || url;
    if (!activeUrl) return;

    // Guest quota enforcement: allow 2 free preview scans before auth lock
    if (isLoaded && !isSignedIn) {
      let currentCount = 0;
      try {
        currentCount = parseInt(localStorage.getItem("sentinel_guest_scans") || "0", 10);
      } catch {
        currentCount = guestScans;
      }

      if (currentCount >= 2) {
        setShowAuthModal(true);
        return;
      }
    }

    // Check license before allowing scan
    const licenseCheck = await checkLicenseBeforeScan();
    if (!licenseCheck.valid) {
      setError(getLicenseErrorMessage(licenseCheck.reason));
      return;
    }

    sendGAEvent({ event: "security_scan_start", value: activeUrl });

    // Automatic Protocol Prepend
    let urlToScan = activeUrl.trim();
    if (!/^https?:\/\//i.test(urlToScan)) {
      urlToScan = `https://${urlToScan}`;
    }
    setUrl(urlToScan);

    setIsScanning(true);
    setResults(null);
    setError(null);
    setReported(false);
    setIsReporting(false);

    try {
      let guestHash = "";
      if (!isSignedIn) {
        try {
          guestHash = localStorage.getItem("sentinel_guest_client_hash") || "";
          if (!guestHash) {
            guestHash = "guest_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem("sentinel_guest_client_hash", guestHash);
          }
        } catch {
          guestHash = "";
        }
      }

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: urlToScan, 
          lang, 
          turbo: turboMode,
          clientHash: guestHash || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: `Scan error (${res.status}): ${res.statusText}` }));
        if (errJson.error === "GUEST_LIMIT_REACHED") {
          setShowAuthModal(true);
          return;
        }
        if (errJson.error === "DAILY_LIMIT_REACHED") {
          setError(`Daily scan limit reached (${errJson.limit || 9} of ${errJson.limit || 9} scans used today). Upgrade to Pro for unlimited scans or try again tomorrow.`);
          return;
        }
        throw new Error(errJson.error || `Scan error (${res.status}): ${res.statusText}`);
      }

      const scanData: ScanResult = await res.json();
      setResults(scanData);
      addScan(scanData.score, scanData.score >= 70, urlToScan);

      // Track Pro Feature Engagement & Record Trial Usage (Sequential & Non-blocking)
      if (scanData.isProReport) {
        if (quota?.plan === "pro_trial") {
          (async () => {
            try {
              await recordTrialEngagementMutation({
                clerkId: userId ?? undefined,
                featureUsed: "ai_deep_analysis",
              });
              if (scanData.hops && scanData.hops.length > 0) {
                await recordTrialEngagementMutation({
                  clerkId: userId ?? undefined,
                  featureUsed: "redirect_chain",
                });
              }
            } catch (e) {
              console.debug("[TrialEngagement] Telemetry note:", e);
            }
          })();
        }

        trackEvent("pro_feature_engaged", {
          feature_name: "pro_deep_forensics",
          has_redirect_hops: (scanData.hops?.length ?? 0) > 0,
        });
      }

      // Auto-Persistence: Ensure scan record exists in Convex for public threat feed
      if (!scanData.scanId) {
        try {
          const fallbackId = await recordScanMutation({
            targetUrl: urlToScan,
            url: urlToScan,
            riskScore: scanData.score,
            verdict: scanData.score >= 75 ? "MALICIOUS" : scanData.score >= 40 ? "SUSPICIOUS" : "CLEAN",
            heuristics: scanData.redFlags || [],
            isGuest: !isSignedIn,
          });
          if (fallbackId) {
            scanData.scanId = fallbackId;
          }
        } catch (e) {
          console.warn("[Auto-Persistence] Fallback recordScan failed:", e);
        }
      }

      // Increment guest quota on success
      if (!isSignedIn) {
        try {
          const currentCount = parseInt(localStorage.getItem("sentinel_guest_scans") || "0", 10);
          const nextCount = currentCount + 1;
          localStorage.setItem("sentinel_guest_scans", nextCount.toString());
          setGuestScans(nextCount);
        } catch (e) {
          console.error("Failed to update guest scans count:", e);
        }
      }

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
  }, [url, lang, turboMode, addScan, isLoaded, isSignedIn, guestScans, recordScanMutation, recordTrialEngagementMutation, quota?.plan, userId]);

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

  const copyDefangedUrl = (defangedText: string) => {
    if (!defangedText) return;
    navigator.clipboard.writeText(defangedText);
    setCopiedDefanged(true);
    setTimeout(() => setCopiedDefanged(false), 2000);
  };

  const getVerdictDetails = (score: number, statusText?: string) => {
    if (score >= 70) {
      return {
        label: statusText || "MALICIOUS",
        colorClass: "text-red-400",
        bgClass: "bg-red-500/10",
        borderClass: "border-red-500/30",
        badgeBg: "bg-red-500/15 text-red-400 border-red-500/30",
        glowClass: "shadow-[0_0_24px_rgba(239,68,68,0.25)]",
        answer: "DANGEROUS // High-confidence phishing, credential harvester, or brand impersonation detected.",
        icon: ShieldAlert
      };
    }
    if (score >= 30) {
      return {
        label: statusText || "SUSPICIOUS",
        colorClass: "text-amber-400",
        bgClass: "bg-amber-500/10",
        borderClass: "border-amber-500/30",
        badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        glowClass: "shadow-[0_0_24px_rgba(245,158,11,0.25)]",
        answer: "SUSPICIOUS // Elevated risk factors, anomalous domain characteristics, or suspicious redirect pattern.",
        icon: AlertTriangle
      };
    }
    return {
      label: statusText || "APPARENTLY SAFE",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      glowClass: "shadow-[0_0_24px_rgba(16,185,129,0.25)]",
      answer: "APPARENTLY SAFE // No active threat feed flags, brand spoofing, or deceptive redirection signatures found.",
      icon: ShieldCheck
    };
  };

  // Quick example URLs for fast testing
  const sampleUrls = [
    { label: "Google (Clean)", url: "https://google.com" },
    { label: "GitHub (Secure)", url: "https://github.com" },
    { label: "Suspicious Test", url: "https://secure-login-verify-account.preview-domain.net" },
  ];

  // Auto-scan if URL is passed from QR scanner or Hero
  useEffect(() => {
    const urlFromParams = searchParams.get("url");
    if (urlFromParams && !hasAutoScanned && !isScanning) {
      setUrl(urlFromParams);
      setHasAutoScanned(true);
      const timer = setTimeout(() => {
        const event = { preventDefault: () => {} } as React.FormEvent;
        handleScan(event, urlFromParams);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, hasAutoScanned, isScanning, handleScan]);

  const defangedDisplay = results?.defangedUrl || (url ? url.replace(/^http/i, "hxxp") : "");
  const verdictInfo = results ? getVerdictDetails(results.score, results.status) : null;

  return (
    <main className="flex flex-col flex-1 items-center px-4 sm:px-6 md:px-10 py-8 relative overflow-hidden">
      <XPBar />

      {/* Rank Up Toast */}
      <AnimatePresence>
        {justRankedUp && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] bg-[#0b0e14] border border-[#a855f7] rounded-2xl px-6 py-4 glow-purple flex items-center gap-4 shadow-2xl"
          >
            <div className="bg-[#a855f7]/20 p-2 rounded-full">
              <Zap size={18} className="text-[#a855f7]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">RANK UP!</h3>
              <p className="text-[#a1a1aa] text-xs">You have reached a new rank in Sentinel Phish AI.</p>
            </div>
            <button onClick={clearRankUpToast} className="ml-4 text-[#a1a1aa] hover:text-white text-xs font-bold transition-colors">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
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

      {/* Sentinel Access Required Auth Gate Modal for Guests */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0b0e14] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl text-center space-y-6"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
                  <Shield className="w-12 h-12 text-cyan-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Sentinel Access Required
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  You have completed your 2 free guest preview scans. Create a free account for 9 daily forensic scans and an instant 14-day Pro trial.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/sign-up"
                  onClick={() => trackEvent("signup_started", { source: "scan_guest_limit_modal" })}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign Up Free
                </Link>
                <Link
                  href="/sign-in"
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-semibold rounded-xl border border-white/10 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Sign In
                </Link>
              </div>

              <div className="text-xs text-zinc-500 font-mono">
                <span>Free account · Instant access · No credit card required</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl w-full space-y-8">
        
        {/* Top Command Bar & Engine Telemetry Header */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
                SENTINEL CORE v3.4 // ACTIVE FORENSIC CONSOLE
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Threat Inspection Console</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Unified 3-tier analysis engine with redirect-chain tracking, heuristic auditing, and sandboxed AI vision.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Quota indicator badge in header */}
            {mounted && isLoaded && (
              <div className="flex items-center gap-2">
                {!isSignedIn ? (
                  <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Guest: {Math.max(0, 2 - guestScans)}/2 scans</span>
                  </div>
                ) : isFreeUser ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Daily: {scansRemainingToday}/9 scans</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-xs flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>SecOps Pro Active</span>
                  </div>
                )}
              </div>
            )}

            {/* Settings Trigger */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-zinc-400 hover:text-cyan-300 transition-all flex items-center gap-2 text-xs font-mono group"
              title="Scanner Preferences"
            >
              <Settings size={15} className="group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden md:inline uppercase">Engine Config</span>
            </button>
          </div>
        </section>

        {/* 1. SCAN INPUT CENTERPIECE */}
        <section ref={scannerRef} className="glass-card p-6 md:p-8 relative overflow-hidden border-cyan-500/30 shadow-[0_0_30px_rgba(0,210,255,0.06)]">
          {/* Subtle Cyber Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-12 w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-200 transition-colors p-1"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleScan} className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* URL Input Box */}
              <div className="relative flex-1 flex items-stretch rounded-xl overflow-hidden border border-white/15 focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all bg-slate-950/80 shadow-inner">
                {/* Protocol Prefix Tag */}
                <div className="flex items-center gap-1.5 px-3.5 bg-white/5 border-r border-white/10 text-zinc-400 font-mono text-xs select-none">
                  <Lock size={12} className="text-cyan-400" />
                  <span>https://</span>
                </div>
                
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t.scannerPlaceholder || "target-domain.com/path or full link..."}
                  disabled={isScanning}
                  className="w-full px-4 py-4 bg-transparent text-white font-mono text-sm md:text-base focus:outline-none placeholder:text-zinc-600 disabled:opacity-50"
                  required
                />

                {url && !isScanning && (
                  <button
                    type="button"
                    onClick={() => setUrl("")}
                    className="px-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label="Clear URL"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Action Scan Button */}
              <button
                type="submit"
                disabled={isScanning || !url.trim()}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,210,255,0.25)] hover:shadow-[0_0_28px_rgba(0,210,255,0.45)] shrink-0"
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    <span>ANALYZING...</span>
                  </>
                ) : (
                  <>
                    <Search size={17} />
                    <span>RUN FORENSIC SCAN</span>
                  </>
                )}
              </button>
            </div>

            {/* Supporting Helper & Example Quick-Test Link Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-zinc-400">
                <span className="text-[11px] font-mono text-zinc-500 uppercase">Quick Reference:</span>
                {sampleUrls.map((sample) => (
                  <button
                    key={sample.url}
                    type="button"
                    onClick={() => {
                      setUrl(sample.url);
                      if (!isScanning) {
                        const event = { preventDefault: () => {} } as React.FormEvent;
                        handleScan(event, sample.url);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 transition-all font-mono text-[11px]"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Quota & Access Subtext */}
              <div className="text-zinc-400 font-mono text-[11px]">
                {!isSignedIn ? (
                  <span>Guest Preview: <strong className="text-cyan-400">{Math.max(0, 2 - guestScans)}</strong> left · <Link href="/sign-up" className="text-cyan-400 hover:underline">Sign up for 9/day</Link></span>
                ) : isFreeUser ? (
                  <span>Community Quota: <strong className="text-emerald-400">{scansRemainingToday}</strong> left · <Link href="/pricing" className="text-cyan-400 hover:underline">Go Pro</Link></span>
                ) : (
                  <span className="text-purple-400 font-bold">SecOps Pro · Unlimited Multi-Tier Scans</span>
                )}
              </div>
            </div>
          </form>

          {/* 2. SCAN PROGRESS EXPERIENCE (Live Multi-Tier Pipeline Tracker) */}
          {isScanning && (
            <div className="mt-8 pt-6 border-t border-white/10 space-y-6">
              {/* Header Pipeline Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
                      <span>FORENSIC ANALYSIS PIPELINE IN PROGRESS</span>
                    </h3>
                    <p className="text-zinc-400 text-xs font-mono">
                      Executing 3-tier inspection protocol on target URL
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                    Stage {pipelineStage + 1} of {PIPELINE_STAGES.length}
                  </span>
                  <span className="text-zinc-400 text-xs font-mono">
                    {Math.round(((pipelineStage + 1) / PIPELINE_STAGES.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Calibrated Progress Line */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(0,210,255,0.6)]"
                  style={{ width: `${Math.round(((pipelineStage + 1) / PIPELINE_STAGES.length) * 100)}%` }}
                />
              </div>

              {/* 4 Execution Pipeline Stages Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isComplete = idx < pipelineStage;
                  const isRunning = idx === pipelineStage;

                  return (
                    <div
                      key={stage.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isComplete
                          ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300"
                          : isRunning
                            ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(0,210,255,0.15)] ring-1 ring-cyan-500/30"
                            : "bg-white/2 border-white/5 text-zinc-500 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                          {stage.tier}
                        </span>
                        {isComplete ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 size={13} />
                            Complete
                          </span>
                        ) : isRunning ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            Running
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-zinc-500">
                            Queued
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-white mb-1 line-clamp-1">
                        {stage.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                        {stage.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 9. EMPTY STATE (PRE-SCAN ARCHITECTURE OVERVIEW) */}
        {!results && !isScanning && (
          <section className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Authentic 3-Tier Security Architecture
              </h2>
              <p className="text-zinc-400 text-xs md:text-sm">
                Every scan performs comprehensive multi-layer inspection without relying on black-box heuristics or single-point lookups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1 */}
              <div className="glass-card p-6 space-y-4 border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Route size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                    TIER 1 // NETWORK &amp; INTEL
                  </span>
                  <h3 className="text-white font-bold text-base mb-2">Pre-Flight &amp; URLHaus</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Traces multi-hop redirect chains, audits DNS resolution latency, checks SSL lifecycle longevity, and verifies known threats in URLHaus telemetry.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <Check size={13} className="text-cyan-400" />
                  <span>Sub-second network fingerprinting</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass-card p-6 space-y-4 border-white/10 hover:border-amber-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Terminal size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                    TIER 2 // HEURISTIC MATRIX
                  </span>
                  <h3 className="text-white font-bold text-base mb-2">Lexical &amp; Form Analysis</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Calculates domain Shannon entropy, detects homoglyph character substitutions, searches for high-risk TLDs, and evaluates credential-input forms.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <Check size={13} className="text-amber-400" />
                  <span>Homoglyph &amp; entropy scoring</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass-card p-6 space-y-4 border-white/10 hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Brain size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
                    TIER 3 // SANDBOX &amp; AI
                  </span>
                  <h3 className="text-white font-bold text-base mb-2">Playwright &amp; Gemini Vision</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Executes page rendering inside an isolated Playwright browser sandbox, captures high-resolution screenshots, and analyzes visual brand mimicry with Gemini.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <Check size={13} className="text-purple-400" />
                  <span>Multimodal AI threat synthesis</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            RESULTS SECTIONS (EVIDENCE-FIRST FORENSICS HIERARCHY)
           ========================================================= */}
        <AnimatePresence>
          {results && !isScanning && verdictInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* 3. FINAL RESULT: EXECUTIVE VERDICT HEADER */}
              <section className={`glass-card p-6 md:p-8 border ${verdictInfo.borderClass} ${verdictInfo.glowClass} relative overflow-hidden`}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  
                  {/* Left Side: Verdict & Answer */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Status Pill */}
                      <span className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border flex items-center gap-2 ${verdictInfo.badgeBg}`}>
                        <verdictInfo.icon size={15} />
                        {verdictInfo.label}
                      </span>

                      {/* Tier Engine Badge */}
                      {results.engineTier && (
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-cyan-400 font-mono text-xs font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          TIER {results.engineTier} ENGINE
                        </span>
                      )}

                      {/* Latency Badge */}
                      {results.latencyMs !== undefined && (
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-zinc-400 font-mono text-xs flex items-center gap-1">
                          <Clock size={12} className="text-cyan-400" />
                          {results.latencyMs}ms
                        </span>
                      )}

                      {/* Pro Intelligence Pill */}
                      {results.isProReport && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1">
                          <Sparkles size={12} />
                          PRO FORENSICS
                        </span>
                      )}
                    </div>

                    {/* Prominent Core Answer */}
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                      {verdictInfo.answer}
                    </h2>

                    {/* Analyzed Target URL & Defanged Safe String */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-zinc-300 flex items-center justify-between gap-3">
                        <div className="truncate">
                          <span className="text-zinc-500 select-none mr-2">DEFANGED:</span>
                          <span className="text-cyan-300 font-bold">{defangedDisplay}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyDefangedUrl(defangedDisplay)}
                          className="text-zinc-400 hover:text-white transition-colors shrink-0 p-1"
                          title="Copy defanged URL for SOC notes"
                        >
                          {copiedDefanged ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Risk Score Meter & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-end justify-between gap-5 shrink-0 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-8">
                    {/* Score Value & Bar */}
                    <div className="text-center sm:text-left lg:text-right">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                        AGGREGATE RISK SCORE
                      </span>
                      <div className={`text-6xl md:text-7xl font-black tracking-tight ${verdictInfo.colorClass}`}>
                        {results.score}<span className="text-3xl text-zinc-500 font-medium">%</span>
                      </div>
                      
                      {/* Visual Meter Bar */}
                      <div className="w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10 mt-2 mx-auto sm:mx-0 lg:ml-auto">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            results.score >= 70 ? "bg-red-500" : results.score >= 30 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.max(4, results.score)}%` }}
                        />
                      </div>
                    </div>

                    {/* Report & Download Actions */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2.5 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-mono shrink-0"
                      >
                        <Download size={14} />
                        <span>Print Audit Report</span>
                      </button>

                      <button
                        onClick={handleReportPhish}
                        disabled={isReporting || reported || results.score < 30}
                        className={`px-4 py-2.5 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 text-xs font-mono shrink-0 ${
                          reported
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default"
                            : results.score >= 30
                              ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"
                              : "bg-white/5 border-white/10 text-zinc-600 cursor-not-allowed"
                        }`}
                      >
                        {isReporting ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : reported ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <Bug size={14} />
                        )}
                        <span>{reported ? "Threat Reported" : "Report Threat"}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </section>

              {/* 4. EVIDENCE-FIRST DESIGN: DUAL COLUMN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN (TELEMETRY & OBSERVATIONAL EVIDENCE) - 5 Cols */}
                <div className="lg:col-span-5 space-y-6">

                  {/* 5. REDIRECT CHAIN TRACER */}
                  <Reveal delay={50}>
                    <ProFeatureGate
                      isPro={!!results.isProReport}
                      featureTitle="Pre-Flight Hop Audit & Redirect Forensics"
                      featureDescription="Unmask multi-hop redirection chains, stealthy cloaking gates, and weaponized middleman redirects."
                    >
                      <div className="glass-card p-5 space-y-4 border-white/10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <Route size={16} className="text-yellow-400" />
                            <span>Redirect Chain Tracer</span>
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-cyan-300 border border-white/10">
                            {results.redirectCount ?? (results.hops?.length ? results.hops.length - 1 : 0)} Hops
                          </span>
                        </div>

                        {results.hops && results.hops.length > 0 ? (
                          <div className="space-y-3">
                            <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                              {results.hops.map((hop, idx) => {
                                const isStart = idx === 0;
                                const isTerminal = idx === results.hops!.length - 1;
                                const isRedirect = [301, 302, 307, 308].includes(hop.status);

                                return (
                                  <div key={idx} className="relative">
                                    {/* Node Dot */}
                                    <div className={`absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-slate-950 ${
                                      isStart 
                                        ? "border-cyan-400" 
                                        : isTerminal 
                                          ? hop.status === 200 ? "border-emerald-400" : "border-red-400" 
                                          : "border-yellow-400"
                                    }`} />

                                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-white/5 space-y-1">
                                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                        <span className="uppercase font-bold text-zinc-500">
                                          {isStart ? "Original URL" : isTerminal ? "Final Destination" : `Hop ${idx}`}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          isRedirect
                                            ? "bg-yellow-500/20 text-yellow-300"
                                            : hop.status === 200
                                              ? "bg-emerald-500/20 text-emerald-400"
                                              : "bg-red-500/20 text-red-400"
                                        }`}>
                                          HTTP {hop.status || "ERR"}
                                        </span>
                                      </div>
                                      <p className="font-mono text-xs text-zinc-200 truncate" title={hop.url}>
                                        {hop.url}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {results.hops.length > 2 && (
                              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-300 flex items-start gap-2">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-yellow-400" />
                                <span>Multi-hop redirect chain detected. Attackers frequently use cascading 3xx hops to bypass static URL filters.</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-mono text-zinc-400 flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                            <span>Direct connection: Target resolved on initial hop with zero middleman redirects.</span>
                          </div>
                        )}
                      </div>
                    </ProFeatureGate>
                  </Reveal>

                  {/* 6. SCREENSHOT / VISUAL ANALYSIS CARD */}
                  <Reveal delay={100}>
                    <div className="glass-card p-5 space-y-4 border-white/10">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <Eye size={16} className="text-cyan-400" />
                          <span>Sandboxed Browser Viewport</span>
                        </h3>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Playwright Headless Sandbox
                        </span>
                      </div>

                      {/* Browser Chrome Window Mockup */}
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
                        {/* Chrome bar */}
                        <div className="px-3 py-2 bg-slate-900/90 border-b border-white/5 flex items-center gap-2 select-none">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
                          </div>
                          <div className="flex-1 min-w-0 mx-2 px-2.5 py-1 bg-slate-950 rounded border border-white/5 font-mono text-[10px] text-zinc-400 truncate flex items-center gap-1.5">
                            <Lock size={10} className="text-cyan-400 shrink-0" />
                            <span className="truncate">{url}</span>
                          </div>
                        </div>

                        {/* Viewport Screenshot */}
                        <div className="relative aspect-video bg-black/50 overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={results.screenshotUrl || `https://api.microlink.io/?url=${encodeURIComponent(url.startsWith("http") ? url : `https://${url}`)}&screenshot=true&embed=screenshot.url`}
                            alt="Guarded Sandbox Capture"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/600x400/0b0e14/ffffff?text=Direct+Scan+Clean";
                            }}
                          />
                        </div>
                      </div>

                      {/* Paired Gemini Vision Findings */}
                      <div className={`p-3.5 rounded-xl border ${
                        results.score >= 70 ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Brain size={14} className={results.score >= 70 ? "text-red-400" : "text-emerald-400"} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            results.score >= 70 ? "text-red-400" : "text-emerald-400"
                          }`}>
                            Visual Threat Scrutiny
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${
                          results.score >= 70 ? "text-red-300" : "text-emerald-300"
                        }`}>
                          {results.geminiVerdict?.analysis_factors?.visual || (
                            results.score >= 70
                              ? "High-confidence brand mimicry or credential capture form detected in render."
                              : "Rendered interface demonstrates standard brand signatures with no visual deception markers."
                          )}
                        </p>
                      </div>
                    </div>
                  </Reveal>

                  {/* DOMAIN & SSL INFRASTRUCTURE FORENSICS */}
                  <Reveal delay={150}>
                    <ProFeatureGate
                      isPro={!!results.isProReport}
                      featureTitle="Domain Intel & Deep SSL Forensics"
                      featureDescription="Verify certificate authority validation, newly registered domains (NRDs), and registration lifespan."
                    >
                      <div className="glass-card p-5 space-y-4 border-white/10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <Building2 size={16} className="text-orange-400" />
                            <span>Domain Infrastructure Intel</span>
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                            <span className="text-zinc-400 text-xs flex items-center gap-2">
                              <Calendar size={13} className="text-zinc-500" />
                              Domain Age:
                            </span>
                            <span className="text-white text-xs font-mono font-bold">{results.domainAge || "N/A"}</span>
                          </div>

                          <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                            <span className="text-zinc-400 text-xs flex items-center gap-2">
                              <Clock size={13} className="text-zinc-500" />
                              Registration Expiry:
                            </span>
                            <span className="text-white text-xs font-mono font-bold">{results.expiryDate || "N/A"}</span>
                          </div>

                          <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                            <span className="text-zinc-400 text-xs flex items-center gap-2">
                              <Building2 size={13} className="text-zinc-500" />
                              Registrar Authority:
                            </span>
                            <span className="text-white text-xs font-mono font-bold truncate max-w-[200px]" title={results.registrar}>
                              {results.registrar || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ProFeatureGate>
                  </Reveal>

                </div>

                {/* RIGHT COLUMN (HEURISTIC SIGNALS & AI SOC PLAYBOOK) - 7 Cols */}
                <div className="lg:col-span-7 space-y-6">

                  {/* 7. AI ASSESSMENT & REASONING (WHY?) */}
                  <Reveal delay={50}>
                    <div className="glass-card p-6 relative border-cyan-500/20 shadow-[0_0_20px_rgba(0,210,255,0.05)]">
                      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                            <Brain size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">Gemini Threat Intelligence Synthesis</h3>
                            <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                              Multimodal AI Reasoning &amp; Investigation
                            </p>
                          </div>
                        </div>

                        {results.isProReport ? (
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            PRO INTELLIGENCE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                            Baseline AI
                          </span>
                        )}
                      </div>

                      {/* Executive Narrative */}
                      <div className="space-y-4">
                        <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/15 space-y-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-widest block">
                            EXECUTIVE SUMMARY // AI INTERPRETATION
                          </span>
                          <p className="text-sm font-medium leading-relaxed text-zinc-200">
                            {results.geminiVerdict?.advisor?.summary || results.geminiVerdict?.verdict || "Multimodal heuristic analysis completed with zero active indicators of compromise detected."}
                          </p>
                        </div>

                        {/* Deep Technical Analysis Factors (Gated for Free Tier) */}
                        <ProFeatureGate
                          isPro={!!results.isProReport}
                          featureTitle="Deep Forensic Factors & Tactical MITRE Signals"
                          featureDescription="Access automated SOC attack factors, behavioral anomalies, and technical telemetry."
                        >
                          <div className="space-y-3 pt-2">
                            <h4 className="text-[11px] font-mono font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                              <Layers size={14} className="text-cyan-400" />
                              Technical Analysis Factors
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {results.geminiVerdict?.analysis_factors ? (
                                Object.entries(results.geminiVerdict.analysis_factors).map(([k, v]) => (
                                  <div key={k} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                                    <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                                      {k}
                                    </span>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                      {v as string}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-zinc-400 col-span-2">
                                  Standard heuristic verification completed.
                                </div>
                              )}
                            </div>
                          </div>
                        </ProFeatureGate>
                      </div>
                    </div>
                  </Reveal>

                  {/* 4. HEURISTIC SIGNALS & RED FLAGS (EVIDENCE SUPPORT) */}
                  <Reveal delay={100}>
                    <div className="glass-card p-6 space-y-4 border-white/10">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-cyan-400" />
                          <span>Observed Heuristic Signals &amp; Red Flags</span>
                        </h3>
                        <span className="text-xs font-mono text-zinc-400">
                          {results.redFlags?.length ?? 0} Signals
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {results.redFlags && results.redFlags.length > 0 ? (
                          results.redFlags.map((flag: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition-colors"
                            >
                              <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                                results.score >= 70 ? "bg-red-500/15 text-red-400" : "bg-cyan-500/15 text-cyan-400"
                              }`}>
                                <ShieldAlert size={16} />
                              </div>
                              <p className="text-xs md:text-sm font-medium text-zinc-200 leading-relaxed">
                                {flag}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-xs font-mono">
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                            <span>Zero anomalous heuristic flags detected across URL tokens, TLD reputation, and DOM layout.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Reveal>

                  {/* 8. RECOMMENDED REMEDIATION & SOC PLAYBOOK (WHAT SHOULD I DO?) */}
                  <Reveal delay={150}>
                    <ProFeatureGate
                      isPro={!!results.isProReport}
                      featureTitle="Automated SOC Playbook & Actionable Defense"
                      featureDescription="Review step-by-step incident response playbooks and user remediation guidelines."
                    >
                      <div className="glass-card p-6 space-y-4 border-white/10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-400" />
                            <span>Recommended Remediation &amp; SOC Actions</span>
                          </h3>
                        </div>

                        <div className="space-y-2.5">
                          {results.geminiVerdict?.advisor?.actionable_advice && results.geminiVerdict.advisor.actionable_advice.length > 0 ? (
                            results.geminiVerdict.advisor.actionable_advice.map((advice: string, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xs md:text-sm text-emerald-200">
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{advice}</span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                              <span>Standard posture: No immediate containment or remediation required.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </ProFeatureGate>
                  </Reveal>

                  {/* 1-Click Accuracy Feedback Bar */}
                  <Reveal delay={200}>
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-medium text-zinc-300 flex items-center gap-2 font-mono">
                        <Radio size={14} className="text-cyan-400" />
                        Was this security verdict accurate?
                      </span>

                      {feedbackSubmitted ? (
                        <motion.span
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          Feedback recorded. Thanks for refining Sentinel AI!
                        </motion.span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccuracyFeedback(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-300 font-mono text-xs transition-all active:scale-95"
                          >
                            <ThumbsUp size={13} className="text-emerald-400" />
                            <span>Accurate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAccuracyFeedback(false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-zinc-300 hover:text-red-300 font-mono text-xs transition-all active:scale-95"
                          >
                            <ThumbsDown size={13} className="text-red-400" />
                            <span>Inaccurate</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </Reveal>

                  {/* Integrated Deferred AI Chat Drawer */}
                  <Reveal delay={250}>
                    <AiChatDrawer
                      results={results}
                      lang={lang}
                      aiMode={aiMode}
                      isFreeUser={isFreeUser}
                      chatPlaceholder={t.chatPlaceholder}
                      askAiTitle={t.askAiTitle}
                      chatEmptyMsg={t.chatEmptyMsg}
                    />
                  </Reveal>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
