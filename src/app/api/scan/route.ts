import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { chromium: playwright } = require('playwright-core');
const chromium = require('@sparticuz/chromium');
const whoiser = require('whoiser');
import { TOP_DOMAINS } from './whitelist';

export const maxDuration = 60; 

const HIGH_RISK_KEYWORDS = ['secure-login', 'verify-account', 'update-billing', 'signin-portal', 'account-security', 'confirm-identity'];
const SHADY_TLDS = ['.xyz', '.top', '.click', '.zip'];

// Real WHOIS lookup
async function getRealWhois(domain: string) {
  try {
    let creationDate = null;
    let expiryDate = 'Unknown';
    let registrar = 'Unknown Registry';

    try {
      const rdapRes = await fetch(`https://rdap.org/domain/${domain}`, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(5000) });
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
    } catch(e) {}

    if (!creationDate) {
        const data = await whoiser(domain, { follow: 1, timeout: 5000 });
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
  } catch (err) {
    return { ageText: 'Brand New', registrar: 'Private Registration', expiryDate: 'Unknown', trusted: false };
  }
}

function isLookalike(hostname: string) {
  let isLookalike = false;
  if (hostname.includes('I') || hostname.includes('0') || hostname.includes('1')) isLookalike = true;
  
  const baseName = hostname.split('.')[0];
  TOP_DOMAINS.forEach(w => {
    const brand = w.split('.')[0];
    if (baseName !== brand && baseName.includes(brand)) isLookalike = true;
    if (baseName !== brand && brand.length === baseName.length && brand.length > 4) {
       let diffs = 0;
       for(let i=0; i<brand.length; i++) {
           if(baseName[i] !== brand[i]) diffs++;
       }
       if (diffs === 1 || diffs === 2) isLookalike = true;
    }
  });
  return isLookalike;
}

async function runBrowserAnalysis(url: string) {
  let pageAccessible = true;
  let screenshotDataUri = "";
  let domAnalysis = { hasPasswordField: false };

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
      await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
      const hasPassword = await page.$('input[type="password"]');
      domAnalysis.hasPasswordField = !!hasPassword;

      const screenshotBuffer = await page.screenshot({ type: 'png' });
      screenshotDataUri = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
    } catch (e) {
      pageAccessible = false;
    } finally {
      await browser.close();
    }
  } catch (err) {
    pageAccessible = false;
  }
  return { pageAccessible, screenshotDataUri, domAnalysis };
}

const LANG_NAMES: Record<string, string> = {
  en: 'English', vi: 'Vietnamese', ja: 'Japanese', es: 'Spanish', zh: 'Chinese (Simplified)',
};

export async function POST(req: Request) {
  try {
    const { url, lang = 'en', turbo = false } = await req.json();
    const languageName = LANG_NAMES[lang] ?? 'English';
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
    const isWhitelisted = TOP_DOMAINS.includes(domain);

    const flags: string[] = [];
    let riskScore = isWhitelisted ? 0 : 15;

    if (url.startsWith('http://') && !url.includes('localhost')) {
        flags.push('Static: Non-HTTPS insecure connection.');
        riskScore += 20;
    }

    const hasKeyword = HIGH_RISK_KEYWORDS.some(kw => url.toLowerCase().includes(kw));
    if (hasKeyword && !isWhitelisted) {
        flags.push('Static: URL utilizes highly specific phishing keywords.');
        riskScore += 50;
    }

    const lookalike = isLookalike(domain);
    if (lookalike && !isWhitelisted) {
        flags.push('Static: Domain Name structurally resembles a known brand.');
        riskScore += 30;
    }

    let whois;
    let browserAnalysis;
    if (turbo) {
      const [w, b] = await Promise.all([getRealWhois(domain), runBrowserAnalysis(url)]);
      whois = w; browserAnalysis = b;
    } else {
      whois = await getRealWhois(domain);
      browserAnalysis = await runBrowserAnalysis(url);
    }

    if (!whois.trusted && !isWhitelisted) {
        flags.push('WHOIS: New domain registration.');
        riskScore += 20;
    }

    const { pageAccessible, screenshotDataUri, domAnalysis } = browserAnalysis;
    if (!pageAccessible) {
        flags.push('Site Offline - URL Pattern Analysis suggests HIGH RISK');
    } else {
        if (domAnalysis.hasPasswordField && lookalike) {
            flags.push('CRITICAL: Suspicious lookalike domain actively containing a credential harvester form.');
            riskScore += 40;
        } else if (domAnalysis.hasPasswordField && !whois.trusted && !isWhitelisted) {
            flags.push('Active DOM: Untrusted new domain requesting passwords.');
            riskScore += 20;
        }
    }

    let geminiVerdict = null;
    if (apiKey && screenshotDataUri) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const prompt = `You are SentinelPhish AI, an elite cybersecurity analyst (Specializing in 2026 Threat Trends).
CRITICAL LANGUAGE INSTRUCTION: Write ALL response text in ${languageName}.
TASK: Analyze the provided screenshot & threat intel. Detect 2026 techniques:
1. MFA FATIGUE: Fake 2FA prompts on non-official sites.
2. INTELLIGENT SPOOFING: If UI matches a service but URL (${url}) is false, flag 100% MALICIOUS.
3. SVG/HTML ATTACHMENTS: High risk if .svg/.html contains a login portal.
4. VIBE HACKING: Detect urgency ('Account deleted in 2h').
--- NO EXCEPTIONS RULE ---
Even if URL is google.com, verify authenticity. Alert if SSL/logo/font artifacts seem off.
--- RISK SCALE ---
0–15: SAFE | 16–40: CAUTION | 41–70: HIGH RISK | 71–100: MALICIOUS
--- INPUT ---
URL: ${url} | Domain Age: ${whois.ageText} | Has Password Field: ${domAnalysis.hasPasswordField}
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
      } catch (err) {
        // Gemini AI Error
      }
    }

    riskScore = Math.min(riskScore, 100);
    let status = 'SAFE';
    if (riskScore > 30) status = 'SUSPICIOUS';
    if (riskScore >= 70) status = 'DANGEROUS';

    return NextResponse.json({
      score: riskScore, status,
      domainAge: whois.ageText, expiryDate: whois.expiryDate, registrar: whois.registrar,
      redFlags: flags.length > 0 ? flags : ["No targeted threats detected."],
      screenshotUrl: screenshotDataUri, geminiVerdict
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
