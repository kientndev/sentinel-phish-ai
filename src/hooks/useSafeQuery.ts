"use client";

import { useQuery as useConvexQuery } from "convex/react";
import { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";
import { useConvexAvailable } from "../components/ConvexClientProvider";

/**
 * Safe wrapper around useQuery that returns undefined when Convex is not available
 * This prevents build-time errors when NEXT_PUBLIC_CONVEX_URL is not set
 */
export function useSafeQuery<Query extends FunctionReference<"query">>(
  query: Query | null,
  ...args: FunctionArgs<Query> extends null | undefined ? [FunctionArgs<Query>?] : [FunctionArgs<Query>]
): FunctionReturnType<Query> | undefined {
  const convexAvailable = useConvexAvailable();
  
  // Return undefined if Convex is not available or query is null
  if (!convexAvailable || !query) {
    return undefined;
  }
  
  // Use the actual Convex hook when available
  return useConvexQuery(query, ...args);
}
