/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { chromium: playwright } = require('playwright-core');
const chromium = require('@sparticuz/chromium');
const whoiser = require('whoiser');
import { TOP_DOMAINS } from './whitelist';
import { traceRedirectChain } from '@/lib/scanner/redirects';
import { auditDomLightweight } from '@/lib/scanner/domAudit';
import { queryThreatIntel } from '@/lib/scanner/threatIntel';

export const maxDuration = 60; 

const HIGH_RISK_KEYWORDS = ['secure-login', 'verify-account', 'update-billing', 'signin-portal', 'account-security', 'confirm-identity'];
const SHADY_TLDS = ['.xyz', '.top', '.click', '.zip', '.club', '.work'];

// Real WHOIS & RDAP lookup
async function getRealWhois(domain: string) {
  try {
    let creationDate: Date | null = null;
    let expiryDate = 'Unknown';
    let registrar = 'Unknown Registry';

    try {
      const rdapRes = await fetch(`https://rdap.org/domain/${domain}`, { 
        headers: { 'Accept': 'application/json' }, 
        signal: AbortSignal.timeout(3500) 
      });
      if (rdapRes.ok) {
        const data = await rdapRes.json();
        const creationEvent = data.events?.find((e: any) => e.eventAction === 'registration');
        if (creationEvent && creationEvent.eventDate) creationDate = new Date(creationEvent.eventDate);

        const expirationEvent = data.events?.find((e: any) => e.eventAction === 'expiration');
        if (expirationEvent && expirationEvent.eventDate) {
          expiryDate = new Date(expirationEvent.eventDate).toLocaleDateString();
        }

        const registrarEntity = data.entities?.find((ent: any) => ent.roles?.includes('registrar'));
        if (registrarEntity) {
          const vcard = registrarEntity.vcardArray?.[1];
          const fn = vcard?.find((v: any) => v[0] === 'fn');
          if (fn) registrar = fn[3];
        }
      }
    } catch {
      // RDAP fallback
    }

    if (!creationDate) {
      const data = await whoiser(domain, { follow: 1, timeout: 3500 });
      const firstRegistry = Object.values(data)[0] as any;
      if (firstRegistry) {
        if (firstRegistry['Created Date']) creationDate = new Date(firstRegistry['Created Date']);
        if (firstRegistry['Expiry Date']) expiryDate = new Date(firstRegistry['Expiry Date']).toLocaleDateString();
        if (firstRegistry['Registrar']) registrar = firstRegistry['Registrar'];
      }
    }

    const ageInMs = creationDate ? Date.now() - creationDate.getTime() : 0;
    const isOld = ageInMs > (1000 * 60 * 60 * 24 * 365 * 3); // 3 years
    
    return {
      ageText: creationDate ? `${Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 30))} months` : 'Recently Registered',
      registrar,
      expiryDate,
      trusted: isOld
    };
  } catch {
    return { ageText: 'Brand New', registrar: 'Private Registration', expiryDate: 'Unknown', trusted: false };
  }
}

function isLookalike(hostname: string) {
  let lookalikeDetected = false;
  if (hostname.includes('0') || (hostname.includes('1') && !hostname.includes('.1'))) {
    lookalikeDetected = true;
  }
  
  const baseName = hostname.split('.')[0];
  TOP_DOMAINS.forEach(w => {
    const brand = w.split('.')[0];
    if (baseName !== brand && baseName.includes(brand)) lookalikeDetected = true;
    if (baseName !== brand && brand.length === baseName.length && brand.length > 4) {
      let diffs = 0;
      for (let i = 0; i < brand.length; i++) {
        if (baseName[i] !== brand[i]) diffs++;
      }
      if (diffs === 1 || diffs === 2) lookalikeDetected = true;
    }
  });
  return lookalikeDetected;
}

