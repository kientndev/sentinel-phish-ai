import { sendGAEvent } from "@next/third-parties/google";
import { track as vaTrack } from "@vercel/analytics";

export type AnalyticsEventName =
  | "pricing_page_view"
  | "signup_started"
  | "signup_completed"
  | "trial_offer_viewed"
  | "trial_activated"
  | "pro_feature_engaged"
  | "pro_gate_clicked"
  | "checkout_started"
  | "subscription_completed";

export type AnalyticsParamValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsParamValue>;

/**
 * Privacy-preserving parameter sanitizer.
 * Guarantees no raw URLs, emails, or personal data leak to GA4 telemetry.
 */
function sanitizeParams(params?: AnalyticsParams): Record<string, string | number | boolean> {
  if (!params) return {};

  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, val] of Object.entries(params)) {
    if (val === null || val === undefined) continue;

    if (typeof val === "string") {
      // Strip potential email addresses
      if (val.includes("@") && val.includes(".")) {
        sanitized[key] = "[sanitized_email]";
        continue;
      }
      // Strip full URLs / protocols to prevent leaking scanned targets
      if (/^https?:\/\//i.test(val)) {
        sanitized[key] = "[sanitized_url]";
        continue;
      }
      sanitized[key] = val;
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Centralized telemetry tracking for SentinelPhish.
 * Integrates with GA4 & Vercel Analytics, logging cleanly during local development.
 */
export function trackEvent(eventName: AnalyticsEventName, params?: AnalyticsParams): void {
  const sanitized = sanitizeParams(params);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics Dev] 📊 ${eventName}`, sanitized);
  }

  if (typeof window === "undefined") {
    return;
  }

  // 1. Dispatch to Google Analytics (gtag / sendGAEvent)
  try {
    const windowWithGtag = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof windowWithGtag.gtag === "function") {
      windowWithGtag.gtag("event", eventName, sanitized);
    } else {
      sendGAEvent("event", eventName, sanitized);
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics Dev] Failed to dispatch GA event:", err);
    }
  }

  // 2. Dispatch to Vercel Analytics custom events
  try {
    vaTrack(eventName, sanitized);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics Dev] Failed to dispatch Vercel Analytics event:", err);
    }
  }
}
