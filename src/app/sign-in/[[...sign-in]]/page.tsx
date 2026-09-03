import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ShieldCheck, Terminal } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-950 text-slate-100">
      {/* Left Column: Dark Cyber Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
              SYSTEM_ACCESS
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Authenticate to manage your SentinelShield monitors.
            </p>
          </div>

          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/scanning"
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: "#0b1329",
                colorText: "#f8fafc",
                colorTextSecondary: "#94a3b8",
                colorInputBackground: "#020617",
                colorInputText: "#f8fafc",
                colorPrimary: "#06b6d4",
                colorTextOnPrimaryBackground: "#ffffff",
              },
              elements: {
                rootBox: "w-full",
                card: "!bg-slate-900/60 !border !border-slate-800 !shadow-2xl rounded-xl p-6 backdrop-blur-xl",
                headerTitle: "!text-white font-mono font-bold text-lg",
                headerSubtitle: "!text-slate-400 font-mono text-xs",
                socialButtonsBlockButton: "!bg-slate-950 !border !border-slate-800 hover:!bg-slate-900 !text-white",
                socialButtonsBlockButtonText: "!text-white font-mono text-xs",
                dividerLine: "!bg-slate-800",
                dividerText: "!text-slate-400 font-mono text-xs uppercase",
                formFieldLabel: "!text-slate-200 font-mono text-xs font-medium",
                formFieldInput: "!bg-slate-950 !border-slate-800 !text-white placeholder:!text-slate-600 font-mono text-xs focus:!border-cyan-500",
                formButtonPrimary: "!bg-cyan-600 hover:!bg-cyan-500 !text-white font-mono text-xs font-semibold uppercase tracking-wider !shadow-[0_0_15px_rgba(6,182,212,0.35)]",
                footerActionLink: "!text-cyan-400 hover:!text-cyan-300 font-mono text-xs",
                identityPreviewText: "!text-slate-200 font-mono",
                identityPreviewEditButton: "!text-cyan-400",
              },
            }}
          />
        </div>
      </div>

      {/* Right Column: SOC Defense Telemetry (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 border-l border-slate-800/80 bg-slate-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_50%)] pointer-events-none" />

        {/* Top Status */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE SCANNER // READY
          </div>
          <span className="text-xs font-mono text-slate-500">ENGINE V2.4</span>
        </div>

        {/* Console Log Mockup */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 font-mono text-xs text-slate-400 shadow-2xl z-10 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-slate-300">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>telemetry_stream.log</span>
          </div>
          <p className="text-emerald-400">&gt; [CORE] 3-tier filtration funnel active</p>
          <p>&gt; [TIER-1] Resolving 3xx redirect chains (&lt;200ms)</p>
          <p>&gt; [TIER-2] URLhaus real-time database hooked</p>
          <p>&gt; [TIER-3] Playwright & Gemini Vision fallback armed</p>
          <p className="text-cyan-400">&gt; System ready. Monitoring inbound URLs.</p>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-3 gap-4 z-10 border-t border-slate-800/80 pt-6">
          <div>
            <div className="text-xl font-bold font-mono text-white">99.4%</div>
            <div className="text-xs text-slate-500 font-mono">Fidelity</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">&lt;300ms</div>
            <div className="text-xs text-slate-500 font-mono">Fast-Exit</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">0-Day</div>
            <div className="text-xs text-slate-500 font-mono">Visual AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
