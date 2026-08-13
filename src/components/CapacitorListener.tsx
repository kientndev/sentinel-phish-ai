/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CapacitorListener() {
  const router = useRouter();

  useEffect(() => {
    const activeListeners: any[] = [];

    const setupListener = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        
        // Ensure we only bind native listeners if running inside a native shell
        if (Capacitor.isNativePlatform()) {
          // Dynamically import AdMob utilities to prevent SSR build issues
          const { initializeAdMob, showBottomBanner } = await import("@/lib/admob");
          await initializeAdMob();
          await showBottomBanner();

          const { App } = await import("@capacitor/app");
          
          // Android Back Button handler
          const backListener = await App.addListener("backButton", () => {
            console.log("[Capacitor] Back button pressed");
            
            // Check if there is an open settings modal and trigger its close action
            const closeSettingsBtn = document.querySelector('button[aria-label="Close settings"]') as HTMLButtonElement;
            if (closeSettingsBtn) {
              closeSettingsBtn.click();
              return;
            }
            
            // Navigate back in history if possible, else exit the app container
            if (window.history.length > 1) {
              window.history.back();
            } else {
              App.exitApp();
            }
          });
          activeListeners.push(backListener);
          
          const urlListener = await App.addListener("appUrlOpen", (event) => {
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
          activeListeners.push(urlListener);
        }
      } catch (e) {
        console.error("[Capacitor] Failed to configure deep-link appUrlOpen listener:", e);
      }
    };

    setupListener();

    return () => {
      activeListeners.forEach((listener) => {
        if (listener && typeof listener.remove === "function") {
          listener.remove();
        }
      });
    };
  }, [router]);

  return null;
}
