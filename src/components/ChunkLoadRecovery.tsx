"use client";

import { useEffect } from "react";

/**
 * Handles Webpack / Next.js ChunkLoadError exceptions.
 * When a new deployment is promoted to production, clients with stale cached HTML
 * may request chunk hashes from the previous build which return HTTP 404.
 * This listener catches the failure and performs a one-time clean window reload to
 * fetch the updated HTML and new chunk hashes without crashing the user session.
 */
export default function ChunkLoadRecovery() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMsg = event.message || event.error?.message || "";
      const isChunkError =
        event.error?.name === "ChunkLoadError" ||
        errorMsg.includes("Loading chunk") ||
        errorMsg.includes("ChunkLoadError");

      if (isChunkError) {
        const storageKey = "sentinel_chunk_error_reload";
        const lastReload = sessionStorage.getItem(storageKey);
        const now = Date.now();

        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(storageKey, now.toString());
          console.warn("[ChunkLoadRecovery] Stale deployment chunk detected, refreshing to fetch latest build...");
          window.location.reload();
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const errorMsg = reason?.message || (typeof reason === "string" ? reason : "");
      const isChunkError =
        reason?.name === "ChunkLoadError" ||
        errorMsg.includes("Loading chunk") ||
        errorMsg.includes("ChunkLoadError");

      if (isChunkError) {
        const storageKey = "sentinel_chunk_error_reload";
        const lastReload = sessionStorage.getItem(storageKey);
        const now = Date.now();

        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(storageKey, now.toString());
          console.warn("[ChunkLoadRecovery] Unhandled stale chunk rejection detected, refreshing to fetch latest build...");
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
