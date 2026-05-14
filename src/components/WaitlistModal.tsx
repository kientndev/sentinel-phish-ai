"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Mail, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
}

export default function WaitlistModal({ isOpen, onClose, plan }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const joinWaitlist = useMutation(api.waitlist.join);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const result = await joinWaitlist({ email, plan });
      if (result.success) {
        toast.success("Welcome to the elite! We'll notify you soon.");
        onClose();
        setEmail("");
      } else {
        toast.error(result.message || "Failed to join waitlist");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass-card p-8 glow-purple"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#a1a1aa] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#a855f7]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#a855f7]/30">
                <Sparkles className="w-8 h-8 text-[#a855f7]" />
              </div>
              <h2 className="text-2xl font-black text-white italic tracking-tight mb-2">
                JOIN THE WAITLIST
              </h2>
              <p className="text-[#a1a1aa] text-sm">
                Get early access to the <span className="text-[#a855f7] font-bold">{plan}</span> plan features.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#a855f7]/40 transition-all text-white placeholder:text-[#52525b]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Secure Early Access"
                )}
              </button>
            </form>

            <p className="mt-6 text-[10px] text-[#52525b] text-center uppercase tracking-widest">
              By joining, you agree to receive updates via email.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
