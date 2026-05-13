"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
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
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const slug = getSlugFromHostname(hostname);
  
  // Use Convex useQuery hook for reactive data fetching
  const partnerData = useQuery(
    api.partners.getPartnerBySlug, 
    slug ? { slug } : "skip"
  );

  const isLoading = partnerData === undefined;
  const partner = partnerData || null;

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
