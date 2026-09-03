import { Shield, Radio, Terminal, Cpu, CheckCircle2, Lock } from "lucide-react";

export function CyberTelemetryPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 border-l border-slate-800/80 bg-slate-950/70 relative overflow-hidden h-full">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      
      {/* Decorative Matrix Grid */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Bar / Status */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
            <span className="font-mono text-xs tracking-wider uppercase font-semibold text-emerald-400">
              SYSTEM: ARMED
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800/90 px-3 py-1 rounded-md">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>UTC // ENGINE V2.4</span>
          </div>
        </div>

        {/* Hero Title and Badge */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs mb-3">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>SENTINEL DEFENSE SOC</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-mono">
            Autonomous Threat Scrutiny
          </h2>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Real-time multi-hop unmasking, live heuristics, and URLhaus intelligence feeds.
          </p>
        </div>
      </div>

      {/* Center: Interactive SOC Telemetry Monitor */}
      <div className="relative z-10 my-8">
        <div className="rounded-xl border border-cyan-500/20 bg-slate-950/90 shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] overflow-hidden font-mono text-xs">
          {/* Terminal Titlebar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium text-slate-300">sentinel-defense-monitor.sh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-5 space-y-2.5 text-[11px] leading-relaxed select-none">
            <div className="flex items-start gap-2 text-slate-400">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <span>[<span className="text-cyan-300 font-semibold">SENTINEL_CORE</span>] Initializing 3-tier heuristics...</span>
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <span>[<span className="text-yellow-400 font-semibold">PRE-FLIGHT</span>] 3xx redirect chain: <span className="text-emerald-400 font-semibold">UNMASKED (0 hops)</span></span>
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <span>[<span className="text-cyan-400 font-semibold">THREAT_FEED</span>] URLhaus real-time query: <span className="text-emerald-400 font-semibold">PASSED</span></span>
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <span>[<span className="text-purple-400 font-semibold">DOM_INSPECTOR</span>] Checking hidden harvest forms...</span>
            </div>
            <div className="flex items-start gap-2 text-emerald-400 font-semibold pt-1 border-t border-slate-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
              <span>[STATUS] 0 threats intercepted. System optimal.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metrics Row */}
      <div className="relative z-10 pt-6 border-t border-slate-800/80">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
            <div className="font-mono text-xl font-bold text-cyan-400">99.4%</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-0.5">Detection Fidelity</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
            <div className="font-mono text-xl font-bold text-emerald-400">&lt;300ms</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-0.5">Pre-Flight Latency</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
            <div className="font-mono text-xl font-bold text-indigo-400">Tier-3</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-0.5">Guarded Sandbox</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-6">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-500" />
            256-Bit Hardware Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Zero-Trust Gatekeeper
          </span>
        </div>
      </div>
    </div>
  );
}
