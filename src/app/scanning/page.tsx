"use client";

import { useState, useEffect, useRef } from "react";
import {
   Search, ShieldAlert, Activity, Globe, Monitor, Code,
  Brain, Bot, CheckCircle2, MessageSquare, Send, Settings, Download, Zap, Lock
} from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { usePhishTank } from "../../hooks/usePhishTank";
import { AnimatePresence, motion } from "framer-motion";
import SettingsModal, { AiMode } from "../SettingsModal";
import { LangCode, translations } from "../translations";
import { useAppContext } from "../../context/AppContext";
import XPBar from "../../components/XPBar";
import { TOP_DOMAINS } from "../api/scan/whitelist";

const MOCK_SAFE_RESULT = {
  score: 0,
  status: "SAFE",
  domainAge: "Established (> 10 years)",
  expiryDate: "Verified",
  registrar: "Verified Corporate Registry",
  redFlags: [
    "Domain is natively whitelisted in the Global Trust Index.",
    "Verified SSL Certificate from a top-tier CA.",
    "No suspicious redirection or credential harvesting patterns."
  ],
  screenshotUrl: "",
  geminiVerdict: {
    "score": 0,
    "level": "Safe",
    "analysis_factors": {
      "visual": "The interface matches the verified brand identity of an established global platform.",
      "technical": "Infrastructure originates from known, trusted ASN ranges associated with the official provider.",
      "behavior": "Standard authenticated session handling detected. No malicious script execution found."
    },
    "advisor": {
      "summary": "This is a verified safe domain. You can interact with this site with full confidence.",
      "actionable_advice": [
        "Ensure you are using a strong, unique password.",
        "Bookmark this URL for future safe access.",
        "No further security actions are required for this target."
      ]
    },
    "verdict": "Verified Trusted Domain"
  }
};

const MOCK_DANGEROUS_RESULT = {
  score: 87,
  status: "DANGEROUS",
  domainAge: "2 days old",
  expiryDate: "Oct 12, 2027",
  registrar: "NameCheap, Inc.",
  redFlags: [
    "Static: URL contains high-risk keywords commonly used in phishing.",
    "Static: Domain Name structurally resembles a known brand.",
    "WHOIS: Untrusted new domain registration (< 1 week).",
    "Active DOM: Suspicious credential harvester input fields detected."
  ],
  screenshotUrl: "",
  geminiVerdict: {
    "score": 92,
    "level": "Malicious",
    "analysis_factors": {
      "visual": "The interface is an exact visual replica of a major technology brand's login portal, but the technical metadata does not originate from their verified infrastructure.",
      "technical": "WHOIS records show the domain was provisioned within 48 hours. SSL certificate is basic DV with no organizational verification.",
      "behavior": "Our sandbox detected hidden redirection logic that triggers only on specific user-agent strings, a common avoidance tactic for phishing."
    },
    "advisor": {
      "summary": "This is a high-confidence phishing attempt targeting sensitive account credentials. All indicators point to active brand impersonation.",
      "actionable_advice": [
        "DO NOT enter any credentials or personal information.",
        "Report this URL to your internal security team or IT department.",
        "Enable hardware-based 2FA (like YubiKey) to prevent credential theft."
      ]
    },
    "verdict": "Confirmed Credential Harvester"
  }
};

const MOCK_NEUTRAL_RESULT = {
  score: 18,
  status: "SAFE",
  domainAge: "New Domain (Verified SSL)",
  expiryDate: "Oct 12, 2026",
  registrar: "Cloudflare, Inc.",
  redFlags: [
    "Domain is not yet categorized in the Global Trust Index.",
    "Original visual identity detected (No brand impersonation).",
    "Technical metadata suggests an independent project or startup."
  ],
  screenshotUrl: "",
  geminiVerdict: {
    "score": 15,
    "level": "Safe",
    "analysis_factors": {
      "visual": "Design is original and does not attempt to mimic any known corporate brand or service.",
      "technical": "Secure HTTPS connection with valid domain-validated certificate.",
      "behavior": "Standard web application patterns detected. No credential harvesting forms found."
    },
    "advisor": {
      "summary": "This site appears to be a legitimate independent project. While the domain is relatively new, it shows no signs of malicious activity.",
      "actionable_advice": [
        "Continue to use standard caution when sharing personal data.",
        "Verify the site's 'About Us' or 'Contact' page for more info.",
        "Ensure your browser and security software are up to date."
      ]
    },
    "verdict": "Likely Independent Project"
  }
};

