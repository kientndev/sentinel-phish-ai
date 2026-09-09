"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Mail, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: string;
  source?: string;
}

export default function WaitlistModal({
  isOpen,
  onClose,
  plan = "PRO_SECOPS",
  source = "pricing_modal",
}: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const joinWaitlist = useMutation(api.waitlist.join);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setErrorMessage(null);
      setEmail("");
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await joinWaitlist({
        email: email.trim(),
        plan,
        source,
      });

      if (result.success) {
        trackEvent("subscription_completed", {
          plan,
          source,
        });
        setIsSuccess(true);
      } else {
        setErrorMessage("Unable to join waitlist. Please try again.");
      }
    } catch (error) {
      console.error("Waitlist submission error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            className="relative w-full max-w-md bg-[#0A0F1D]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-[#fafafa] overflow-hidden"
          >
            {/* Ambient Purple/Cyan Glow */}
            <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-[#a855f7]/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 bg-[#00d2ff]/10 rounded-full blur-3xl" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>

            {isSuccess ? (
              /* Success Confirmation State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4 relative z-10"
              >
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-400 font-bold tracking-wider uppercase">
                    Early Access Locked
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    You&apos;re on the list!
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    We&apos;ll notify you at <span className="text-white font-mono">{email}</span> when beta slots open, with your 50% lifetime discount applied.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold text-white transition-colors uppercase tracking-wider"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              /* Input Form State */
              <div className="relative z-10 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#00d2ff]/20 to-[#a855f7]/20 border border-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="w-7 h-7 text-[#00d2ff]" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Request Early Access
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    SecOps Pro is launching soon. Join the early-access list to lock in <span className="text-[#00d2ff] font-bold">50% lifetime pricing</span> ($15/mo vs $29/mo).
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your security email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#00d2ff]/50 focus:ring-1 focus:ring-[#00d2ff]/40 text-xs sm:text-sm text-white placeholder:text-zinc-500 transition-all font-mono"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-red-400 font-mono text-center">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-95 hover:shadow-[0_0_20px_rgba(0,210,255,0.35)] transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reserving Access...</span>
                      </>
                    ) : (
                      "Lock In 50% Lifetime Rate"
                    )}
                  </button>
                </form>

                <p className="text-[10px] text-zinc-500 text-center font-mono uppercase tracking-widest">
                  Zero spam · Unsubscribe anytime · Automated deployment alerts
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
