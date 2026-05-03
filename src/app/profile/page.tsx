"use client";

import { Shield, Zap, Settings, Loader2, Lock } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppContext } from "../../context/AppContext";
import XPBar from "../../components/XPBar";
import { ClientOnly } from "../../components/ClientOnly";
import { useEffect } from "react";

function ProfileContent() {
  const { user, isLoaded: userLoaded } = useUser();
  const { creditBalance } = useAppContext();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  
  // Fetch user data from Convex
  const convexUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Sync user to Convex on login
  useEffect(() => {
    if (user?.id && userLoaded) {
      getOrCreateUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName || user.firstName || undefined,
        imageUrl: user.imageUrl || undefined,
      });
    }
  }, [user?.id, userLoaded, getOrCreateUser]);

  // Use Convex data or fall back to defaults
  const totalScans = convexUser?.totalScans ?? 0;
  const threatsBlocked = convexUser?.threatsBlocked ?? 0;
  const userXP = convexUser?.xp ?? 0;
  const level = convexUser?.level ?? 1;
  
  // Calculate rank based on XP
  const getRankFromXP = (xp: number) => {
    if (xp < 100) return { level: 1, title: "Novice Scanner" };
    if (xp < 300) return { level: 2, title: "Cyber Guardian" };
    if (xp < 600) return { level: 3, title: "Threat Hunter" };
    if (xp < 1000) return { level: 4, title: "Security Sentinel" };
    return { level: 5, title: "Elite Defender" };
  };
  
  const rank = getRankFromXP(userXP);

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-10 relative">
      <XPBar />

      <div className="max-w-4xl w-full">
        <section className="glass-card p-10 mb-8 flex flex-col md:flex-row items-center gap-10">
           <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#00d2ff] to-[#a855f7] p-1 shadow-[0_0_40px_rgba(0,210,255,0.2)]">
                 <div className="w-full h-full bg-[#0b0e14] rounded-[calc(1.5rem-2px)] flex items-center justify-center overflow-hidden">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-white italic">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0) || "U"}
                      </span>
                    )}
                 </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-[#0b0e14] bg-emerald-500">
                 <Shield className="w-4 h-4 text-white fill-current" />
              </div>
           </div>

           <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                 <h1 className="text-3xl font-black text-white tracking-tight italic">
                   {user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress.split("@")[0] || "Agent"}
                 </h1>
                 <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#a1a1aa]">
                   Level {level}
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
           
           <div className="absolute top-4 right-4">
              <UserButton />
           </div>
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
                 <Lock className="w-5 h-5 text-zinc-500" />
                 Account Security
              </h2>
              <div className="space-y-3">
                 <div className="p-3 bg-white/2 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-400">
                      Manage Account
                    </span>
                    <UserButton appearance={{ elements: { userButtonBox: "w-8 h-8" } }} />
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
