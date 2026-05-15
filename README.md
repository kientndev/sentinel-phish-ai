# SentinelPhish

**Advanced AI-Powered Phishing Detection & URL Security Analysis**

> SentinelPhish is a professional-grade security tool that combines multi-layered analysis with AI-powered threat detection to identify phishing attempts, suspicious domains, and credential harvesting sites in real-time.

---

## 🛡️ Project Overview

SentinelPhish addresses the critical security challenge of detecting increasingly sophisticated phishing attacks that evade traditional email filters. By analyzing URLs across multiple dimensions—domain reputation, visual fingerprinting, structural analysis, and AI-driven content inspection—SentinelPhish provides organizations and security professionals with a comprehensive assessment of URL safety before interaction occurs.

### Key Capabilities

- **Multi-Dimensional URL Analysis**: Combines WHOIS data, domain age checks, RDAP lookups, and visual fingerprinting
- **AI-Powered Visual Inspection**: Uses Google Gemini to analyze page screenshots for credential harvesters and lookalike attacks
- **Real-Time Risk Scoring**: Delivers actionable 0-100 risk scores with categorized threat levels (SAFE/SUSPICIOUS/DANGEROUS)
- **PhishTank Integration**: Leverages community-reported phishing databases for known threats
- **Enterprise-Ready Authentication**: Built-in user management and session handling via Clerk
- **Persistent Threat Database**: Optional Convex backend for storing scan history and analytics

---

## 🔒 Security Features

### Technical Depth

SentinelPhish employs a sophisticated multi-layered analysis engine:

#### 1. Domain Reputation Layer
- **WHOIS Analysis**: Extracts domain registration date, registrar information, and expiry dates
- **RDAP Queries**: Retrieves authoritative domain registration data
- **Age-Based Risk Scoring**: Penalizes newly registered domains (< 30 days)
- **Trusted Registrar Detection**: Cross-references against known legitimate registrars

#### 2. Visual Fingerprinting Layer
- **Automated Screenshot Capture**: Uses Puppeteer/Playwright to render pages in headless browser
- **AI-Powered Content Analysis**: Google Gemini analyzes screenshots for:
  - Password input fields on untrusted domains
  - Visual similarity to legitimate sites
  - Suspicious form structures and layouts
- **DOM Analysis**: Detects credential harvesting indicators in page structure

#### 3. Structural Analysis Layer
- **Lookalike Detection**: Identifies homograph attacks and typosquatting
- **URL Pattern Matching**: Detects suspicious URL structures and subdomain abuse
- **Character Encoding Analysis**: Flags Unicode-based obfuscation attempts

#### 4. Community Intelligence Layer
- **PhishTank Integration**: Checks against community-reported phishing databases
- **Whitelist Management**: Maintains trusted domain exclusions
- **Real-Time Reporting**: Allows users to report new threats to PhishTank

### Risk Scoring Algorithm

The risk scoring engine combines weighted factors:
- Domain Age: -40 points (new domains)
- Untrusted Registrar: +20 points
- Password Field on Untrusted Domain: +20 points
- Lookalike with Password Field: +40 points
- PhishTank Match: +30 points
- Known Safe Domain: -50 points

**Final Scores:**
- 0-30: SAFE
- 31-69: SUSPICIOUS
- 70-100: DANGEROUS

---

## 🚀 Setup Guide

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Operating System**: Windows, macOS, or Linux

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/sentinel-phish.git
   cd sentinelphishai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and fill in the required API keys:
   
   **Required Keys:**
   - `GOOGLE_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Get from [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
   - `CLERK_SECRET_KEY`: Get from [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
   
   **Optional Keys:**
   - `NEXT_PUBLIC_CONVEX_URL`: Get from [Convex Dashboard](https://dashboard.convex.dev) (for persistent storage)
   - `NEXT_PUBLIC_BASE_URL`: Set if deploying to a custom domain (defaults to http://localhost:3000)

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

### Production Build

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start the Production Server**
   ```bash
   npm start
   ```

---

## ⚡ Quick Start (Smoke Test)

After installation, verify your setup with this quick test:

1. **Launch the Application**
   ```bash
   npm run dev
   ```

2. **Open in Browser**
   Navigate to `http://localhost:3000`

3. **Test with Known Safe URL**
   - Enter: `https://google.com`
   - Click "Scan URL"
   - Expected Result: Risk score ≤ 30 (SAFE)

