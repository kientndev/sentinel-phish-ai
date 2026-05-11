"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSlugFromHostname, getPartnerBySlug, Partner } from "../lib/partner";

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
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPartner() {
      try {
        const hostname = window.location.hostname;
        const slug = getSlugFromHostname(hostname);
        
        if (slug) {
          const partnerData = await getPartnerBySlug(slug);
          setPartner(partnerData);
        }
      } catch (error) {
        console.error("Error loading partner:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPartner();
  }, []);

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
