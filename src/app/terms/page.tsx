import { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldAlert, AlertTriangle, Scale, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | SentinelPhish",
  description:
    "SentinelPhish Terms of Service. Guidelines on acceptable use, heuristic scanning disclaimers, public intelligence feeds, and limitation of liability.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "September 8, 2026";

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-12 md:py-16 bg-[#0b0e14] relative overflow-hidden text-[#fafafa]">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute top-12 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-48 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/8 rounded-full blur-[140px]" />

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Back link & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-[#00d2ff] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to SentinelPhish</span>
          </Link>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20">
              <FileText className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">
                Legal &amp; Usage Terms
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Last Updated: {lastUpdated} · Effective Date: January 1, 2026
            </p>
          </div>
        </div>

        {/* Overview Notice */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p>
            Welcome to <strong>SentinelPhish</strong> (&quot;SentinelPhish&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our URL scanning platform, QR Shield inspection engine, developer APIs, and community threat intelligence feed.
          </p>
          <p>
            By accessing or using SentinelPhish, you agree to be bound by these Terms. If you do not agree, please discontinue using the service immediately.
          </p>
        </section>

        {/* Section 1: Acceptable Use Policy */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#00d2ff]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">1. Acceptable Use Policy</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              SentinelPhish is purpose-built for defensive cybersecurity, phishing triage, and benign security research. You agree to use the service in compliance with all applicable laws and the following standards:
            </p>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shrink-0 mt-2" />
                <span><strong>No Malicious Exploitation:</strong> You shall not use our infrastructure to conduct distributed denial-of-service (DDoS) attacks, automated fuzzing, brute-forcing, or unauthorized penetration testing against third-party servers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shrink-0 mt-2" />
                <span><strong>No Infrastructure Abuse:</strong> You shall not attempt to circumvent rate limits, manipulate guest scan allocations, disrupt service operations, or reverse-engineer the heuristic scoring engine.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shrink-0 mt-2" />
                <span><strong>Defensive Research Only:</strong> Target URLs submitted must be for the purpose of validating security posture, inspecting suspicious communications, or submitting zero-day telemetry to the community feed.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2: Heuristic Analysis & Security Disclaimer */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">2. Heuristic Disclaimer &amp; Advisory Nature</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              SentinelPhish utilizes machine-assisted heuristics, DOM entropy algorithms, and reputation intelligence to detect potential threats.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1.5 font-mono">
              <span className="font-bold text-amber-300 uppercase tracking-wider block">Important Advisory:</span>
              <p>
                Heuristic scores and risk verdicts are advisory assessments provided for triage assistance. Due to the rapidly evolving nature of zero-day exploits, fast-flux DNS, and obfuscation techniques, SentinelPhish does not warrant 100% threat detection or zero false-positive rates.
              </p>
            </div>
            <p className="text-zinc-400">
              Users should exercise independent professional judgment and defense-in-depth protocols before visiting, whitelist-approving, or interacting with unfamiliar web destinations.
            </p>
          </div>
        </section>

        {/* Section 3: User Submissions & Community Threat Feed */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#a855f7]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">3. User Submissions &amp; Public Threat Feed</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              By submitting a URL or QR code for analysis through SentinelPhish:
            </p>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shrink-0 mt-2" />
                <span>You acknowledge and grant SentinelPhish the perpetual right to parse, sandbox, extract heuristic indicators, and index the target URL for global threat defense.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shrink-0 mt-2" />
                <span>You acknowledge that submitted URLs may appear publicly on the Community Threat Feed (<code>/reports</code>) in defanged format (e.g. <code>hxxps://...</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shrink-0 mt-2" />
                <span>SentinelPhish strips private user identifiers from public feed records; however, you should avoid submitting URLs that embed sensitive personal credentials, secret API keys, or private authorization tokens in query parameters.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Limitation of Liability */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Scale className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">4. Limitation of Liability</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SENTINELPHISH AND ITS OPERATORS, AFFILIATES, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs font-mono">
              <li>Your reliance on any scan verdict, heuristic score, or community consensus rating</li>
              <li>Unauthorized access to or alteration of your transmissions or data</li>
              <li>Damages resulting from malware or exploits executed by visiting external target URLs</li>
              <li>Temporary service downtime, rate limit throttling, or API interruptions</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Contact & Inquiries */}
        <section className="bg-gradient-to-br from-white/[0.04] to-[#00d2ff]/5 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-black text-white">5. Questions Regarding Terms</h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            For questions or legal notices regarding these Terms of Service, contact our legal desk at:
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <a
              href="mailto:support@sentinelphish.com"
              className="px-4 py-2.5 rounded-xl bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-[#00d2ff] hover:text-white font-bold transition-all"
            >
              support@sentinelphish.com
            </a>
            <Link
              href="/contact"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
            >
              Contact Intelligence →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