4. **Test with Known Phishing URL**
   - Enter: `https://phishing-site.example.com` (use a known test phishing site)
   - Click "Scan URL"
   - Expected Result: Risk score ≥ 70 (DANGEROUS)

5. **Verify AI Analysis**
   - Check that screenshot capture works
   - Confirm Gemini AI provides visual analysis
   - Review risk flags and actionable advice

If all tests pass, your installation is ready for production use.

---

## 📁 Project Structure

```
sentinelphishai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/          # URL scanning API endpoint
│   │   │   ├── chat/          # AI chat endpoint
│   │   │   └── credits/       # Credit management
│   │   ├── dashboard/         # User dashboard with analytics
│   │   ├── profile/           # User profile and settings
│   │   ├── reports/           # Community threat reports
│   │   ├── scanning/          # Main scanning interface
│   │   └── layout.tsx         # Root layout with providers
│   ├── components/
│   │   ├── ClientOnly.tsx     # SSR-safe wrapper
│   │   ├── ConvexClientProvider.tsx
│   │   ├── Navbar.tsx
│   │   └── XPBar.tsx
│   ├── context/
│   │   ├── AppContext.tsx     # Application state
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── usePhishTank.ts    # PhishTank integration
│   │   └── useSafeQuery.ts    # Convex query wrapper
│   └── lib/
├── convex/                    # Convex backend functions
├── public/                    # Static assets
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── next.config.ts            # Next.js configuration
└── README.md                 # This file
```

---

## 🎯 Demo Protocol (60-Second Sales Walkthrough)

### Preparation

1. **Set up a clean environment** with all API keys configured
2. **Prepare test URLs**:
   - Safe URL: `https://google.com` or `https://microsoft.com`
   - Phishing URL: Use a known test site from PhishTank or a controlled test environment

### Recording Script (60 Seconds)

**0:00-0:10 - Introduction**
- Show the application interface
- Brief: "Welcome to SentinelPhish, AI-powered phishing detection"

**0:10-0:25 - Safe URL Test**
- Enter safe URL (google.com)
- Click "Scan URL"
- Show risk score: "15 - SAFE"
- Highlight: "Green status, no red flags"

**0:25-0:45 - Phishing URL Test**
- Enter phishing test URL
- Click "Scan URL"
- Show risk score: "85 - DANGEROUS"
- Highlight: "Red status, multiple red flags detected"
- Show AI analysis: "Gemini AI detected credential harvester"

**0:45-0:60 - Conclusion**
- Show report download
- Highlight: "Actionable intelligence in seconds"
- Call to action: "Protect your organization today"

### Tips for Professional Recording

- Use screen recording software with high quality (1080p or 4K)
- Clean browser window (no other tabs visible)
- Smooth mouse movements
- Clear voiceover or on-screen text
- Add subtle background music (optional)

---

## ⚠️ Safety Disclaimer

**IMPORTANT LEGAL NOTICE**

SentinelPhish is a security audit tool designed for authorized use only. This software is intended for:

- Security professionals conducting authorized security assessments
- Organizations protecting their own infrastructure and users
- Educational purposes for security awareness training
- Authorized penetration testing with proper permissions

**Unauthorized Use Prohibited**

- Do not use SentinelPhish to scan websites without explicit authorization
- Do not use for malicious purposes, harassment, or illegal activities
- Compliance with all applicable laws and regulations is your responsibility
- Users are solely liable for their use of this software

**Data Privacy**

- No scanned URLs are stored unless using the optional Convex backend
- All analysis is performed in real-time
- Screenshot data is processed by Google Gemini AI; review their privacy policy

**Warranty Disclaimer**

This software is provided "as is" without warranty of any kind. The authors and contributors assume no liability for damages arising from its use.

---

## 🔧 Configuration

### Advanced Settings

**Custom Risk Thresholds**
Modify the risk scoring logic in `src/app/api/scan/route.ts`

**Whitelist Domains**
Edit the whitelist in `src/app/api/scan/whitelist.ts`

**Adjust AI Prompts**
Modify Gemini prompts in `src/app/api/scan/route.ts`

---

## 📝 License

This software is proprietary. Contact kien.eat.pizza@gmail.com or trikientrannam@gmail.com for licensing information.

---

## 🤝 Support

For technical support or licensing inquiries, contact:
- Email: trikientrannam@gmail.com
- Documentation: https://docs.example.com
- Issues: https://github.com/your-org/sentinel-phish/issues

---

**SentinelPhish — Protecting organizations from phishing threats with AI-powered security analysis.**
