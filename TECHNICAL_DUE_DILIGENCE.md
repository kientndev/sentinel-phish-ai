# Sentinel Phish AI - Technical Due-Diligence Package
### Platform Architecture & Infrastructure Orchestration Overview
**Prepared for:** Cybersecurity Acquisition Client Evaluation Team  
**Author:** Lead Infrastructure Architect, Sentinel Phish AI  
**Document Classification:** Confidential / Proprietary  

---

## Executive Summary
Sentinel Phish AI is a professional-grade threat intelligence and phishing detection platform combining static heuristic filtering, authoritative metadata analysis, headless browser sandboxing, and vision-based Artificial Intelligence (Google Gemini 1.5 Pro). 

This package details the web development architecture, database schema, session security mechanics, secret isolation strategies, and infrastructure deployment pipelines that allow the platform to autonomously support 600+ active users with high uptime and low operational overhead.

---

## 1. Core Architecture & Pipeline
Sentinel Phish AI uses a multi-layered analysis pipeline built on Next.js serverless API routes (`/api/scan`) and a standalone Python-based desktop automation co-pilot ("Sentinel Buddy"). Below is the technical breakdown of the data flow from ingestion to threat classification.

```
+--------------------------+
| User Request / Scan URL  |
+------------+-------------+
             |
             v
+------------+-------------+
| Next.js Route /api/scan  |
+------------+-------------+
             |
             v
+------------+-------------+
| Phase 1: Whitelist check |
| & Static Heuristics      |
+------------+-------------+
             |
             +-----------------------+
             | (Whitelisted)         | (Not Whitelisted)
             v                       v
+------------+-------------+  +------+---------------------+
| Return SAFE Result       |  | Phase 2: Metadata Query    |
| Score: 0                 |  | (RDAP & WHOIS)             |
+--------------------------+  +------+---------------------+
                                     |
                                     v
                              +------+---------------------+
                              | Phase 3: Sandbox Browser   |
                              | (Playwright Core + Chromium)|
                              +------+---------------------+
                                     |
                                     v
                              +------+---------------------+
                              | Phase 4: Gemini 1.5 Pro    |
                              | AI Vision Analysis         |
                              +------+---------------------+
                                     |
                                     v
                              +------+---------------------+
                              | Phase 5: Score Aggregator  |
                              | & Response Generation      |
                              +----------------------------+
```

### Web Detection Pipeline Details
1. **Request Ingest & Normalization (`src/app/api/scan/route.ts`)**:
   - The route receives a `POST` request containing the destination URL and configuration flags (e.g., `lang` for response language, `turbo` for concurrent resolution).
   - The engine normalizes the target string (e.g., prepending protocols, sanitizing query parameters, and extracting the clean base domain).

2. **Phase 1: Static Heuristics & Whitelisting**:
   - The domain is matched against a high-traffic trust index (`TOP_DOMAINS` in `whitelist.ts`). A whitelist hit bypasses expensive downstream checks, returning a risk score of `0` to prevent false positives on major brands (e.g., Google, Microsoft).
   - Non-whitelist targets are checked for high-risk substrings (`secure-login`, `verify-account`, `update-billing`) and shady top-level domains (e.g., `.xyz`, `.top`, `.click`, `.zip`).
   - Homograph and typosquatting detection checks are run by matching the base name against verified brands using a character-distance algorithm.

3. **Phase 2: Authoritative Domain Metadata (RDAP & WHOIS)**:
   - The system initiates an HTTP request to `https://rdap.org/domain/${domain}` to retrieve structured registrar data, registration timestamps, and expiry events.
   - If RDAP times out or fails, a fallback lookup is performed using the `whoiser` library.
   - Domain age is computed; new domains (< 3 years, and critically < 30 days) receive an automated risk penalty.

