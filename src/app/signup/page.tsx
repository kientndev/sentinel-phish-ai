"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center px-6 relative overflow-hidden min-h-[90vh]">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-10 space-y-8 border-white/5 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">Join Sentinel Network</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
            <p className="text-zinc-400 text-sm">Secure your digital experience today.</p>
          </div>

          <div className="text-center py-8">
            <p className="text-zinc-400 mb-6">Registration is currently disabled. Please continue as a guest.</p>
            <Link href="/" className="inline-block px-8 py-4 bg-[#00d2ff] hover:bg-[#00d2ff]/90 text-black font-black rounded-xl transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
