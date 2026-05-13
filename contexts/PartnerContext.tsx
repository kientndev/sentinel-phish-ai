"use client";

import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { getSlugFromHostname, Partner } from "../lib/partner";

interface PartnerContextType {
  partner: Partner | null;
  isLoading: boolean;
  primaryColor: string;
  logoUrl: string | null;
}

const PartnerContext = createContext<PartnerContextType>({
  partner: null,
  isLoading: true,
  primaryColor: "#00d2ff", // Default color
  logoUrl: null,
});

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const slug = getSlugFromHostname(hostname);
  
  // Use Convex useQuery hook for reactive data fetching
  // Only call when mounted to avoid SSR errors with missing ConvexProvider
  const partnerData = useQuery(
    api.partners.getPartnerBySlug, 
    (mounted && slug) ? { slug } : "skip"
  );

  // If query returns undefined (loading) or null (not found), or if it errors
  // Error handling: Convex useQuery might throw if the query itself crashes
  // We'll use a safe derived state
  const isLoading = mounted ? (partnerData === undefined) : true;
  const partner = (mounted && partnerData) ? partnerData : null;

  const primaryColor = partner?.primaryColor || "#00d2ff";
  const logoUrl = partner?.logoUrl || null;

  return (
    <PartnerContext.Provider value={{ partner, isLoading, primaryColor, logoUrl }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error("usePartner must be used within a PartnerProvider");
  }
  return context;
}
