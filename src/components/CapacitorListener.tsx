/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CapacitorListener() {
  const router = useRouter();

  useEffect(() => {
    let activeListener: any = null;

    const setupListener = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        
        // Ensure we only bind native listeners if running inside a native shell
        if (Capacitor.isNativePlatform()) {
          const { App } = await import("@capacitor/app");
          
          activeListener = await App.addListener("appUrlOpen", (event) => {
            console.log("[Capacitor] App opened with URL:", event.url);
            
            try {
              // Standard custom URL scheme format: sentinelphish://app/dashboard
              // Or Clerk redirect format: sentinelphish://auth-callback#__clerk_db_jwt=...
              const parsedUrl = new URL(event.url);
              
              // If it's a Clerk auth-callback redirect, parse and route accordingly
              if (parsedUrl.host === "auth-callback" || parsedUrl.pathname.includes("auth-callback")) {
                // Route to authentication handler or landing dashboard
                router.push("/dashboard");
              } else {
                // Fallback to routing directly to the target path
                const path = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
                router.push(path);
              }
            } catch (err) {
              console.error("[Capacitor] Failed to parse custom deep link URL:", err);
            }
          });
        }
      } catch (e) {
        console.error("[Capacitor] Failed to configure deep-link appUrlOpen listener:", e);
      }
    };

    setupListener();

    return () => {
      if (activeListener) {
        activeListener.remove();
      }
    };
  }, [router]);

  return null;
}
