"use client";

import { Check, Zap, Shield, Crown, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-16 relative">
      <div className="max-w-4xl w-full text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 italic tracking-tight">Access Plans</h1>
        <p className="text-[#a1a1aa] font-medium text-lg italic">Choose your level of scrutiny</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
        {/* Guest Plan */}
        <div className="glass-card p-8 border-[#00d2ff]/20 bg-[#00d2ff]/5 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-[#00d2ff]" />
            <h3 className="text-xl font-bold text-white tracking-widest">GUEST</h3>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-black text-white">$0</span>
            <span className="text-[#a1a1aa] ml-2 font-bold">/lifetime</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
               <Check className="w-4 h-4 text-[#00d2ff]" /> Basic Heuristics
             </li>
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
               <Check className="w-4 h-4 text-[#00d2ff]" /> 800 Daily Credits
             </li>
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium text-white/40">
               <Lock className="w-4 h-4" /> AI Security Advisor
             </li>
          </ul>
          <Link href="/scanning" className="w-full py-4 text-center rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] font-bold border border-[#00d2ff]/30 hover:bg-[#00d2ff]/30 transition-all uppercase tracking-widest text-xs">
            Start Scanning
          </Link>
        </div>

        {/* Pro Plan - Locked */}
        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
             <div className="bg-[#0b0e14]/80 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">
                Feature in Development
             </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#a855f7]" />
            <h3 className="text-xl font-bold text-white tracking-widest">PRO</h3>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-black text-white">$24</span>
            <span className="text-[#a1a1aa] ml-2 font-bold">/m</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
               <Check className="w-4 h-4 text-[#a855f7]" /> Advanced Gemini Vision
             </li>
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
               <Check className="w-4 h-4 text-[#a855f7]" /> Infinite Playwright 
             </li>
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
               <Check className="w-4 h-4 text-[#a855f7]" /> Team Collaboration
             </li>
          </ul>
          <button disabled className="w-full py-4 text-center rounded-xl bg-white/5 text-zinc-500 font-bold border border-white/5 uppercase tracking-widest text-xs">
            Locked
          </button>
        </div>
        
        {/* Enterprise - Locked */}
        <div className="glass-card p-8 border-yellow-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
             <div className="bg-[#0b0e14]/80 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">
                Feature in Development
             </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white tracking-widest text-yellow-500">SENTINEL+</h3>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-black text-white">Custom</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
               <Check className="w-4 h-4 text-yellow-500" /> API Access
             </li>
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
               <Check className="w-4 h-4 text-yellow-500" /> White-label Reports
             </li>
             <li className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
               <Check className="w-4 h-4 text-yellow-500" /> 24/7 Priority Support
             </li>
          </ul>
          <button disabled className="w-full py-4 text-center rounded-xl bg-white/5 text-zinc-500 font-bold border border-white/5 uppercase tracking-widest text-xs">
            Locked
          </button>
        </div>
      </div>
    </main>
  );
}
