"use client";

import { SignUp } from "@clerk/nextjs";
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

          <SignUp appearance={{
            elements: {
              card: "bg-transparent shadow-none",
              header: "hidden", // Hide clerk header since we have our own
              formButtonPrimary: "bg-[#00d2ff] hover:bg-[#00d2ff]/90 text-black font-black w-full py-4 rounded-xl",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
              formFieldLabel: "text-zinc-500 font-black uppercase text-[10px] tracking-widest pl-1",
              formFieldInput: "w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all text-sm font-medium text-white placeholder:text-zinc-600",
              footerActionText: "text-zinc-500",
              footerActionLink: "text-[#00d2ff] hover:underline font-bold",
            }
          }} />
        </div>
      </motion.div>
    </main>
  );
}
