import { SignIn } from "@clerk/nextjs";
import { CyberTelemetryPanel } from "@/components/CyberTelemetryPanel";
import { clerkCyberAppearance } from "@/lib/clerkCyberTheme";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] w-full bg-[#030712] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambience: Subtle cyan/indigo radial glow & 1px grid */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px]" />
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Outer Split Card Container */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl border border-slate-800/90 bg-slate-950/80 shadow-[0_0_80px_-20px_rgba(6,182,212,0.15)] backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Clerk Sign-In Form */}
        <div className="lg:col-span-6 xl:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center relative">
          {/* Header branding */}
          <div className="w-full max-w-sm mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="font-mono font-bold tracking-tight text-white text-base">
                Sentinel<span className="text-cyan-400">Shield</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AUTH_PORTAL
            </div>
          </div>

          {/* Form wrapper */}
          <div className="w-full max-w-sm">
            <SignIn 
              appearance={clerkCyberAppearance} 
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
            />
          </div>
        </div>

        {/* Right Column: Cyber Telemetry Showcase (Desktop only) */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-5 h-full">
          <CyberTelemetryPanel />
        </div>
      </div>
    </main>
  );
}