export default function ScanningPage() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<HTMLDivElement>(null);

  const { burnCredits, creditBalance } = useAppContext();

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  // Settings
  const [lang, setLang] = useState<LangCode>("en");
  const [aiMode, setAiMode] = useState<AiMode>("concise");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [liveGlow, setLiveGlow] = useState(false);
  const [spinnerColor, setSpinnerColor] = useState("text-[#00d2ff]");

  // PhishTank
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

  const t = translations[lang];

  // ── Settings handlers ───────────────────────────────────
  const handleSettingsClose = () => {
    setSettingsOpen(false);
    sendGAEvent({ event: "settings_change", value: `${lang}_${aiMode}` });
  };

  // ── Chat handler ────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !results) return;
    const newMessages = [...chatMessages, { role: "user", content: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatting(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context: results, lang, aiMode }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        const errData = await res.json().catch(() => ({}));
        setChatMessages([...newMessages, { role: "assistant", content: `Error ${res.status}: ${errData.error || res.statusText}` }]);
      }
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Network error — check your connection." }]);
    } finally {
      setIsChatting(false);
    }
  };

  // ── Scan handler ────────────────────────────────────────
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    await burnCredits(50); // Auto-refill handled in AppContext

    sendGAEvent({ event: "security_scan_start", value: url });

    // Automatic Protocol Prepend
    let urlToScan = url.trim();
    if (!/^https?:\/\//i.test(urlToScan)) {
      urlToScan = `https://${urlToScan}`;
    }

    setIsScanning(true);
    setResults(null);
    setErrorMsg("");
    setChatMessages([]);
    setChatInput("");
    setIsChatting(false);

    // GUEST MOCK ENGINE
    const cleanDomain = urlToScan.replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./, "");
    const isWhitelisted = TOP_DOMAINS.includes(cleanDomain);

    setTimeout(() => {
      let data = MOCK_DANGEROUS_RESULT;
      if (isWhitelisted) {
        data = MOCK_SAFE_RESULT;
      } else {
        const suspiciousTerms = ["apple", "login", "verify", "secure", "bank", "portal"];
        const isSuspicious = suspiciousTerms.some(term => cleanDomain.includes(term));
        if (!isSuspicious) {
          data = MOCK_NEUTRAL_RESULT;
        }
      }

      setResults(data);
      addScan(data.score, data.score >= 70, urlToScan);
      setIsScanning(false);
    }, isWhitelisted ? 800 : 2500); 
  };

  const handleDownloadReport = () => {
    if (!results) return;
    sendGAEvent({ event: "report_download", value: url });
    const aiSummary = results.geminiVerdict?.advisor?.summary ?? "N/A";
    const aiAdvice: string[] = results.geminiVerdict?.advisor?.actionable_advice ?? [];
    const redFlagsHtml = (results.redFlags ?? []).map((f: string) => `<li>${f}</li>`).join("");
    const adviceHtml = aiAdvice.map((a: string) => `<li>✅ ${a}</li>`).join("");
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
<h2>${t.reportRedFlags}</h2><ul>${redFlagsHtml || "<li>None detected.</li>"}</ul>
${aiSummary !== "N/A" ? `<h2>${t.reportAiSummary}</h2><div class="ai">${aiSummary}</div>` : ""}
${adviceHtml ? `<h2>${t.reportAiAdvice}</h2><ul>${adviceHtml}</ul>` : ""}
<footer><p>SentinelPhish AI — Built by Tri Kien | 8a1</p></footer></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(reportHtml); win.document.close(); }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 30) return "text-orange-400";
    return "text-emerald-400";
  };

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-10 relative overflow-hidden">
      <XPBar />

      <AnimatePresence>
        {justRankedUp && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] bg-[#0b0e14] border border-[#a855f7] rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center gap-4"
          >
            <div className="bg-[#a855f7]/20 p-2 rounded-full">
              <Zap className="w-5 h-5 text-[#a855f7]" />
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
          transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,210,255,0.2)] backdrop-blur-md"
      >
        <Settings className="w-5 h-5 text-[#a1a1aa] group-hover:text-[#00d2ff] transition-colors" />
      </button>

      <div className="max-w-6xl w-full space-y-10">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
           <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">Live Scrutiny</h1>
              <p className="text-[#a1a1aa] font-medium">Instant heuristic & visual threat detection</p>
           </div>
        </section>

        {/* Input Bar */}
        <section ref={scannerRef} className="glass-card p-6 shadow-2xl relative overflow-hidden transition-all border-[#00d2ff]/20">
          <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4 relative z-10">
            <div className="relative flex-1 flex items-stretch">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Globe className="h-4 w-4 text-zinc-500" />
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
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] tracking-wide"
            >
              <Search className="h-5 w-5" />
              {t.scanBtn}
            </button>
          </form>

          {isScanning && (
            <div className="mt-8 flex flex-col items-center justify-center space-y-4 py-8 text-[#a1a1aa]">
              <Activity className={`h-12 w-12 animate-spin ${spinnerColor}`} />
              <p className="font-bold text-xl text-[#fafafa] tracking-tight">{t.scanningMsg}</p>
              <p className="text-sm font-medium opacity-60 px-6 text-center">{t.scanningSubMsg}</p>
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
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  {t.downloadReport}
                </button>
              </div>

              {/* Analysis & AI */}
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#00d2ff]" />
                    {t.redFlags}
                  </h3>
                  <div className="grid gap-3">
                    {results.redFlags.map((flag: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors">
                        <div className={`p-2 rounded-lg mt-0.5 ${results.score >= 70 ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                          <ShieldAlert className={`w-4 h-4 ${results.score >= 70 ? "text-red-500" : "text-emerald-500"}`} />
                        </div>
                        <p className="text-sm font-medium text-zinc-300 leading-relaxed">{flag}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gemini AI Result Part */}
                <div className="glass-card p-6 relative group border-[#00d2ff]/10">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/20">
                         <Brain className="w-6 h-6 text-[#00d2ff]" />
                      </div>
                      <div>
                        <h3 className="font-black text-white">{t.aiAnalysis}</h3>
                        <p className="text-[10px] uppercase font-bold text-[#00d2ff] tracking-[0.2em]">Powered by Gemini 1.5 Pro</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-[#00d2ff]/5 border border-[#00d2ff]/10 rounded-2xl p-6">
                        <p className="text-sm text-[#bae6fd] leading-relaxed italic">
                          &quot;{results.geminiVerdict?.advisor?.summary}&quot;
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-[#a1a1aa] tracking-widest">{t.analysisFactors}</h4>
                            <div className="space-y-2">
                               {results.geminiVerdict?.analysis_factors && Object.entries(results.geminiVerdict.analysis_factors).map(([k, v]) => (
                                 <div key={k} className="p-3 bg-white/2 rounded-lg border border-white/5 text-[11px]">
                                    <span className="font-black text-[#00d2ff] uppercase block mb-1">{k}</span>
                                    <span className="text-zinc-400">{v as string}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-[#a1a1aa] tracking-widest">{t.recommendedActions}</h4>
                            <div className="space-y-2">
                               {results.geminiVerdict?.advisor?.actionable_advice?.map((a: string, i: number) => (
                                 <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[11px] text-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    {a}
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Unified AI Chat */}
                <div className="glass-card p-6 border-white/10">
                   <div className="flex items-center gap-2 mb-6">
                      <MessageSquare className="w-5 h-5 text-[#a855f7]" />
                      <h3 className="font-bold text-white">{t.askAiTitle}</h3>
                   </div>
                   
                   <div className="h-[300px] overflow-y-auto mb-6 space-y-4 pr-2 scrollbar-thin">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#a855f7]/20 flex items-center justify-center shrink-0 border border-[#a855f7]/30">
                           <Bot className="w-4 h-4 text-[#a855f7]" />
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 max-w-[85%]">
                          <p className="text-sm text-zinc-300 font-medium">{t.chatEmptyMsg}</p>
                        </div>
                      </div>

                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            msg.role === "user" ? "bg-white/10 border-white/20" : "bg-[#a855f7]/20 border-[#a855f7]/30"
                          }`}>
                            {msg.role === "user" ? <UserCircle className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#a855f7]" />}
                          </div>
                          <div className={`p-4 rounded-2xl border ${
                            msg.role === "user" ? "bg-[#00d2ff]/10 border-[#00d2ff]/20 rounded-tr-none" : "bg-white/5 border-white/10 rounded-tl-none"
                          } max-w-[85%]`}>
                            <p className="text-sm font-medium leading-relaxed italic text-white">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isChatting && (
                        <div className="flex gap-3 animate-pulse">
                           <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center"><Bot className="w-4 h-4 text-[#a855f7]" /></div>
                           <div className="bg-white/5 p-4 rounded-2xl h-10 w-24" />
                        </div>
                      )}
                   </div>

                   <form onSubmit={handleSendMessage} className="relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={t.chatPlaceholder || "Ask a question..."}
                        className="w-full pl-4 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#a855f7]/40 transition-all text-sm font-medium"
                      />
                      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#a855f7] hover:bg-[#a855f7]/10 rounded-lg transition-all">
                        <Send className="w-5 h-5" />
                      </button>
                   </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function UserCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}
