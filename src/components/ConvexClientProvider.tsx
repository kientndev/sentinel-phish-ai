"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode, useMemo, createContext, useContext } from "react";

// Create a context to track if Convex is available
const ConvexAvailabilityContext = createContext<boolean>(false);

export const useConvexAvailable = () => useContext(ConvexAvailabilityContext);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexConfig = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.warn("NEXT_PUBLIC_CONVEX_URL is not set. Convex features will be disabled.");
      return null;
    }
    return { convex: new ConvexReactClient(convexUrl), available: true };
  }, []);

  if (!convexConfig) {
    return (
      <ConvexAvailabilityContext.Provider value={false}>
        {children}
      </ConvexAvailabilityContext.Provider>
    );
  }

  return (
    <ConvexAvailabilityContext.Provider value={true}>
      <ConvexProviderWithClerk client={convexConfig.convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ConvexAvailabilityContext.Provider>
  );
}
