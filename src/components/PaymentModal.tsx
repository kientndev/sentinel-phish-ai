"use client";

import { useState } from "react";
import { X, QrCode, Copy, Clock, Users, Zap, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type PaymentPlan = "Pro" | "Premium";

interface Props {
  plan: PaymentPlan | null;
  onClose: () => void;
}

const accent = {
  Pro: {
    border:   "border-[#00d2ff]/40",
    glow:     "shadow-[0_0_50px_rgba(0,210,255,0.2)]",
    text:     "text-[#00d2ff]",
    badge:    "bg-[#00d2ff]/15 border-[#00d2ff]/30 text-[#00d2ff]",
    icon:     <Zap className="w-4 h-4" />,
    price:    "$4",
    credits:  "5,000+",
  },
  Premium: {
    border:   "border-[#a855f7]/40",
    glow:     "shadow-[0_0_50px_rgba(168,85,247,0.2)]",
    text:     "text-[#a855f7]",
    badge:    "bg-[#a855f7]/15 border-[#a855f7]/30 text-[#a855f7]",
    icon:     <Flame className="w-4 h-4" />,
    price:    "$6.85",
    credits:  "Unlimited",
  },
} as const;

function getSentinelId(): string {
  if (typeof window === "undefined") return "SNTL-XXXXXX";
  const raw = navigator.userAgent + navigator.language + screen.width;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return "SNTL-" + Math.abs(hash).toString(16).toUpperCase().slice(0, 6);
}

export default function PaymentModal({ plan, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!plan) return null;
  const a = accent[plan];
  const sentinelId = getSentinelId();

  const handleCopy = () => {
    navigator.clipboard.writeText(sentinelId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {plan && (
        <motion.div
          key="payment-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60"
          onClick={onClose}
        >
          <motion.div
            key="payment-panel"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-2xl border bg-[#0b0e14]/95 backdrop-blur-2xl p-8 flex flex-col gap-6
              ${a.border} ${a.glow}`}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#a1a1aa] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <div className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-4 ${a.badge}`}>
                {a.icon}
                <span>{plan} Plan · {a.price}/mo</span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">
                Upgrade to <span className={a.text}>{plan}</span> Sentinel
              </h2>
            </div>

            {/* Body */}
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
              We are currently in{" "}
              <span className="text-white font-semibold">Early Access</span> for the Vietnam region.
              To upgrade and claim your{" "}
              <span className={`font-bold ${a.text}`}>{a.credits}</span> credits, please scan the
              MoMo / ZaloPay QR code below and include your{" "}
              <span className="text-white font-semibold">Sentinel ID</span> in the transaction note.
            </p>

            {/* QR Placeholder */}
            <div className={`rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-3 ${a.border} bg-white/3`}>
              <QrCode className={`w-10 h-10 ${a.text}`} />
              {/* ↓ Replace this div with: <img src="/momo-qr.png" className="w-40 h-40 rounded-xl object-contain" /> */}
              <div className="w-40 h-40 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-center">
                <span className="text-[#52525b] text-xs font-mono px-2 leading-relaxed">
                  [ QR Code ]<br />Drop your image here
                </span>
              </div>
              <p className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold">MoMo · ZaloPay</p>
            </div>

            {/* Sentinel ID */}
            <div>
              <p className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold mb-2">
                Your Sentinel ID (include in payment note)
              </p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                <span className="font-mono text-white font-bold flex-1 tracking-widest">{sentinelId}</span>
                <button
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg border transition-all ${
                    copied
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                      : "border-white/10 bg-white/5 text-[#a1a1aa] hover:text-white"
                  }`}
                  title="Copy ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copied && <p className="text-emerald-400 text-xs mt-1.5 font-medium">✓ Copied to clipboard</p>}
            </div>

            <div className="border-t border-white/8" />

            {/* Social proof */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Manual activation usually takes{" "}
                <span className="text-white font-semibold ml-1">less than 15 minutes</span>.
              </div>
              <div className="flex items-center gap-2 bg-white/3 rounded-xl px-4 py-3 border border-white/8">
                <Users className="w-4 h-4 text-[#a1a1aa] shrink-0" />
                <p className="text-[#a1a1aa] text-xs italic">
                  &ldquo;Join the elite network of{" "}
                  <span className={`font-bold not-italic ${a.text}`}>1,402,041+</span> threats
                  stopped.&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
