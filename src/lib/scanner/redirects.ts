export interface RedirectHop {
  url: string;
  status: number;
}

export interface RedirectTraceResult {
  initialUrl: string;
  finalUrl: string;
  hops: RedirectHop[];
  redirectCount: number;
  circuitBroken: boolean;
  circuitBreakReason?: string;
}

// Regex to detect raw IPv4 addresses (excluding standard hostnames)
const IP_V4_REGEX = /^(?:https?:\/\/)?(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/.*)?$/i;

/**
 * Traces HTTP 3xx redirection chains manually without launching a headless browser.
 * Includes a circuit breaker for malicious protocols (data:, javascript:) and direct IP addresses.
 */
export async function traceRedirectChain(initialUrl: string, maxHops = 5): Promise<RedirectTraceResult> {
  let currentUrl = initialUrl.trim();
  if (!/^https?:\/\//i.test(currentUrl)) {
    currentUrl = `https://${currentUrl}`;
  }

  const hops: RedirectHop[] = [];
  let hopCount = 0;

  while (hopCount < maxHops) {
    // Check circuit breaker conditions on current URL
    if (currentUrl.startsWith('data:') || currentUrl.startsWith('javascript:')) {
      return {
        initialUrl,
        finalUrl: currentUrl,
        hops,
        redirectCount: hops.length,
        circuitBroken: true,
        circuitBreakReason: `Detected unsafe URI protocol scheme (${currentUrl.split(':')[0]}:)`,
      };
    }

    try {
      const parsed = new URL(currentUrl);
      if (IP_V4_REGEX.test(parsed.hostname)) {
        return {
          initialUrl,
          finalUrl: currentUrl,
          hops,
          redirectCount: hops.length,
          circuitBroken: true,
          circuitBreakReason: `Direct unmapped IP address destination detected (${parsed.hostname})`,
        };
      }
    } catch {
      // Invalid URL structure
      return {
        initialUrl,
        finalUrl: currentUrl,
        hops,
        redirectCount: hops.length,
        circuitBroken: true,
        circuitBreakReason: 'Malformed URL in redirection chain',
      };
    }

    const standardHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(3500),
        headers: standardHeaders,
      });

      hops.push({ url: currentUrl, status: response.status });

      const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
      const location = response.headers.get('location');

      if (isRedirect && location) {
        // Resolve relative redirects against current URL
        const nextUrl = new URL(location, currentUrl).toString();
        if (hops.some(h => h.url === nextUrl)) {
          break; // Circular redirect loop detected
        }
        currentUrl = nextUrl;
        hopCount++;
      } else {
        // Destination reached (200, 404, etc.)
        break;
      }
    } catch {
      // If request fails / host unreachable, record current hop with status 0 and stop
      hops.push({ url: currentUrl, status: 0 });
      break;
    }
  }

  return {
    initialUrl,
    finalUrl: currentUrl,
    hops,
    redirectCount: Math.max(0, hops.length - 1),
    circuitBroken: false,
  };
}
