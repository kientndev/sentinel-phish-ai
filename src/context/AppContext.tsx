"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  isGuest: boolean;
  isLoggedIn: boolean;
  username: string | null;
  creditBalance: number;
  burnCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
  login: (username: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [creditBalance, setCreditBalance] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const isGuest = !isLoggedIn; 

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

      // Sync Login State
      const storedLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const storedUsername = localStorage.getItem("username");
      if (storedLoggedIn && storedUsername) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
      }
    }
  }, []);

  const login = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", user);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
    }
  };

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
        isGuest, 
        isLoggedIn, 
        username, 
        creditBalance, 
        burnCredits, 
        addCredits, 
        login, 
        logout 
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
