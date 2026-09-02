export interface ThreatIntelResult {
  isThreat: boolean;
  threatType?: string;
  urlStatus?: string;
  tags?: string[];
  reason?: string;
  source: 'URLhaus' | 'None';
}

/**
 * Level 2: Real-Time Threat Intelligence Query (URLhaus API)
 * Queries public malware & phishing feeds before allocating sandbox resources.
 */
export async function queryThreatIntel(targetUrl: string): Promise<ThreatIntelResult> {
  try {
    const params = new URLSearchParams();
    params.append('url', targetUrl);

    const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      return { isThreat: false, source: 'None' };
    }

    const data = await response.json();

    if (data.query_status === 'ok') {
      const threatType = data.threat || 'Malware / Phishing Campaign';
      const tags = Array.isArray(data.tags) ? data.tags : [];

      return {
        isThreat: true,
        threatType,
        urlStatus: data.url_status,
        tags,
        reason: `Confirmed malicious payload indexed in URLhaus threat database (${threatType}, status: ${data.url_status || 'active'})`,
        source: 'URLhaus',
      };
    }

    return { isThreat: false, source: 'None' };
  } catch {
    // Timeout or network error - pass through cleanly without blocking
    return { isThreat: false, source: 'None' };
  }
}
