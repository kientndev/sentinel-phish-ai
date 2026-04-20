"use client";

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = "force-dynamic";

import { UserCircle, Shield, Zap, History, Settings, LogOut, Loader2 } from "lucide-react";
import { usePhishTank, getRankFromXP } from "../../hooks/usePhishTank";
import { useAppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import XPBar from "../../components/XPBar";
import { useUser, UserButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { ClientOnly } from "../../components/ClientOnly";

function ProfileContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const guestStats = usePhishTank();
  const memberStats = useQuery(api.scans.getMyStats) as { totalScans: number; threatsBlocked: number } | undefined;
  const { creditBalance } = useAppContext();

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d2ff]" />
      </div>
    );
  }

  // Use member stats if signed in, otherwise guest stats
  const totalScans = isSignedIn ? (memberStats?.totalScans ?? 0) : guestStats.totalScans;
  const threatsBlocked = isSignedIn ? (memberStats?.threatsBlocked ?? 0) : guestStats.threatsBlocked;
  const userXP = guestStats.userXP; // XP is still local for now as per plan
  const rank = getRankFromXP(userXP);

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-10 relative">
      <XPBar />

      <div className="max-w-4xl w-full">
        <section className="glass-card p-10 mb-8 flex flex-col md:flex-row items-center gap-10">
           <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#00d2ff] to-[#a855f7] p-1 shadow-[0_0_40px_rgba(0,210,255,0.2)]">
                 <div className="w-full h-full bg-[#0b0e14] rounded-[calc(1.5rem-2px)] flex items-center justify-center overflow-hidden">
                    {isSignedIn ? (
                      <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-white italic">G</span>
                    )}
                 </div>
              </div>
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-[#0b0e14] ${isSignedIn ? "bg-[#00d2ff]" : "bg-emerald-500"}`}>
                 <Shield className="w-4 h-4 text-white fill-current" />
              </div>
           </div>

           <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                 <h1 className="text-3xl font-black text-white tracking-tight italic">
                   {isSignedIn ? (user.firstName || user.username) : "Guest Agent"}
                 </h1>
                 <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">
                   Level {rank.level}
                 </span>
              </div>
              <p className="text-[#00d2ff] font-bold text-sm mb-6 px-3 py-1 bg-[#00d2ff]/10 w-fit rounded-lg border border-[#00d2ff]/20">
                {rank.title}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                    <span className="text-[10px] uppercase font-black text-[#52525b] block mb-1">Credits</span>
                    <span className="text-xl font-black text-white">{creditBalance}</span>
                 </div>
                 <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                    <span className="text-[10px] uppercase font-black text-[#52525b] block mb-1">XP</span>
                    <span className="text-xl font-black text-white">{userXP}</span>
                 </div>
                 <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                    <span className="text-[10px] uppercase font-black text-[#52525b] block mb-1">Scans</span>
                    <span className="text-xl font-black text-white">{totalScans}</span>
                 </div>
                 <div className="p-4 rounded-xl bg-white/2 border border-white/5">
                    <span className="text-[10px] uppercase font-black text-[#52525b] block mb-1">Blocked</span>
                    <span className="text-xl font-black text-white font-mono">{threatsBlocked}</span>
                 </div>
              </div>
           </div>
           
           {isSignedIn && (
             <div className="flex flex-col items-center gap-4">
                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12" } }} />
                <span className="text-[10px] font-black uppercase text-zinc-500">Account Managed</span>
             </div>
           )}
        </section>

        <div className="grid md:grid-cols-2 gap-8">
           <section className="glass-card p-6">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 tracking-tight">
                 <Zap className="w-5 h-5 text-yellow-500" />
                 Active Achievements
              </h2>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[#52525b] text-xs font-bold">
                    No badges earned yet.
                 </div>
              </div>
           </section>

           <section className="glass-card p-6">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 tracking-tight">
                 <Settings className="w-5 h-5 text-zinc-500" />
                 {isSignedIn ? "Account Preferences" : "Guest Session Preferences"}
              </h2>
              <div className="space-y-3">
                 <div className="p-3 bg-white/2 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-400 italic">
                      {isSignedIn ? "Synchronize Account" : "Clear Local History"}
                    </span>
                    <button className={`text-[10px] font-black uppercase transition-colors ${isSignedIn ? "text-[#00d2ff] hover:text-[#00d2ff]/80" : "text-red-500 hover:text-red-400"}`}>
                      {isSignedIn ? "SYNC NOW" : "WIPE DATA"}
                    </button>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ClientOnly fallback={
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d2ff]" />
      </div>
    }>
      <ProfileContent />
    </ClientOnly>
  );
}
