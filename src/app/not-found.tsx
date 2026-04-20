"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to avoid SSR issues
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0b0e14] text-white">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-[#00d2ff]/10 p-4 flex items-center justify-center border border-[#00d2ff]/20">
          <ShieldAlert className="w-12 h-12 text-[#00d2ff]" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">404</h1>
        <p className="text-[#a1a1aa] text-lg">Page not found</p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-black rounded-lg text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,210,255,0.5)] transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
