"use client";

import Link from "next/link";
import { ShieldAlert, Zap, Globe2, Activity, ArrowRight, Lock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    title: "Real-time Heuristics",
    description: "Analyze URLs with lightning speed. Our engine breaks down threats as they emerge in real-time.",
    glow: "rgba(234,179,8,0.15)",
  },
  {
    icon: <Activity className="w-8 h-8 text-[#00d2ff]" />,
    title: "Deep Analysis",
    description: "Leverage advanced AI to detect visual trickery, brand impersonation, and complex phishing patterns.",
    glow: "rgba(0,210,255,0.15)",
  },
  {
    icon: <Globe2 className="w-8 h-8 text-indigo-400" />,
    title: "Global Threat Network",
    description: "Cross-reference against millions of live threat intelligence data points worldwide.",
    glow: "rgba(99,102,241,0.15)",
  },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col flex-1 items-center px-4 relative overflow-hidden text-[#fafafa]">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/8 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-40 right-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[120px]" />

      {/* ── Hero Section ─────────────────────────────────────── */}
      <motion.section
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-4xl mt-16 mb-20 px-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">Sentinel-SaaS Platform · Live</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-gray-500">
            The World&apos;s First{" "}
          </span>
          <br className="hidden md:block" />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #00d2ff, #a855f7)" }}
          >
            AI-Driven Phishing Shield
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#a1a1aa] mb-10 max-w-2xl mx-auto leading-relaxed">
          High-fidelity AI phishing detection for the modern web. 
          No account required. Scan instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/scanning"
            className="group px-8 py-4 w-full sm:w-auto rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
              bg-[#00d2ff]/15 hover:bg-[#00d2ff]/25 text-[#00d2ff] border border-[#00d2ff]/30
              hover:shadow-[0_0_32px_rgba(0,210,255,0.35)]"
          >
            Start Scanning
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 w-full sm:w-auto rounded-xl font-bold text-lg flex items-center justify-center
              bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            View Dashboard
          </Link>
        </div>
      </motion.section>

      {/* ── Social Proof ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="w-full max-w-6xl border-y border-white/10 py-12 mb-20 bg-black/20 backdrop-blur-sm"
      >
        <p className="text-center text-[#a1a1aa] text-[10px] uppercase font-bold tracking-[0.2em] mb-8">
          Trusted by Security Teams Worldwide
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-12 md:gap-24 text-center">
          {[
            { value: "1,402,041+", label: "Total Scans Protected" },
            { value: "99.9%", label: "Detection Accuracy" },
            { value: "<400ms", label: "Average Analysis Time" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-black text-white mb-1">{value}</div>
              <div className="text-[#a1a1aa] text-sm">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section className="grid md:grid-cols-3 gap-6 max-w-6xl w-full mb-24 px-2">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
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

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-4xl mb-24 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#00d2ff]/5 p-12 text-center"
      >
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4 drop-shadow-[0_0_16px_rgba(239,68,68,0.5)]" />
        <h2 className="text-3xl font-black text-white mb-3">Ready to Defend Your Network?</h2>
        <p className="text-[#a1a1aa] mb-8 max-w-lg mx-auto">
          Join thousands of security professionals using SentinelPhish to stay one step ahead of attackers.
        </p>
        <Link
          href="/scanning"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
            bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all
            hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
        >
          Launch Scanner
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.section>
    </main>
  );
}
