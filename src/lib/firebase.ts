/**
 * Firebase initialization.
 *
 * The app works in two modes:
 *  - LIVE: real Firebase config is present (see `.env.example`). Firebase AI
 *    Logic runs hybrid inference (Gemini Nano on-device + Gemini in cloud),
 *    Firestore stores history.
 *  - MOCK: no config (or `VITE_AI_MOCK=true`). A built-in rule-based engine
 *    powers triage + deep analysis and history falls back to localStorage, so
 *    the whole app is verifiable end-to-end before Firebase is wired up.
 *
 * Swapping modes is a one-file change: fill in `.env` and rebuild.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAI, GoogleAIBackend, type AI } from 'firebase/ai';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readConfig(): FirebaseConfig | null {
  const env = import.meta.env;
  const cfg: FirebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: env.VITE_FIREBASE_APP_ID ?? '',
  };
  const missing = Object.values(cfg).some(
    (v) => !v || v.startsWith('YOUR_'),
  );
  return missing ? null : cfg;
}

/** True when a real (non-placeholder) Firebase config is present. */
export const firebaseConfig: FirebaseConfig | null = readConfig();
export const isFirebaseConfigured = firebaseConfig !== null;

/**
 * True when the demo (rule-based) engine should be used instead of live
 * Firebase AI — either forced via env or because no Firebase config exists.
 */
export const useMockEngine =
  import.meta.env.VITE_AI_MOCK === 'true' || !isFirebaseConfigured;

let app: FirebaseApp | null = null;
let ai: AI | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let appCheckInit = false;

function getApp(): FirebaseApp {
  if (!firebaseConfig) {
    throw new Error('Firebase is not configured (missing .env values).');
  }
  if (!app) {
    setupAppCheckDebugToken();
    app = initializeApp(firebaseConfig);
    initAppCheck(app);
  }
  return app;
}

/**
 * App Check debug token for local development (from `.env`, never committed).
 * Must be set before App Check initializes. Harmless when App Check itself
 * is not initialized (no reCAPTCHA site key yet) — the SDK simply reads the
 * flag at init time.
 */
function setupAppCheckDebugToken(): void {
  if (!import.meta.env.DEV) return;
  const token = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN as
    | string
    | undefined;
  if (token) {
    (globalThis as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN =
      token;
  }
}

/**
 * App Check: Firebase AI Logic requires it. In local dev we use the debug
 * provider; in production we use reCAPTCHA Enterprise when a site key is
 * configured. When no site key is configured, App Check init is skipped and
 * enforcement must stay OFF in the Firebase console (documented in README)
 * so the public demo keeps working for judges.
 */
function initAppCheck(firebaseApp: FirebaseApp): void {
  if (appCheckInit) return;
  appCheckInit = true;
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as
    | string
    | undefined;
  if (!siteKey) {
    console.info(
      '[Perisai] No reCAPTCHA site key configured; App Check skipped (enforcement must be OFF).',
    );
    return;
  }
  try {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('[Perisai] App Check init failed; continuing.', err);
  }
}

/** Firebase AI Logic client (Gemini Developer API backend). */
export function getAIClient(): AI {
  if (!ai) {
    ai = getAI(getApp(), { backend: new GoogleAIBackend() });
  }
  return ai;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp());
  }
  return db;
}

export function getAuthClient(): Auth {
  if (!auth) {
    auth = getAuth(getApp());
  }
  return auth;
}

let anonUid: string | null = null;
let anonTried = false;

/**
 * Anonymous auth (for per-user history). Best-effort: returns null when
 * Firebase is not configured or sign-in fails; callers fall back to
 * localStorage-only history.
 */
export async function getAnonymousUid(): Promise<string | null> {
  if (anonUid) return anonUid;
  if (anonTried || !isFirebaseConfigured) return null;
  anonTried = true;
  try {
    const cred = await signInAnonymously(getAuthClient());
    anonUid = cred.user.uid;
    return anonUid;
  } catch (err) {
    console.warn('[Perisai] Anonymous sign-in failed; history stays local.', err);
    return null;
  }
}
