"use client";

import { useConvexAuth } from "@/hooks/useConvexAuth";
import { Shield, Lock } from "lucide-react";
import { ReactNode } from "react";

interface LoginGuardProps {
  children: ReactNode;
}

export function LoginGuard({ children }: LoginGuardProps) {
  const { isLoaded, isAuthenticated } = useConvexAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-[#fafafa] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10">
              <Shield className="w-16 h-16 text-blue-400" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Sentinel Access Required
            </h1>
            <p className="text-zinc-400">
              Please sign in to access the Sentinel Phish dashboard
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center justify-center gap-3 text-zinc-300">
              <Lock className="w-5 h-5" />
              <span>Authentication Required</span>
            </div>
          </div>

          <div className="text-sm text-zinc-500">
            <p>Your data is secure and encrypted</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