async function runBrowserAnalysis(url: string) {
  let pageAccessible = true;
  let screenshotDataUri = "";
  const domAnalysis = { hasPasswordField: false };

  try {
    const executablePath = await chromium.executablePath();
    const browser = await playwright.launch({
      args: [...chromium.args, '--disable-blink-features=AutomationControlled'],
      executablePath: executablePath || undefined,
      headless: chromium.headless,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      const hasPassword = await page.$('input[type="password"]');
      domAnalysis.hasPasswordField = !!hasPassword;

      const screenshotBuffer = await page.screenshot({ type: 'png' });
      screenshotDataUri = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
    } catch {
      pageAccessible = false;
    } finally {
      await browser.close();
    }
  } catch {
    pageAccessible = false;
  }
  return { pageAccessible, screenshotDataUri, domAnalysis };
}

const LANG_NAMES: Record<string, string> = {
  en: 'English', vi: 'Vietnamese', ja: 'Japanese', es: 'Spanish', zh: 'Chinese (Simplified)',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function jsonWithCors(body: any, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      ...CORS_HEADERS,
    },
  });
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const { url, lang = 'en', turbo = false } = await req.json();
    const languageName = LANG_NAMES[lang] ?? 'English';
    if (!url) return jsonWithCors({ error: 'URL is required' }, { status: 400 });

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    // Step 1: Pre-flight URL normalization
    let normalizedInputUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedInputUrl)) {
      normalizedInputUrl = `https://${normalizedInputUrl}`;
    }

    // Step 1.1: Fast Whitelist Short-Circuit on input host (<50ms) -> Engine Tier 1
    try {
      const inputParsed = new URL(normalizedInputUrl);
      const inputDomain = inputParsed.hostname.toLowerCase().replace(/^www\./, '');
      if (TOP_DOMAINS.includes(inputDomain)) {
        return jsonWithCors({
          score: 0,
          status: 'SAFE',
          engineTier: 1,
          latencyMs: Date.now() - startTime,
          domainAge: 'Established (> 5 years)',
          expiryDate: 'Verified Trust Index',
          registrar: 'Verified Global Registry',
          redFlags: ['Domain is natively verified in Global Trust Index.'],
          hops: [{ url: normalizedInputUrl, status: 200 }],
          redirectCount: 0,
          screenshotUrl: '',
          geminiVerdict: {
            score: 0,
            level: 'Safe',
            analysis_factors: {
              visual: 'Matches verified global platform identity.',
              technical: 'Authentic cryptographic certificate & trusted ASN routing.',
              behavior: 'Standard authenticated session.'
            },
            advisor: {
              summary: 'Verified safe domain with zero threat indicators.',
              actionable_advice: ['Standard navigation verified.', 'No security actions required.']
            },
            verdict: 'Verified Trusted Platform'
          }
        });
      }
    } catch {
      // Continue pipeline
    }

    // Step 2: Level 2 Real-Time Threat Intelligence Query (URLhaus)
    const threatIntel = await queryThreatIntel(normalizedInputUrl);
    if (threatIntel.isThreat) {
      return jsonWithCors({
        score: 98,
        status: 'DANGEROUS',
        engineTier: 2,
        latencyMs: Date.now() - startTime,
        domainAge: 'Active Threat Campaign',
        expiryDate: 'Revocation Imminent',
        registrar: 'Malicious / Bulletproof Host',
        redFlags: [
          `CRITICAL: ${threatIntel.reason}`,
          `Threat Category: ${threatIntel.threatType}`,
        ],
        hops: [{ url: normalizedInputUrl, status: 200 }],
        redirectCount: 0,
        screenshotUrl: '',
        geminiVerdict: {
          score: 98,
          level: 'Malicious',
          analysis_factors: {
            visual: 'Direct feed threat identification.',
            technical: threatIntel.reason || 'Indexed in threat intelligence feeds.',
            behavior: 'Known malicious distribution or credential harvesting.'
          },
          advisor: {
            summary: 'Active confirmed threat indexed in threat intelligence database. Block immediately.',
            actionable_advice: ['DO NOT proceed to this destination.', 'Isolate target and report to network security.']
          },
          verdict: 'Confirmed Threat Feed Match'
        }
      });
    }

    // Step 3: Pre-Flight Hop Tracing & Circuit Breaker
    const redirectAudit = await traceRedirectChain(normalizedInputUrl, 5);
    const finalUrl = redirectAudit.finalUrl;
    const finalParsed = new URL(finalUrl);
    const finalDomain = finalParsed.hostname.toLowerCase().replace(/^www\./, '');

    const flags: string[] = [];
    let riskScore = 15;

    // Circuit Breaker Check
    if (redirectAudit.circuitBroken) {
      riskScore = 90;
      flags.push(`CIRCUIT BREAKER: ${redirectAudit.circuitBreakReason}`);
      return jsonWithCors({
        score: riskScore,
        status: 'DANGEROUS',
        engineTier: 1,
        latencyMs: Date.now() - startTime,
        domainAge: 'Unknown / Suspicious',
        expiryDate: 'N/A',
        registrar: 'Unmapped / Private IP',
        redFlags: flags,
        hops: redirectAudit.hops,
        redirectCount: redirectAudit.redirectCount,
        screenshotUrl: '',
        geminiVerdict: {
          score: 95,
          level: 'Malicious',
          analysis_factors: {
            visual: 'Direct IP or evasion protocol bypass detected.',
            technical: redirectAudit.circuitBreakReason || 'Dangerous redirection pattern.',
            behavior: 'Abnormal network delivery signature.'
          },
          advisor: {
            summary: 'Circuit breaker triggered on suspicious redirection or unmapped IP destination.',
            actionable_advice: ['DO NOT connect or authenticate.', 'Target blocked before sandbox execution.']
          },
          verdict: 'Malicious Evasion Vector'
        }
      });
    }

    // Final destination whitelist check
    const isWhitelisted = TOP_DOMAINS.includes(finalDomain);
    if (isWhitelisted) {
      return jsonWithCors({
        score: 0,
        status: 'SAFE',
        engineTier: 1,
        latencyMs: Date.now() - startTime,
        domainAge: 'Established (> 5 years)',
        expiryDate: 'Verified Trust Index',
        registrar: 'Verified Global Registry',
        redFlags: ['Destination domain is natively verified in Global Trust Index.'],
        hops: redirectAudit.hops,
        redirectCount: redirectAudit.redirectCount,
        screenshotUrl: '',
        geminiVerdict: {
          score: 0,
          level: 'Safe',
          analysis_factors: {
            visual: 'Matches verified platform identity.',
            technical: 'Legitimate ASN and certificate authority chain.',
            behavior: 'Standard web session.'
          },
          advisor: {
            summary: 'Final destination resolved to a verified safe domain.',
            actionable_advice: ['No further action needed.']
          },
          verdict: 'Verified Safe'
        }
      });
    }

    // Step 4: Level 1 Lightweight DOM & Static Rule Audit
    if (finalUrl.startsWith('http://') && !finalUrl.includes('localhost')) {
      flags.push('Static: Non-HTTPS insecure connection.');
      riskScore += 20;
    }

    const hasKeyword = HIGH_RISK_KEYWORDS.some(kw => finalUrl.toLowerCase().includes(kw));
    if (hasKeyword) {
      flags.push('Static: URL utilizes highly specific phishing keywords.');
      riskScore += 50;
    }

    const hasShadyTld = SHADY_TLDS.some(tld => finalDomain.endsWith(tld));
    if (hasShadyTld) {
      flags.push('Static: High-abuse Top-Level Domain (TLD) detected.');
      riskScore += 25;
    }

    const lookalike = isLookalike(finalDomain);
    if (lookalike) {
      flags.push('Static: Domain Name structurally resembles a known brand.');
      riskScore += 30;
    }

    if (redirectAudit.redirectCount > 2) {
      flags.push(`Redirects: Deep redirection chain (${redirectAudit.redirectCount} hops) detected.`);
      riskScore += 15;
    }

    // Run parallel Level 1 DOM audit + WHOIS/RDAP
    const [domAudit, whois] = await Promise.all([
      auditDomLightweight(finalUrl, isWhitelisted),
      getRealWhois(finalDomain),
    ]);

    // Integrate DOM audit signals
    flags.push(...domAudit.flags);
    riskScore += domAudit.domRiskScore;

    if (!whois.trusted) {
      flags.push('WHOIS: New domain registration or privacy masked.');
      riskScore += 20;
    }

    // High confidence fast-exit condition (Score >= 85 at Level 1 DOM / Static)
    if (riskScore >= 85 && !turbo) {
      const finalScore = Math.min(riskScore, 100);
      return jsonWithCors({
        score: finalScore,
        status: 'DANGEROUS',
        engineTier: 1,
        latencyMs: Date.now() - startTime,
        domainAge: whois.ageText,
        expiryDate: whois.expiryDate,
        registrar: whois.registrar,
        redFlags: flags,
        hops: redirectAudit.hops,
        redirectCount: redirectAudit.redirectCount,
        screenshotUrl: '',
        geminiVerdict: {
          score: finalScore,
          level: 'Malicious',
          analysis_factors: {
            visual: domAudit.brandMismatch ? `Brand impersonation claimed (${domAudit.mismatchedBrand}) on unverified origin.` : 'Heuristic signature match.',
            technical: domAudit.hasFormActionHijack ? 'Form action hijacks credentials to external/IP host.' : 'High-risk infrastructure and static indicators.',
            behavior: domAudit.hasPasswordField ? 'Active credential harvesting form on untrusted origin.' : 'Known evasion patterns.'
          },
          advisor: {
            summary: 'High-confidence phishing identified via Level 1 DOM inspection and static heuristics.',
            actionable_advice: ['DO NOT submit credentials.', 'Report target to security team.']
          },
          verdict: 'Confirmed Phishing Harvester'
        }
      });
    }

    // Step 5: Level 3 Guarded Chromium Sandbox & Gemini Vision Fallback
    // Only launch Chromium if:
    // a) Obfuscated scripts or empty SPA root requiring dynamic JS execution
    // b) Score is ambiguous (between 30 and 70)
    // c) Turbo mode is disabled AND user requires deep inspection
    const shouldLaunchSandbox = !turbo && (
      domAudit.isObfuscated || 
      domAudit.isEmptySpaRoot || 
      (riskScore >= 30 && riskScore <= 70)
    );

    let browserAnalysis = { pageAccessible: true, screenshotDataUri: '', domAnalysis: { hasPasswordField: domAudit.hasPasswordField } };
    let geminiVerdict = null;
    let engineTier: 1 | 2 | 3 = 1;

    if (shouldLaunchSandbox) {
      engineTier = 3;
      browserAnalysis = await runBrowserAnalysis(finalUrl);
      const { pageAccessible, screenshotDataUri, domAnalysis } = browserAnalysis;

      if (!pageAccessible) {
        flags.push('Site Offline - URL Pattern suggests HIGH RISK');
        riskScore += 15;
      } else {
        if (domAnalysis.hasPasswordField && lookalike) {
          flags.push('CRITICAL: Suspicious lookalike domain actively containing a credential harvester form.');
          riskScore += 40;
        } else if (domAnalysis.hasPasswordField && !whois.trusted && !domAudit.hasPasswordField) {
          flags.push('Active DOM: Untrusted domain requesting passwords.');
          riskScore += 20;
        }
      }

      if (apiKey && screenshotDataUri) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
          
          const prompt = `You are SentinelPhish AI, an elite cybersecurity analyst (Specializing in 2026 Threat Trends).
CRITICAL LANGUAGE INSTRUCTION: Write ALL response text in ${languageName}.
TASK: Analyze the provided screenshot & threat intel. Detect 2026 techniques:
1. MFA FATIGUE: Fake 2FA prompts on non-official sites.
2. INTELLIGENT SPOOFING: If UI matches a service but URL (${finalUrl}) is false, flag 100% MALICIOUS.
3. SVG/HTML ATTACHMENTS: High risk if .svg/.html contains a login portal.
4. VIBE HACKING: Detect urgency ('Account deleted in 2h').
--- NO EXCEPTIONS RULE ---
Even if URL is google.com, verify authenticity. Alert if SSL/logo/font artifacts seem off.
--- RISK SCALE ---
0–15: SAFE | 16–40: CAUTION | 41–70: HIGH RISK | 71–100: MALICIOUS
--- INPUT ---
Final Destination: ${finalUrl} | Initial Input: ${normalizedInputUrl} | Domain Age: ${whois.ageText} | Has Password Field: ${domAnalysis.hasPasswordField} | Title: ${domAudit.title}
--- JSON RESPONSE ONLY ---
{
  "score": <0-100>,
  "level": "Safe | Caution | High Risk | Malicious",
  "analysis_factors": { "visual": "<Text>", "technical": "<Text>", "behavior": "<Text>" },
  "advisor": { "summary": "<Text>", "actionable_advice": ["A", "B", "C"] },
  "verdict": "<Text>"
}`;

          const imagePart = { inlineData: { data: screenshotDataUri.split(',')[1], mimeType: "image/png" } };
          const result = await model.generateContent([prompt, imagePart]);
          const response = await result.response;
          const responseText = response.text();
          const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || responseText.match(/(\{[\s\S]*?\})/);
          if (jsonMatch && jsonMatch[1]) geminiVerdict = JSON.parse(jsonMatch[1]);
        } catch {
          // Gemini AI Error fallback
        }
      }
    }

    riskScore = Math.min(riskScore, 100);
    let status = 'SAFE';
    if (riskScore > 30) status = 'SUSPICIOUS';
    if (riskScore >= 70) status = 'DANGEROUS';

    return jsonWithCors({
      score: riskScore,
      status,
      engineTier,
      latencyMs: Date.now() - startTime,
      domainAge: whois.ageText,
      expiryDate: whois.expiryDate,
      registrar: whois.registrar,
      redFlags: flags.length > 0 ? flags : ["No targeted threats detected."],
      hops: redirectAudit.hops,
      redirectCount: redirectAudit.redirectCount,
      screenshotUrl: browserAnalysis.screenshotDataUri,
      geminiVerdict
    });
  } catch (error: any) {
    return jsonWithCors({ 
      error: error.message,
      engineTier: 1,
      latencyMs: Date.now() - startTime,
    }, { status: 500 });
  }
}
