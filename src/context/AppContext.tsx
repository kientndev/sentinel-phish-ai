"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  isGuest: boolean;
  creditBalance: number;
  burnCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [creditBalance, setCreditBalance] = useState(0);
  const isGuest = true; // Permanent Guest Mode

  // Sync state from localStorage
  useEffect(() => {
    // Initialize guest with 1000 credits if not already set
    const savedCredits = localStorage.getItem("guest_credits");
    if (savedCredits) {
      setCreditBalance(parseInt(savedCredits));
    } else {
      setCreditBalance(800);
      localStorage.setItem("guest_credits", "800");
    }
  }, []);

  const burnCredits = async (amount: number): Promise<boolean> => {
    if (creditBalance < amount) {
      // Auto-refill logic for UX smoothness in Guest Mode
      const refillAmount = 800;
      const newBalance = refillAmount - amount;
      setCreditBalance(newBalance);
      localStorage.setItem("guest_credits", newBalance.toString());
      return true;
    }
    
    const newBalance = creditBalance - amount;
    setCreditBalance(newBalance);
    localStorage.setItem("guest_credits", newBalance.toString());
    return true;
  };

  const addCredits = async (amount: number) => {
    const newBalance = creditBalance + amount;
    setCreditBalance(newBalance);
    localStorage.setItem("guest_credits", newBalance.toString());
  };

  return (
    <AppContext.Provider value={{ isGuest, creditBalance, burnCredits, addCredits }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
