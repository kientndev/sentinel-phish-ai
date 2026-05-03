"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not defined");
      setError("Convex URL is missing");
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      console.error("Invalid NEXT_PUBLIC_CONVEX_URL:", url, e);
      setError("Invalid Convex URL format");
    }
  }, []);

  if (error) {
    return <>{children}</>;
  }

  if (!mounted) {
    return <>{children}</>;
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    console.error("NEXT_PUBLIC_CONVEX_URL is not defined");
    return <>{children}</>;
  }

  try {
    const convex = new ConvexReactClient(url);
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  } catch (e) {
    console.error("Failed to initialize Convex client:", e);
    return <>{children}</>;
  }
}
