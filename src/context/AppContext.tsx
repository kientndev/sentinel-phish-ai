"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  creditBalance: number;
  burnCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [creditBalance, setCreditBalance] = useState(0);

  // Sync state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Sync Credits
      const savedCredits = localStorage.getItem("guest_credits");
      if (savedCredits) {
        setCreditBalance(parseInt(savedCredits));
      } else {
        setCreditBalance(800);
        localStorage.setItem("guest_credits", "800");
      }
    }
  }, []);

  const burnCredits = async (amount: number): Promise<boolean> => {
    const updateStorage = (val: number) => {
      if (typeof window !== "undefined") localStorage.setItem("guest_credits", val.toString());
    };

    if (creditBalance < amount) {
      const refillAmount = 800;
      const newBalance = refillAmount - amount;
      setCreditBalance(newBalance);
      updateStorage(newBalance);
      return true;
    }
    const newBalance = creditBalance - amount;
    setCreditBalance(newBalance);
    updateStorage(newBalance);
    return true;
  };

  const addCredits = async (amount: number) => {
    const newBalance = creditBalance + amount;
    setCreditBalance(newBalance);
    if (typeof window !== "undefined") localStorage.setItem("guest_credits", newBalance.toString());
  };

  return (
    <AppContext.Provider 
      value={{ 
        creditBalance, 
        burnCredits, 
        addCredits, 
      }}
    >
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
