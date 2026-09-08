import { ShieldAlert, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0b0e14]/90 backdrop-blur-md text-[#fafafa] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="bg-[#00d2ff]/10 p-2 rounded-xl border border-[#00d2ff]/20 group-hover:border-[#00d2ff]/40 transition-colors">
                <ShieldAlert size={18} className="text-[#00d2ff]" />
              </div>
              <span className="text-lg font-black tracking-tight text-white font-mono">
                Sentinel<span className="text-[#00d2ff]">Phish</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Real-time heuristic zero-day phishing detection, optical QR shield inspection, and community threat intelligence.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Engine v1.0 Production Release</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
              Platform &amp; Intelligence
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/scanning" className="text-zinc-400 hover:text-[#00d2ff] transition-colors">
                  URL Threat Scanner
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-zinc-400 hover:text-[#00d2ff] transition-colors">
                  Community Threat Feed
                </Link>
              </li>
              <li>
                <Link href="/scan/qr" className="text-zinc-400 hover:text-[#00d2ff] transition-colors">
                  QR Shield Inspection
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-zinc-400 hover:text-[#00d2ff] transition-colors">
                  Plans &amp; Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
              Legal &amp; Support
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/privacy" className="text-zinc-400 hover:text-[#00d2ff] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zinc-400 hover:text-[#00d2ff] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-[#00d2ff] transition-colors">
                  Contact Intelligence
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Commercial Licensing */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <p>© 2026 SentinelPhish AI. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>Commercial licensing available for MSPs, SOCs &amp; Fintech.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