4. **Phase 3: Headless Browser Sandboxing (Playwright + Sparticuz Chromium)**:
   - Dynamic Vercel serverless environments have a strict 50MB deployment bundle size limit. The platform overcomes this by using `@sparticuz/chromium` (a compressed, serverless-optimized Chromium binary) alongside `playwright-core`.
   - The serverless function launches Chromium with anti-bot evasion arguments (`--disable-blink-features=AutomationControlled` and custom User-Agent spoofing).
   - The browser navigates to the target URL (25-second timeout, `networkidle` state wait).
   - **DOM Inspection**: Inspects the rendered DOM for sensitive inputs (e.g., `input[type="password"]`). If a password field is active on a newly registered lookalike domain, a critical flag is triggered.
   - **Visual Snapshot**: Captures a full-screen screenshot, converted to a Base64-encoded PNG data URI.

5. **Phase 4: AI Visual Inspection (Google Gemini 1.5 Pro)**:
   - The Base64 image payload and technical metadata (URL, domain age, presence of password field) are sent to the Google Gemini API.
   - The AI evaluates visual cues mimicking legitimate interfaces (brand impersonation), MFA fatigue prompts, suspicious URL/DOM structures, Urgency Vibe Hacking, and SVG/HTML attachments.
   - Gemini returns a structured JSON payload conforming to the threat assessment schema (analysis factors, advisor summary, and risk score).

6. **Phase 5: Scoring Aggregator**:
   - Heuristic weights, metadata flags, and Gemini assessments are combined to produce a finalized risk score (0-100) and status classification (`SAFE` [0-30], `SUSPICIOUS` [31-69], `DANGEROUS` [70-100]).

---

### Python Desktop Automation Co-Pilot ("Sentinel Buddy")
For dedicated operators, a standalone desktop application (`sentinel_buddy_desktop.py` and `automation_engine.py`) provides localized automation.
* **Dual-Engine Automation**: Built using standard Python wrappers, `customtkinter` for visual styling, and PyAutoGUI / Playwright.
* **Task Runner Execution**: Executes atomic web actions (`web_navigate`, `web_click`, `web_type`, `web_scrape`) and native OS commands (`os_mouse_move`, `os_mouse_click`, `os_hotkey`) compiled as an execution chain.
* **Safety Protocols**: Integrates a global keyboard hook listener (`keyboard.add_hotkey('ctrl+shift+q')`) acting as an emergency kill-switch, stopping all input injection and browser actions instantly.

---

## 2. BaaS & Database Schema (Convex)
Convex serves as the real-time database, cloud functions runtime, and state-sync layer.

### Database Schema Definition (`convex/schema.ts`)
Convex schemas are strictly typed and defined in TypeScript. Below is the active production schema structure:

* **`users` Table**:
  - `clerkId` (string, indexed `by_clerk_id`): Relates the database record to the Clerk session identity.
  - `email` / `name` / `imageUrl` (optional strings): Cached user profile details.
  - `totalScans` (number) / `threatsBlocked` (number): Aggregate stats for analytics.
  - `xp` (number, indexed `by_xp`) / `level` (number): Gamification metrics.
* **`partners` Table (Multi-Tenant Configuration)**:
  - `name` (string) / `slug` (string, indexed `by_slug`): Enterprise tenant descriptors.
  - `logoUrl` (optional string) / `primaryColor` (string): Dynamic white-label CSS overrides.
  - `licenseExpiry` (number): Epoch timestamp (ms) validating enterprise access.
* **`waitlist` Table**:
  - `email` (string, indexed `by_email`) / `plan` (string) / `joinedAt` (number).
* **`contacts` Table**:
  - `name` (string) / `email` (string) / `subject` (string) / `message` (string) / `attachmentIds` (optional array of storage IDs mapped to Convex file stores) / `createdAt` (number).

### Reactivity & State Management
* **Auto-Subscribed Queries**: Rather than polling endpoints or managing web sockets manually, the frontend queries use Convex hooks (`useQuery`). The database maintains a persistent WebSocket connection to clients; any update to user documents automatically pushes differential patches, triggering React state updates in real-time.
* **Atomic Mutations**: Database mutations (`convex/users.ts`, `convex/partners.ts`) execute as serialized transactions. In `updateUserStats` or `updatePartnerBySlug`, the engine either fully applies the changes or rolls them back entirely, preventing race conditions during concurrent user operations.

---

