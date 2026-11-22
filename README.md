# Perisai — Privacy-First Scam Checker

**Perisai** (Indonesian for "shield") checks suspicious messages for scams
using **hybrid AI**: instant, private triage runs **on-device** with
Gemini Nano, and deep investigation runs **in the cloud** with Gemini —
both through [Firebase AI Logic](https://firebase.google.com/docs/ai-logic).

Built for **#BuildHybridAI 2026** (Google / Devpost).

🔗 **Live demo:** https://andiPangeranm142.github.io/perisai/

## Why Perisai

Online scams cost Indonesians trillions of rupiah every year, and the
victims are often elderly people and first-time internet users. Scam
messages contain sensitive personal data — uploading them to a cloud
service just to check them creates a second privacy risk.

Perisai's insight: **privacy is the feature.** Triage runs entirely on the
user's device, so the message never leaves their phone — and it works
offline. The cloud is used only when it adds real value: deep analysis of
risky or ambiguous messages, and reading screenshot photos (OCR).

## Hybrid architecture

```
User pastes a message (or uploads a screenshot)
        │
        ▼
┌─────────────────────────────┐
│  TRIAGE — PREFER_ON_DEVICE  │  Firebase AI Logic, structured JSON output
│  Gemini Nano 4 (Chrome)     │  Risk level · confidence · patterns · summary
│  ── fallback ─────────────  │
│  Gemini 3.5 Flash Lite      │  Same schema, automatic fallback
└──────────────┬──────────────┘
               │  medium / high risk, or low confidence
               ▼
┌─────────────────────────────┐
│  DEEP ANALYSIS — ONLY_IN_   │  Scam type · tactics with quoted evidence
│  CLOUD (Gemini)             │  Risk factors · safe steps · safe reply
└─────────────────────────────┘

Screenshot OCR ──► ONLY_IN_CLOUD multimodal (text + image input)
```

Every check shows a **transparency panel**: which engine ran, latency,
cloud tokens consumed, and — when the cloud was used — why.

Key files:

| File | Role |
| --- | --- |
| `src/lib/hybrid.ts` | Hybrid inference: models, routing, parsing, device probe |
| `src/lib/schemas.ts` | Structured-output schemas (shared cloud + on-device) |
| `src/lib/prompts.ts` | Prompt builders (pure, tested) |
| `src/lib/mock.ts` | Deterministic rule-based demo engine (mock mode) |
| `src/lib/firebase.ts` | Firebase init, App Check, anonymous auth |
| `src/lib/history.ts` | Firestore history with localStorage fallback |
| `src/lib/patterns.ts` | Scam-pattern library content (EN + ID) |
| `src/lib/i18n.ts` | Full EN/ID interface copy |

## Features

- **Landing page** — what Perisai is, how hybrid inference works, live
  engine status (on-device model availability).
- **Checker** — paste a message, upload a screenshot (OCR), or try one of
  5 realistic samples (Indonesian bank-OTP scam, task-job scam, legitimate
  delivery notice, English package-fee scam, appointment reminder).
- **Instant triage** — risk level (Safe / Low / Medium / High), confidence,
  detected scam patterns with evidence quotes, one-line summary in the
  message's own language.
- **Deep analysis** — scam type, tactic-by-tactic breakdown with quoted
  evidence, risk factors, safe next steps, and a copyable safe reply.
- **Route transparency** — engine, latency, cloud tokens, fallback reason.
- **Offline behavior** — triage keeps working on-device without internet;
  cloud features show a clear "needs internet" state instead of a raw error.
- **History** — past checks stored per anonymous user in Firestore, with
  automatic localStorage fallback. Full message text is never stored — only
  a 120-character snippet.
- **Scam pattern library** — 8 common Indonesian scams with red flags,
  examples, and what to do.
- **EN/ID toggle** — full interface in English (default) and Indonesian.
  The AI answers in the message's language.
- **Graceful degradation** — if live AI is unavailable, the app offers an
  explicitly labelled rule-based analysis instead of failing.

## Tech stack

- Vite + React 19 + TypeScript (strict)
- Firebase JS SDK v13: AI Logic (`firebase/ai`), Firestore, Auth
  (anonymous), App Check
- Vitest for unit tests; no CSS framework (hand-written CSS, mobile-first)

## Run locally

```bash
npm install
cp .env.example .env   # fill in your Firebase web app config
npm run dev
```

Without a Firebase config the app runs in **demo mode**: the built-in
rule-based engine powers triage and deep analysis, and history stays in
localStorage. Everything is verifiable end-to-end with no backend.
Set `VITE_AI_MOCK=true` to force demo mode even with a config present.

## Firebase setup (for live AI)

1. Create a Firebase project (Spark plan is enough) and register a Web app.
2. In the console, open **AI Services → AI Logic → Get started** and choose
   the **Gemini Developer API** backend.
3. Enable **Authentication → Anonymous** sign-in.
4. Create a **Cloud Firestore** database, then deploy `firestore.rules`
   (anonymous users can only read/write their own `checks/{uid}/items/*`).
   Until the rules are deployed, history falls back to localStorage.
5. Copy the web app config into `.env` (see `.env.example`). **Never commit
   `.env`.**
6. App Check: for local testing, register a debug token in the console
   (App Check → Apps → Manage debug tokens) and set it in the browser
   console as `self.FIREBASE_APPCHECK_DEBUG_TOKEN` before the app loads —
   the app deliberately never reads a debug token from env, because Vite
   would inline a `VITE_*` token into the production bundle. For production,
   add a reCAPTCHA Enterprise site key as `VITE_RECAPTCHA_SITE_KEY` and
   enable enforcement. The public demo runs with enforcement OFF so judges
   can try it without a token.

On-device inference needs **Chrome on desktop, v139+**, with the Gemini Nano
model downloaded (`LanguageModel.availability()` in DevTools). In other
browsers the SDK falls back to the cloud automatically.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | `tsc -b` + production build |
| `npm test` | Unit tests (vitest) |
| `npm run test:watch` | Unit tests in watch mode |

### Live AI verification test

`src/lib/live-ai.test.ts` calls real Firebase AI (one triage + one deep
analysis + a history round-trip). It is skipped by default; run it with a
real `.env` and network access:

```bash
VITE_LIVE_TEST=1 npx vitest run src/lib/live-ai.test.ts
```

Note: in Node there is no Chrome Prompt API, so triage is expected to run
via the cloud fallback there. On-device inference can only be verified in
Chrome on desktop.

## Deployment

GitHub Pages, **dist-only**: the `gh-pages` branch contains only the
production build output (`index.html` + `assets/` + `.nojekyll`) — never
source files, `node_modules`, or `.env`.

## Status / known issues (23 Nov 2026)

- **Firestore rules** are still the default deny-all in the console;
  `firestore.rules` in this repo is ready to deploy. Until then, history
  uses the localStorage fallback (verified by test).
- **Gemini free tier (project-level):** three fresh Firebase projects
  (`perisai-599c5`, `perisai2`, `perisai3`) all returned `403 — the Gemini API free tier is not
  available for this project` for cloud inference, across all tested models
  (3.5/2.5/2.0 Flash-Lite/Flash). In each case the first 1–2 cloud calls
  succeeded, then the project was restricted — consistent with Google's
  per-project free-tier eligibility check (see the [troubleshooting
  guide](https://ai.google.dev/gemini-api/docs/troubleshooting#project-unavailable)).
  The AI Studio verification path was checked and is closed for these
  projects (status "Restricted", no free verification option). The fix path
  is the hackathon's Google Account Quota (Sprint 3 requested 23 Nov 2026;
  account expected Fri 27 Nov). **On-device
  triage is unaffected** — it needs no cloud access at all — and the app
  degrades gracefully (clear error + labelled rule-based fallback) when the
  cloud is unavailable.

## License

Apache-2.0. See `LICENSE`.
