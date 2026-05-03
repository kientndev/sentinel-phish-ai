"use client";

import { useAuth } from "@clerk/nextjs";

export function useConvexAuth() {
  const { isLoaded, userId, isSignedIn } = useAuth();

  return {
    isLoaded,
    userId,
    isSignedIn,
    isAuthenticated: isSignedIn,
  };
}
