"use client";

import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { getSlugFromHostname, Partner, DEFAULT_PARTNER } from "../lib/partner";

interface PartnerContextType {
  partner: Partner | null;
  isLoading: boolean;
  primaryColor: string;
  logoUrl: string | null;
}

const PartnerContext = createContext<PartnerContextType>({
  partner: null,
  isLoading: true,
  primaryColor: "#3b82f6", // Updated to match DEFAULT_PARTNER
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
  const partnerData = useQuery(
    api.partners.getPartnerBySlug, 
    (mounted && slug && slug !== "sentinel-admin") ? { slug } : "skip"
  );

  // If query returns undefined (loading) or null (not found)
  const isLoading = mounted ? (partnerData === undefined && !!slug && slug !== "sentinel-admin") : true;
  
  const partner = useMemo(() => {
    if (!mounted) return null;
    if (slug === "sentinel-admin") return DEFAULT_PARTNER;
    return (partnerData as Partner | null) || null;
  }, [mounted, slug, partnerData]);

  const primaryColor = partner?.primaryColor || "#3b82f6";
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
