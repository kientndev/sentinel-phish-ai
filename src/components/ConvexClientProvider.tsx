"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    console.log("ConvexClientProvider - Raw URL:", url);
    console.log("ConvexClientProvider - URL type:", typeof url);
    console.log("ConvexClientProvider - Environment:", process.env.NODE_ENV);
    
    if (!url) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not defined");
      setError("Convex URL is missing");
      return;
    }

    // Validate URL format - must start with https:// or http://
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      console.error("NEXT_PUBLIC_CONVEX_URL must start with http:// or https://. Got:", url);
      setError("Invalid Convex URL format - must start with http:// or https://");
      return;
    }

    try {
      new URL(url);
      console.log("ConvexClientProvider - URL is valid absolute URL:", url);
    } catch (e) {
      console.error("Invalid NEXT_PUBLIC_CONVEX_URL:", url, e);
      setError("Invalid Convex URL format");
    }
  }, []);

  if (error) {
    console.error("ConvexClientProvider - Returning without provider due to error:", error);
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

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error("NEXT_PUBLIC_CONVEX_URL must start with http:// or https://");
    return <>{children}</>;
  }

  try {
    console.log("ConvexClientProvider - Initializing Convex client with URL:", url);
    const convex = new ConvexReactClient(url);
    console.log("ConvexClientProvider - Convex client initialized successfully");
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  } catch (e) {
    console.error("Failed to initialize Convex client:", e);
    return <>{children}</>;
  }
}