## 3. Auth & Session Security (Clerk)
Sentinel Phish AI offloads core identity management and security policy enforcement to Clerk, providing enterprise-grade authentication.

### Key Security Implementations
* **Secure JWT Session Handling**: Clerk issues cryptographic JSON Web Tokens (JWT) stored in secure, `HttpOnly`, `SameSite=Lax` browser cookies. This configuration isolates tokens from JavaScript execution contexts, mitigating Cross-Site Scripting (XSS) and Session Hijacking.
* **Session Verification Guard**: The page router wraps administrative and scanning panels in `<LoginGuard>` (located in `src/components/LoginGuard.tsx`). Unauthenticated sessions are redirected to the secure login route.
* **Convex Authentication Integration**: The application initializes database queries using Clerk keys. Convex validates user credentials out-of-band by fetching Clerk’s public JSON Web Key Sets (JWKS) to cryptographically verify the JWT signatures.
* **User Synchronization**: Upon successful sign-in, the profile page executes the `getOrCreateUser` mutation in Convex. This upserts user identity information and provisions default usage limits (credits, level).

---

## 4. Secrets & Key Management
To prevent critical API key leaks and maintain the integrity of production workloads, a strict environment variable isolation policy is enforced.

### Secret Isolation Architecture
1. **Public vs. Private Variable Separation**:
   - **Client-Accessible variables**: Prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CONVEX_URL`). These are baked into the compiled client application and are public.
   - **Server-Only secrets**: Omit the prefix (e.g., `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `CLERK_SECRET_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`). Next.js guarantees these secrets are restricted to the serverless runtime and are never sent to the client browser.

2. **Serverless Secret Injection**:
   - Environment variables are encrypted and managed in the **Vercel Project Dashboard** and **Convex Environment Variables**. Keys are injected into serverless instances during runtime bootstrap, eliminating the need to write configuration keys directly to the repository filesystem.
   - Local development uses a `.env.local` file which is blacklisted from Git inside `.gitignore`.

3. **Desktop Executable Security (Sentinel Buddy)**:
   - During local compilation via PyInstaller, no `.env` files are bundled.
   - The desktop client reads keys from system-level environment variables or accepts manual config input in the UI, ensuring no static analysis of compiled binaries can extract the production developer keys.

---

## 5. Deployment & Automation State
The infrastructure operates entirely serverless, running on "autopilot" to manage resource allocation and multi-tenant subscriptions.

### Infrastructure Topology
* **Frontend/API Layer**: **Vercel Serverless Hosting**. Static pages are cached at edge locations using Vercel's Edge Network, ensuring sub-100ms loading times globally. Dynamic scanning requests scale horizontally to handle request spikes automatically.
* **Database & Compute Layer**: **Convex Cloud**. Provides scalable transactional database queries and serverless triggers without server maintenance or manual resource scaling.
* **Billing & Subscription Webhooks**: **Lemon Squeezy Integration**.
  - A secure endpoint `/api/webhooks/lemonsqueezy` receives cryptographically signed webhooks for billing events.
  - The endpoint validates signatures using a SHA-256 HMAC verification process (`verifyWebhookSignature`).
  - Upon receiving a successful `order_created` payment event, the system calculates the license duration (1 year) and executes `api.partners.updatePartnerBySlug` in Convex, renewing tenant license access autonomously.
  - License gatekeepers (`lib/licenseGatekeeper.ts`) read host subdomains dynamically, blocking scan requests if the respective partner's license has expired (`licenseExpiry < Date.now()`).

### Autopilot Mechanics for 600+ Users
* **Dynamic Scaling**: Headless browser automation relies on `@sparticuz/chromium` running on AWS Lambda (via Vercel). Concurrent requests spin up separate serverless execution blocks, eliminating bottle-necks.
* **No-Database Guest Mode**: If database connectivity or environmental configurations are missing, the UI defaults back to a local storage-backed scanning hook (`usePhishTank.ts`), preserving system availability.
* **White-Label DNS Resolution**: Subdomain parsing logic resolves partner custom domains dynamically. The codebase handles custom styling, custom logo mapping, and licensing restrictions entirely in the database layer, allowing new enterprise portals to be launched instantly without deploying code.
