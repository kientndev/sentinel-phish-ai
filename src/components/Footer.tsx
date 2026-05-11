import { ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0b0e14]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Logo and Copyright */}
          <div className="flex items-center gap-3">
            <div className="bg-[#00d2ff]/10 p-2 rounded-lg border border-[#00d2ff]/20">
              <ShieldAlert size={16} className="text-[#00d2ff]" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-[#fafafa] font-medium">
                © 2026 Sentinel Phish AI. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* Right: Commercial Licensing Info */}
          <div className="text-sm text-[#a1a1aa]">
            Commercial licensing available for MSPs & Fintech. Contact the Founder for inquiries.
          </div>
        </div>
      </div>
    </footer>
  );
}
