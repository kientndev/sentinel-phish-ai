"use client";

import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ReactNode, useMemo, createContext, useContext } from "react";

// Create a context to track if Convex is available
const ConvexAvailabilityContext = createContext<boolean>(false);

export const useConvexAvailable = () => useContext(ConvexAvailabilityContext);

// Basic Convex provider without Clerk auth
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexConfig = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
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
      <ConvexProvider client={convexConfig.convex}>
        {children}
      </ConvexProvider>
    </ConvexAvailabilityContext.Provider>
  );
}
