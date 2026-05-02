"use client";

import { useState, useEffect } from "react";

export type ScanHistoryRecord = {
  timestamp: string;
  score: number;
  url: string;
};

export function getRankFromXP(xp: number) {
  if (xp <= 500) return { title: "Initiate Scout", maxXP: 500, minXP: 0, level: 1 };
  if (xp <= 1500) return { title: "Cyber Guardian", maxXP: 1500, minXP: 501, level: 2 };
  return { title: "Elite Sentinel", maxXP: 5000, minXP: 1501, level: 3 };
}

export function usePhishTank() {
  const [totalScans, setTotalScans] = useState<number>(0);
  const [threatsBlocked, setThreatsBlocked] = useState<number>(0);
  const [scanHistory, setScanHistory] = useState<ScanHistoryRecord[]>([]);
  const [userXP, setUserXP] = useState<number>(0);
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const [dailyScans, setDailyScans] = useState<number>(0);
  const [justRankedUp, setJustRankedUp] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    try {
      const storedScans = localStorage.getItem("phishTank_totalScans");
      const storedThreats = localStorage.getItem("phishTank_threatsBlocked");
      const storedHistory = localStorage.getItem("phishTank_history");
      const storedXP = localStorage.getItem("phishTank_userXP");
      const storedStreak = localStorage.getItem("phishTank_dailyStreak");
      const storedDailyScans = localStorage.getItem("phishTank_dailyScans");

      if (storedScans) {
        setTotalScans(parseInt(storedScans, 10));
      } else {
        // Seed Initial Data
        setTotalScans(12);
        localStorage.setItem("phishTank_totalScans", "12");
      }

      if (storedThreats) {
        setThreatsBlocked(parseInt(storedThreats, 10));
      } else {
        setThreatsBlocked(4);
        localStorage.setItem("phishTank_threatsBlocked", "4");
      }

      if (storedHistory) {
        setScanHistory(JSON.parse(storedHistory));
      } else {
        const mockHistory: ScanHistoryRecord[] = [
          { timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), score: 12, url: "google.com" },
          { timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), score: 45, url: "github.com" },
          { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), score: 89, url: "paypal-security-update.net" },
          { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), score: 30, url: "microsoft-login.com" },
          { timestamp: new Date().toISOString(), score: 95, url: "amazon-verify-account.support" },
        ];
        setScanHistory(mockHistory);
        localStorage.setItem("phishTank_history", JSON.stringify(mockHistory));
      }

      if (storedXP) {
        setUserXP(parseInt(storedXP, 10));
      } else {
        setUserXP(350);
        localStorage.setItem("phishTank_userXP", "350");
      }

      if (storedStreak) setDailyStreak(parseInt(storedStreak, 10));
      if (storedDailyScans) setDailyScans(parseInt(storedDailyScans, 10));
    } catch {
      // Failed to retrieve PhishTank data from localStorage
    }
  }, []);

  const addScan = (score: number, isHighRisk: boolean, url: string) => {
    const now = new Date();
    
    setTotalScans((prev) => {
      const newVal = prev + 1;
      try { localStorage.setItem("phishTank_totalScans", newVal.toString()); } catch{}
      return newVal;
    });

    setThreatsBlocked((prev) => {
      const newVal = prev + (isHighRisk ? 1 : 0);
      try { localStorage.setItem("phishTank_threatsBlocked", newVal.toString()); } catch{}
      return newVal;
    });

    setScanHistory((prev) => {
      const newRecord: ScanHistoryRecord = { timestamp: now.toISOString(), score, url };
      // Keep last 5 scans as primary history for the guest UI, but store up to 50
      const newHistory = [newRecord, ...prev].slice(0, 50); 
      try { localStorage.setItem("phishTank_history", JSON.stringify(newHistory)); } catch{}
      return newHistory;
    });

    // XP Engine
    const xpEarned = 10 + (isHighRisk ? 50 : 0);
    setUserXP((prevXP) => {
      const newXP = prevXP + xpEarned;
      try { localStorage.setItem("phishTank_userXP", newXP.toString()); } catch{}
      
      const oldRank = getRankFromXP(prevXP);
      const newRank = getRankFromXP(newXP);
      if (newRank.level > oldRank.level) {
        setJustRankedUp(true);
      }
      return newXP;
    });
  };

  const clearRankUpToast = () => setJustRankedUp(false);

  return { totalScans, threatsBlocked, scanHistory, userXP, dailyStreak, dailyScans, justRankedUp, clearRankUpToast, addScan };
}
