export interface DomAuditResult {
  hasPasswordField: boolean;
  brandMismatch: boolean;
  mismatchedBrand?: string;
  isObfuscated: boolean;
  hasFormActionHijack: boolean;
  isEmptySpaRoot: boolean;
  metaRefreshUrl?: string;
  domRiskScore: number;
  title: string;
  flags: string[];
}

const PROTECTED_BRANDS = [
  "Apple",
  "Microsoft",
  "Google",
  "PayPal",
  "Bank",
  "Meta",
  "Facebook",
  "Instagram",
  "Amazon",
  "Netflix",
  "Chase",
  "Wells Fargo",
  "Bank of America",
  "Binance",
  "Coinbase",
  "Stripe",
];

// Regex for IP address
const IP_HOST_REGEX = /^(?:https?:\/\/)?(?:\d{1,3}\.){3}\d{1,3}/i;

/**
 * Level 1: Lightweight HTTP & Raw DOM Inspection (<200ms)
 * Fetches HTML string directly using fetch without headless browser overhead.
 */
export async function auditDomLightweight(targetUrl: string, isWhitelisted: boolean): Promise<DomAuditResult> {
  const flags: string[] = [];
  let domRiskScore = 0;
  let hasPasswordField = false;
  let brandMismatch = false;
  let mismatchedBrand: string | undefined = undefined;
  let isObfuscated = false;
  let hasFormActionHijack = false;
  let isEmptySpaRoot = false;
  let metaRefreshUrl: string | undefined = undefined;
  let title = "";

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return {
        hasPasswordField,
        brandMismatch,
        isObfuscated,
        hasFormActionHijack,
        isEmptySpaRoot,
        domRiskScore,
        title,
        flags: [`HTTP status ${response.status} received during DOM inspection`],
      };
    }

    const html = await response.text();
    const currentHost = new URL(targetUrl).hostname.toLowerCase();

    // 1. Title Extraction
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // 2. Credential Harvesting Input Detection
    const hasPasswordInput = /<input[^>]+type=["']?password["']?/i.test(html);
    const hasPassName = /<input[^>]+name=["']?(?:pass|password|passwd|pwd|user_password)["']?/i.test(html);
    if (hasPasswordInput || hasPassName) {
      hasPasswordField = true;
      if (!isWhitelisted) {
        domRiskScore += 25;
        flags.push("DOM: Password/credential input field detected in raw HTML structure.");
      }
    }

    // 3. Brand Mismatch in <title> or <h1>
    if (!isWhitelisted) {
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
      const h1Text = h1Matches.map((h) => h.replace(/<[^>]+>/g, "")).join(" ");
      const combinedText = `${title} ${h1Text}`.toLowerCase();

      for (const brand of PROTECTED_BRANDS) {
        const brandLower = brand.toLowerCase();
        if (combinedText.includes(brandLower) && !currentHost.includes(brandLower.replace(/\s+/g, ""))) {
          brandMismatch = true;
          mismatchedBrand = brand;
          domRiskScore += 35;
          flags.push(`DOM: Protected brand identity ("${brand}") claimed in title/header on unverified domain (${currentHost}).`);
          break;
        }
      }
    }

    // 4. Form Action Hijack Detection (<form action="..."> pointing to external/IP host)
    const formActionMatches = html.matchAll(/<form[^>]+action=["']?([^"'>\s]+)["']?/gi);
    for (const match of formActionMatches) {
      const actionUrl = match[1];
      if (actionUrl) {
        if (IP_HOST_REGEX.test(actionUrl)) {
          hasFormActionHijack = true;
          domRiskScore += 40;
          flags.push(`DOM: Form action posts credentials directly to raw IP address (${actionUrl}).`);
          break;
        } else if (/^https?:\/\//i.test(actionUrl)) {
          try {
            const actionHost = new URL(actionUrl).hostname.toLowerCase();
            if (actionHost !== currentHost && !actionHost.endsWith(`.${currentHost}`)) {
              hasFormActionHijack = true;
              domRiskScore += 30;
              flags.push(`DOM: Form action targets external untrusted domain (${actionHost}).`);
              break;
            }
          } catch {}
        }
      }
    }

    // 5. Script Obfuscation & Evasion Tactics
    const hasEvalUnescape = /eval\s*\(\s*(?:unescape|decodeURIComponent|atob)\s*\(/i.test(html);
    const hasPackedJs = /eval\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,\s*d\s*\)/i.test(html);
    const hasMetaRefresh = /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']?[0-9]+;\s*url=([^"'>]+)["']?/i.test(html);
    
    if (hasMetaRefresh) {
      const metaMatch = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["']?[0-9]+;\s*url=([^"'>]+)["']?/i);
      if (metaMatch && metaMatch[1]) {
        metaRefreshUrl = metaMatch[1].trim();
        domRiskScore += 20;
        flags.push(`DOM: Client-side meta-refresh redirect detected (${metaRefreshUrl}).`);
      }
    }

    if (hasEvalUnescape || hasPackedJs) {
      isObfuscated = true;
      domRiskScore += 35;
      flags.push("DOM: Heavy script obfuscation/packer patterns detected.");
    }

    // 6. Detect Empty SPA Single-Page App Roots requiring JS rendering
    const hasEmptyRoot = /<div[^>]+id=["']?(?:root|app|__next)["']?[^>]*>\s*<\/div>/i.test(html);
    const bodyLength = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").trim().length;
    if (hasEmptyRoot && bodyLength < 300) {
      isEmptySpaRoot = true;
    }

  } catch {
    // DOM fetch failed/timed out, non-fatal pass-through
  }

  return {
    hasPasswordField,
    brandMismatch,
    mismatchedBrand,
    isObfuscated,
    hasFormActionHijack,
    isEmptySpaRoot,
    metaRefreshUrl,
    domRiskScore,
    title,
    flags,
  };
}
