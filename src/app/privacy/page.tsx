import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Server, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | SentinelPhish",
  description:
    "SentinelPhish Privacy Policy. Compliant disclosure regarding OAuth account data, URL telemetry, zero-day threat analysis, and data security.",
};

export default function PrivacyPolicyPage() {
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
              <Shield className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">
                Compliance &amp; Data Transparency
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Last Updated: {lastUpdated} · Effective Date: January 1, 2026
            </p>
          </div>
        </div>

        {/* Introduction Card */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p>
            At <strong>SentinelPhish</strong> (&quot;SentinelPhish&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we provide advanced heuristic phishing detection, zero-day optical analysis (QR Shield), and community-driven threat intelligence. We are dedicated to maintaining the trust of our users through rigorous security practices and transparent data handling policies.
          </p>
          <p>
            This Privacy Policy details how we collect, process, protect, and disclose information when you access or use the SentinelPhish website, web applications, scanning APIs, or associated security tools.
          </p>
        </section>

        {/* Section 1: Information We Collect */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#00d2ff]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">1. Information We Collect</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-white mb-1">A. Account Information (Clerk / Google OAuth)</h3>
              <p>
                When you create an account or sign in using identity providers (including Google OAuth via Clerk), we collect basic profile details:
              </p>
              <ul className="list-disc list-inside mt-1.5 space-y-1 text-zinc-400 font-mono text-xs">
                <li>Your full name and verified primary email address</li>
                <li>OAuth identity identifiers and profile avatar image URL</li>
                <li>Account creation timestamp and active plan entitlement</li>
              </ul>
              <p className="mt-2 text-zinc-400 text-xs">
                We strictly limit our Google OAuth scopes to standard identity verification (<code>profile</code>, <code>email</code>, <code>openid</code>). We never request, access, or inspect your private Google Drive, Gmail, or contacts data.
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <h3 className="font-bold text-white mb-1">B. Threat Scan Data</h3>
              <p>
                When you submit a URL or QR code for security analysis, our automated ingestion engine captures:
              </p>
              <ul className="list-disc list-inside mt-1.5 space-y-1 text-zinc-400 font-mono text-xs">
                <li>The target URL, resolved hostname, protocol, and IP destination</li>
                <li>Automated heuristic red flags, redirection hops, and calculated risk scores</li>
                <li>HTTP status codes, DOM entropy metrics, and submission timestamps</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-white/5">
              <h3 className="font-bold text-white mb-1">C. Community Accuracy Feedback</h3>
              <p>
                When users rate a scan verdict (&quot;Helpful&quot; or &quot;Inaccurate&quot;), we store the rating vote, associated target URL, and optional user identifier to calibrate our neural heuristic models and establish community consensus.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Information */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">2. How We Use Your Information</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              We process collected data exclusively to deliver, maintain, and enhance cyber threat intelligence services:
            </p>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shrink-0 mt-2" />
                <span><strong>Zero-Day Heuristic Analysis:</strong> Extracting multi-hop redirection chains, deceptive homographs, and credential harvesting patterns to protect users against weaponized links.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shrink-0 mt-2" />
                <span><strong>Public Threat Intelligence Feed (/reports):</strong> Sharing collective zero-day intelligence modeled after PhishTank. All public threat feed entries strictly strip personal user identities—only defanged URLs, domains, risk scores, heuristics, and consensus votes are visible.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shrink-0 mt-2" />
                <span><strong>Account Management &amp; Rate Limiting:</strong> Managing account tiers, enforcing daily guest quotas, and authenticating developer API access.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Third-Party Service Providers */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-[#a855f7]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">3. Third-Party Service Providers</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              We partner with industry-leading cloud infrastructure providers who adhere to strict data security standards:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-white font-bold block">Clerk</span>
                <span className="text-zinc-400">Authentication, OAuth Session Security &amp; Identity Management</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-white font-bold block">Convex</span>
                <span className="text-zinc-400">Real-time Reactive Database &amp; Secure Cloud Compute</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-white font-bold block">Vercel</span>
                <span className="text-zinc-400">Edge Hosting, Static Content Delivery &amp; TLS Termination</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Data Security & Retention */}
        <section className="bg-[#0A0F1D]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">4. Data Security &amp; Retention</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <p>
              We implement comprehensive defense-in-depth safeguards to protect data against unauthorized disclosure or tampering:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
              <li><strong>Encryption in Transit:</strong> Enforced TLS 1.3 encryption across all client-to-server and inter-service communications.</li>
              <li><strong>Encryption at Rest:</strong> Database records and telemetry encrypted using AES-256 standards.</li>
              <li><strong>URL Defanging:</strong> Malicious or suspicious URLs are defanged by default in database views and public feeds to prevent accidental client execution.</li>
              <li><strong>Data Deletion Rights:</strong> You may request the permanent deletion of your account and personal identifiers by contacting us at any time.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Contact Information */}
        <section className="bg-gradient-to-br from-white/[0.04] to-[#00d2ff]/5 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#00d2ff]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">5. Contact Information &amp; Data Inquiries</h2>
              <p className="text-xs text-zinc-400">Have questions regarding your personal data or privacy rights?</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            For privacy inquiries, account data deletion, or verification requests, reach out directly to our security &amp; compliance team:
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
              Visit Contact Intelligence →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
