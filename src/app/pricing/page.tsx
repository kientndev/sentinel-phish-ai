"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Lock,
  Radio,
  FileSpreadsheet,
  Webhook,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import WaitlistModal from "../../components/WaitlistModal";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { user, isLoaded, isSignedIn } = useUser();
  const quota = useQuery(api.users.getUserPlanAndQuota, user?.id ? { clerkId: user.id } : "skip");
  const activateTrialMutation = useMutation(api.users.activateTrial);

  const [isActivating, setIsActivating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  const handleActivateTrial = async () => {
    if (!user?.id) return;
    setIsActivating(true);
    setTrialError(null);
    try {
      const res = await activateTrialMutation({ clerkId: user.id });
      if (res.success) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 7000);
      } else if (res.reason === "ALREADY_USED") {
        setTrialError("You have already used your 14-day Pro trial.");
      }
    } catch (err: unknown) {
      setTrialError(err instanceof Error ? err.message : "Failed to activate trial");
    } finally {
      setIsActivating(false);
    }
  };

  useEffect(() => {
    document.title = "Pricing & Plans | SentinelPhish";
  }, []);

  const isProTrialActive = quota?.plan === "pro_trial" && quota?.isPro;
  const trialDaysRemaining = quota?.trialDaysRemaining ?? 14;

  const faqs = [
    {
      q: "How accurate is the heuristic detection?",
      a: "SentinelPhish combines multi-vector behavioral heuristics, DOM entropy analysis, typosquatting/homograph detectors, and real-time community consensus verification. Rather than relying solely on lagging signature blocklists, our engine flags zero-day phishing infrastructure and newly registered weaponized redirects within milliseconds.",
    },
    {
      q: "Do you store the URLs I scan?",
      a: "URLs analyzed by SentinelPhish are stripped of private user session tokens and credentials, defanged (e.g., hxxps://...), and indexed purely for collective zero-day threat defense on our public threat feed. Private account identities are never publicly linked to submitted target URLs.",
    },
    {
      q: "When will the developer API be available?",
      a: "The SecOps Pro REST API (POST /api/v1/scan) is currently operating in private beta with select fintech and enterprise security partners. Joining the SecOps Pro waitlist guarantees you immediate rollout access with 10,000 monthly scan requests and locked-in 50% lifetime pricing.",
    },
  ];

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-12 md:py-16 bg-[#0b0e14] relative overflow-hidden text-[#fafafa]">
      {/* Ambient Cyber Grid Glows */}
      <div className="pointer-events-none absolute top-12 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-48 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/8 rounded-full blur-[140px]" />

      {/* Celebration Toast on Trial Activation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0A0F1D] border border-emerald-500/50 rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-4 text-left max-w-lg w-full"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                🎉 14-Day Pro Trial Activated!
              </h4>
              <p className="text-xs text-zinc-400">
                Enjoy full multi-hop forensics, raw DOM heuristics, and deep threat intelligence across all scans.
              </p>
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="text-zinc-400 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl w-full space-y-12 relative z-10">
        {/* Part 1: Header Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">
              Predictable Security Pricing
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Transparent Protection for Individuals &amp; Teams
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-400 font-medium leading-relaxed">
            Choose the level of heuristic intelligence your workflow demands.
          </p>

          {/* Billing Toggle: Monthly / Annual with Save 20% Badge */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span
              className={`text-xs sm:text-sm font-bold transition-colors ${
                !isAnnual ? "text-white" : "text-zinc-400"
              }`}
            >
              Monthly
            </span>

            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors p-0.5 focus:outline-none border ${
                isAnnual
                  ? "bg-[#00d2ff] border-[#00d2ff]"
                  : "bg-white/10 border-white/20"
              }`}
              aria-label="Toggle Billing Frequency"
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  isAnnual ? "translate-x-7 bg-white shadow" : "translate-x-0 bg-white"
                }`}
              />
            </button>

            <span
              className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
                isAnnual ? "text-white" : "text-zinc-400"
              }`}
            >
              <span>Annual</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-black uppercase tracking-wider">
                Save 20%
              </span>
            </span>
          </div>
        </section>

        {/* Part 2: Tier Cards (2-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Tier 1: Community (Active / Free) */}
          <div className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative shadow-xl hover:border-white/20 transition-all group">
            <div className="space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#00d2ff]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Community</h3>
                    <p className="text-xs text-zinc-400">For individual users &amp; developers</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Current Plan
                </span>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">$0</span>
                  <span className="text-zinc-400 text-xs sm:text-sm font-mono">/ month</span>
                </div>
                <p className="text-xs text-zinc-500 font-mono">Free forever · No credit card required</p>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">
                  Included Capabilities:
                </span>
                <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                    <span><strong>10 Real-time URL</strong> heuristic scans / day</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                    <span>Full access to <strong>Community Threat Feed</strong> (/reports)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                    <span>Client-side <strong>QR Shield</strong> &amp; payload inspection</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                    <span>Standard detection engine &amp; defanged threat alerts</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link
                href="/scanning"
                className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all group-hover:border-[#00d2ff]/40"
              >
                <span>Start Scanning</span>
                <ArrowRight className="w-4 h-4 text-[#00d2ff]" />
              </Link>
            </div>
          </div>

          {/* Tier 2: SecOps Pro (Early Access Beta) */}
          <div className="bg-gradient-to-b from-[#0A0F1D] to-[#121124] backdrop-blur-xl rounded-3xl border-2 border-[#a855f7]/40 p-6 sm:p-8 flex flex-col justify-between relative shadow-[0_0_35px_rgba(168,85,247,0.15)] hover:border-[#a855f7]/70 transition-all group">
            {/* Top Badge */}
            {isProTrialActive ? (
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-[#00d2ff] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Pro Trial Active ({trialDaysRemaining}d remaining)</span>
              </div>
            ) : (
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                Early Access Beta
              </div>
            )}

            <div className="space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#a855f7]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">SecOps Pro</h3>
                    <p className="text-xs text-[#a855f7] font-semibold">For security teams &amp; SOC engineers</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                    ${isAnnual ? "12" : "15"}
                  </span>
                  <span className="text-zinc-400 text-xs sm:text-sm font-mono">/ month</span>
                  <span className="text-zinc-500 line-through text-base font-mono ml-1.5">$29</span>
                </div>
                <p className="text-xs text-emerald-400 font-mono font-medium">
                  50% lifetime discount locked in for early access members
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#a855f7] block font-bold">
                  Advanced SecOps Features:
                </span>
                <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                    <span><strong>Unlimited</strong> multi-hop redirect unmasking</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Webhook className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                    <span><strong>Automated alerts</strong> (Discord / Slack / Telegram webhooks)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Radio className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                    <span><strong>REST API Access</strong> (POST /api/v1/scan) with 10k req/mo</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                    <span>One-click <strong>CSV &amp; JSON</strong> Threat Feed exports</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                    <span><strong>Priority heuristics engine</strong> (fast-tracked sandbox processing)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 space-y-2">
              {trialError && (
                <p className="text-xs text-red-400 font-mono text-center">
                  {trialError}
                </p>
              )}

              {isProTrialActive ? (
                <Link
                  href="/scanning"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00d2ff] text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:opacity-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Pro Trial Active ({trialDaysRemaining}d remaining) →</span>
                </Link>
              ) : isLoaded && isSignedIn ? (
                !quota?.trialAlreadyUsed ? (
                  <button
                    type="button"
                    disabled={isActivating}
                    onClick={handleActivateTrial}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isActivating ? "Activating 14-Day Trial..." : "Activate 14-Day Free Trial (No Card Required)"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowWaitlistModal(true)}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Request Early Access</span>
                  </button>
                )
              ) : (
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sign In to Start 14-Day Pro Trial</span>
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>

        {/* Part 4: Mini FAQ Accordion */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <HelpCircle className="w-5 h-5 text-[#00d2ff]" />
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Everything you need to know about SentinelPhish heuristics and plan tiers.
            </p>
          </div>

          <div className="divide-y divide-white/5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left group"
                  >
                    <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#00d2ff] transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 group-hover:text-white transition-transform ${
                        isOpen ? "rotate-180 text-[#00d2ff]" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-2.5 pr-6">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pro Waitlist Modal */}
        <WaitlistModal
          isOpen={showWaitlistModal}
          onClose={() => setShowWaitlistModal(false)}
          plan="PRO_SECOPS"
          source="pricing_modal"
        />
      </div>
    </main>
  );
}
