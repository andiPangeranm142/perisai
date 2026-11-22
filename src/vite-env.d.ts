/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** Set to "true" to force the built-in demo (rule-based) engine instead of live Firebase AI. */
  readonly VITE_AI_MOCK?: string;
  /** Optional reCAPTCHA Enterprise site key for App Check. Omit to skip App Check. */
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  /** App Check debug token for local development only (never commit). */
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
