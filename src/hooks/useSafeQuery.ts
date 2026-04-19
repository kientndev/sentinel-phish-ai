"use client";

import { useQuery as useConvexQuery } from "convex/react";
import { FunctionReference } from "convex/server";
import { useConvexAvailable } from "../components/ConvexClientProvider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = FunctionReference<"query", any>;

/**
 * Safe wrapper around useQuery that returns undefined when Convex is not available.
 * This prevents build-time errors when NEXT_PUBLIC_CONVEX_URL is not set.
 * Returns the query result or undefined if Convex is unavailable or query is null.
 */
export function useSafeQuery(query: AnyQuery | null | undefined): unknown {
  const convexAvailable = useConvexAvailable();
  
  // Call useConvexQuery unconditionally (React hook rules)
  // Pass null to skip when Convex is unavailable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useConvexQuery(
    (convexAvailable ? query : null) as any
  );
}
