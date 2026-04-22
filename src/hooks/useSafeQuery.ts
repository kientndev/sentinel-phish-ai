"use client";

import { useEffect, useState } from "react";
import { useQuery as useConvexQuery } from "convex/react";
import { FunctionReference, FunctionReturnType } from "convex/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = FunctionReference<"query", any>;

/**
 * Safe wrapper around useQuery that:
 * 1. Returns undefined during SSR
 * 2. Returns undefined when Convex is unavailable or query is null
 * 3. Otherwise returns the Convex query result
 * 
 * This prevents build-time errors when NEXT_PUBLIC_CONVEX_URL is not set.
 */
export function useSafeQuery<Query extends AnyQuery>(
  query: Query | null | undefined
): FunctionReturnType<Query> | undefined {
  const [mounted, setMounted] = useState(false);
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const shouldSkip = !mounted || !convexUrl || query === null || query === undefined;
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = useConvexQuery(
      shouldSkip ? (null as any) : query
    );
    
    if (shouldSkip) {
      return undefined;
    }
    
    return result as FunctionReturnType<Query> | undefined;
  } catch (error) {
    // If Convex errors (e.g., during SSR), return undefined
    return undefined;
  }
}
