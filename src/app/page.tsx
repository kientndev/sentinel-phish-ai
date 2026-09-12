"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Zap, 
  Globe2, 
  Activity, 
  Lock, 
  Globe, 
  Search 
} from "lucide-react";
import { motion } from "framer-motion";
import HeroProductPreview from "@/components/home/HeroProductPreview";
import MarketingVideo from "@/components/home/MarketingVideo";
import AnalysisPipeline from "@/components/landing/AnalysisPipeline";
import EvidenceShowcase from "@/components/landing/EvidenceShowcase";
import ThreatFeedPreview from "@/components/landing/ThreatFeedPreview";
import LandingPricing from "@/components/landing/LandingPricing";
import FinalCTA from "@/components/landing/FinalCTA";

const features = [
  {
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    title: "Real-time Heuristics",
    description: "Analyze URLs with lightning speed. Our engine breaks down threats and obfuscations as they emerge.",
    glow: "rgba(234,179,8,0.15)",
  },
  {
    icon: <Activity className="w-8 h-8 text-[#00d2ff]" />,
    title: "Deep Vision Analysis",
    description: "Leverage vision AI to detect brand impersonation, visual trickery, and deceptive DOM elements.",
    glow: "rgba(0,210,255,0.15)",
  },
  {
    icon: <Globe2 className="w-8 h-8 text-indigo-400" />,
    title: "Layered Intelligence",
    description: "Cross-reference against real-time threat intelligence data feeds, DNS anomalies, and redirect chains.",
    glow: "rgba(99,102,241,0.15)",
  },
];

export default function LandingPage() {
  const [heroUrl, setHeroUrl] = useState("");
  const router = useRouter();

  const handleHeroScan = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = heroUrl.trim();
    if (!cleanUrl) return;

    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    router.push(`/scanning?url=${encodeURIComponent(cleanUrl)}`);
  };

  const handleFocusHeroScanner = () => {
    const el = document.getElementById("scanner-input");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const input = document.getElementById("hero-url-input") as HTMLInputElement | null;
    if (input) {
      setTimeout(() => input.focus(), 600);
    }
  };

  return (
    <main className="flex flex-col flex-1 items-center px-4 relative overflow-hidden text-[#fafafa]">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-32 right-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[140px]" />

      {/* ── Product-Led Hero Section ─────────────────────────── */}
      <section className="relative w-full max-w-6xl mx-auto pt-16 pb-12 px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl flex flex-col items-center"
        >
          {/* Badge / Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-cyan-300">
              Instant URL Inspection • No Account Required
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white/95 to-slate-400">
              AI-Powered Phishing Protection
            </span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #00d2ff, #a855f7)" }}
            >
              for the Modern Web
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
            Analyze suspicious links with layered threat intelligence, URL heuristics, headless sandbox analysis, and AI-assisted visual inspection before they reach your team.
          </p>

          {/* Direct URL Scanner Input Form */}
          <form id="scanner-input" onSubmit={handleHeroScan} className="w-full max-w-2xl mx-auto mb-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-2xl shadow-cyan-950/30 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all backdrop-blur-md">
              <div className="flex items-center flex-1 px-3.5 py-2.5 sm:py-1 gap-2.5">
                <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline font-mono text-xs text-slate-500 select-none">https://</span>
                <input
                  id="hero-url-input"
                  type="text"
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="Enter suspicious URL (e.g., auth-verification-portal.net)..."
                  className="w-full bg-transparent text-white placeholder:text-slate-500 font-mono text-sm sm:text-base focus:outline-none"
                  aria-label="Target URL to inspect"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,210,255,0.3)] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Scan URL
              </button>
            </div>

            {/* Sub-input Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                2 Free Guest Scans Included
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span>Layered Threat Intelligence</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span>Zero Software Installation</span>
            </div>
          </form>

          {/* ── Product Preview Visual (Sentinel Analysis Card) ── */}
          <HeroProductPreview />
        </motion.div>
      </section>

      {/* ── Live Product Video Demonstration ───────────────────── */}
      <section className="w-full max-w-5xl mx-auto mt-20 mb-20 px-4 text-center">
        <div className="mb-8">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/5 border border-white/10 text-slate-400 uppercase tracking-widest">
            Platform Demo
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-3 mb-2">
            Automated Headless Sandbox In Action
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            Observe our headless browser navigate intermediate redirect hops and extract DOM heuristics without executing malicious payloads locally.
          </p>
        </div>
        <MarketingVideo />
      </section>

      {/* ── Verified Analysis Pipeline ─────────────────────────── */}
      <AnalysisPipeline />

      {/* ── Evidence-Based Results Showcase ─────────────────────── */}
      <EvidenceShowcase />

      {/* ── Live Threat Telemetry & Community Findings ──────────── */}
      <ThreatFeedPreview />

      {/* ── Core Platform Architecture Features ────────────────── */}
      <section className="grid md:grid-cols-3 gap-6 max-w-6xl w-full mb-24 px-2">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
            className="glass-card p-8 border border-white/5 hover:border-white/15 transition-all duration-300 group"
            style={{ "--glow-color": f.glow } as React.CSSProperties}
          >
            <div className="p-4 bg-white/5 w-fit rounded-2xl mb-6 border border-white/10 group-hover:bg-white/10 transition-colors">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
            <p className="text-[#a1a1aa] leading-relaxed text-sm">{f.description}</p>
          </motion.div>
        ))}
      </section>

      {/* ── Transparent Security Pricing ───────────────────────── */}
      <LandingPricing onStartFreeScan={handleFocusHeroScanner} />

      {/* ── Final Conversion CTA ───────────────────────────────── */}
      <FinalCTA />
    </main>
  );
}
