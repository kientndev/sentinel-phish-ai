"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppContext } from "../../context/AppContext";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        login(formData.username);
        toast.success("Welcome, " + formData.username + "! Account created successfully.");
        setFormData({ username: "", email: "", password: "" });
        router.push("/scanning");
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all text-sm font-medium text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all text-sm font-medium text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all text-sm font-medium text-white placeholder:text-zinc-600"
                />
              </div>
              <p className="text-[10px] text-zinc-500 pl-1">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#00d2ff] hover:bg-[#00d2ff]/90 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,210,255,0.3)]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Establish Identity
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Already a member?{" "}
            <Link href="/login" className="text-[#00d2ff] hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
