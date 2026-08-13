"use client";

import { Check, Zap, Shield, Crown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import WaitlistModal from "../../components/WaitlistModal";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleUpgradeClick = (tierName: string) => {
    setSelectedTier(tierName);
    setShowModal(true);
  };

  const tiers = [
    {
      name: "Basic",
      icon: Zap,
      iconColor: "text-[#00d2ff]",
      borderColor: "border-[#00d2ff]/20",
      bgColor: "bg-[#00d2ff]/5",
      monthlyPrice: 0,
      yearlyPrice: 0,
      scansPerDay: 15,
      features: ["Basic Heuristics", "15 Scans/Day", "Community Support"],
      isBestValue: false,
    },
    {
      name: "Mid",
      icon: Shield,
      iconColor: "text-[#a855f7]",
      borderColor: "border-[#a855f7]/20",
      bgColor: "bg-[#a855f7]/5",
      monthlyPrice: 2.59,
      yearlyPrice: 15,
      scansPerDay: 35,
      features: ["Advanced Heuristics", "35 Scans/Day", "Priority Support", "Basic Reports"],
      isBestValue: false,
    },
    {
      name: "Pro",
      icon: Shield,
      iconColor: "text-[#a855f7]",
      borderColor: "border-[#a855f7]/40",
      bgColor: "bg-[#a855f7]/10",
      monthlyPrice: 4.59,
      yearlyPrice: 20,
      scansPerDay: 55,
      features: ["AI Security Advisor", "55 Scans/Day", "Priority Support", "Advanced Reports", "Team Features"],
      isBestValue: true,
    },
    {
      name: "VIP",
      icon: Crown,
      iconColor: "text-yellow-500",
      borderColor: "border-yellow-500/40",
      bgColor: "bg-yellow-500/10",
      monthlyPrice: 9.59,
      yearlyPrice: 45,
      scansPerDay: "Unlimited",
      features: ["All Pro Features", "Unlimited Scans", "24/7 Support", "API Access", "White-label Reports"],
      isBestValue: false,
    },
  ];

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-16 relative">
      <div className="max-w-4xl w-full text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 italic tracking-tight">Access Plans</h1>
        <p className="text-[#a1a1aa] font-medium text-lg italic">Choose your level of scrutiny</p>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center gap-4 mb-12">
        <span className={`font-bold ${!isYearly ? "text-white" : "text-[#a1a1aa]"}`}>Monthly</span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className={`relative w-16 h-8 rounded-full transition-colors ${isYearly ? "bg-[#a855f7]" : "bg-[#00d2ff]"}`}
        >
          <div
            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${isYearly ? "left-9" : "left-1"}`}
          />
        </button>
        <span className={`font-bold ${isYearly ? "text-white" : "text-[#a1a1aa]"}`}>Yearly</span>
        {isYearly && (
          <span className="ml-2 px-3 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-full uppercase tracking-wider">
            Save ~60%
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full px-4">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
          const period = isYearly ? "/year" : "/month";
          const showSaveBadge = isYearly && (tier.name === "Pro" || tier.name === "VIP");

          return (
            <div
              key={tier.name}
              className={`glass-card p-6 ${tier.borderColor} ${tier.bgColor} flex flex-col relative ${tier.isBestValue ? "ring-2 ring-[#a855f7]" : ""}`}
            >
              {tier.isBestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#a855f7] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white">
                  Best Value
                </div>
              )}
              {showSaveBadge && (
                <div className="absolute top-4 right-4 bg-emerald-500 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white">
                  Save ~60%
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-6 h-6 ${tier.iconColor}`} />
                <h3 className="text-xl font-bold text-white tracking-widest">{tier.name.toUpperCase()}</h3>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-white">${price}</span>
                <span className="text-[#a1a1aa] ml-2 font-bold">{period}</span>
              </div>
              
              <div className="mb-6 p-3 bg-white/5 rounded-xl">
                <div className="text-[10px] uppercase font-black text-[#a1a1aa] block mb-1">
                  Daily Scans
                </div>
                <div className="text-2xl font-black text-white">{tier.scansPerDay}</div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-[#a1a1aa] font-medium">
                    <Check className={`w-4 h-4 ${tier.iconColor}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {tier.name === "Basic" ? (
                <Link
                  href="/scanning"
                  className="w-full py-3 text-center rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] font-bold border border-[#00d2ff]/30 hover:bg-[#00d2ff]/30 transition-all uppercase tracking-widest text-xs"
                >
                  Start Scanning
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgradeClick(tier.name)}
                  className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all uppercase tracking-widest text-xs"
                >
                  Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      <WaitlistModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        plan={selectedTier || "Pro"} 
      />
    </main>
  );
}
