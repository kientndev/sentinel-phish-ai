"use client";

import { Trophy } from "lucide-react";
import { usePhishTank, getRankFromXP } from "../hooks/usePhishTank";

export default function XPBar() {
  const { userXP } = usePhishTank();
  const rank = getRankFromXP(userXP);
  const pct = Math.min(
    100,
    Math.max(0, ((userXP - rank.minXP) / Math.max(1, rank.maxXP - rank.minXP)) * 100)
  );
  const rankLabel =
    rank.level === 1 ? "Initiate Scout" : rank.level === 2 ? "Cyber Guardian" : "Elite Sentinel";
  const trophyColor =
    rank.level === 3 ? "text-yellow-400" : rank.level === 2 ? "text-[#a855f7]" : "text-[#00d2ff]";

  return (
    <div className="w-full bg-black/30 border-b border-white/8 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <Trophy className={`w-4 h-4 shrink-0 ${trophyColor}`} />
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <span className={`text-xs font-bold tracking-wide whitespace-nowrap ${trophyColor}`}>
            {rankLabel}
          </span>
          <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #00d2ff, #a855f7)",
                boxShadow: "0 0 8px rgba(0,210,255,0.4)",
              }}
            />
          </div>
          <span className="text-[10px] text-[#52525b] font-mono whitespace-nowrap">
            {userXP}&nbsp;/&nbsp;{rank.maxXP} XP
          </span>
        </div>
      </div>
    </div>
  );
}
