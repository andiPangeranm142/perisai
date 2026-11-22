/** Shared types for Perisai. Pure — no Firebase imports here. */

export type Lang = 'en' | 'id';

export type View = 'home' | 'check' | 'library' | 'history';

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high';

/** Where an inference actually ran. */
export type InferenceRoute = 'on-device' | 'cloud' | 'mock';

/** Detectable scam patterns (shared by the AI schema and the mock engine). */
export const PATTERN_IDS = [
  'urgency',
  'impersonation',
  'suspicious-link',
  'transfer-request',
  'otp-request',
  'prize-lottery',
  'too-good-offer',
  'threat',
  'sensitive-data',
  'unverified-sender',
] as const;

export type PatternId = (typeof PATTERN_IDS)[number];

export interface TriagePattern {
  id: PatternId;
  /** Short quote from the message that triggered the pattern, when available. */
  evidence?: string;
}

export interface TriageResult {
  risk: RiskLevel;
  /** 0–100 */
  confidence: number;
  patterns: TriagePattern[];
  /** One-line explanation, in the message's own language. */
  summary: string;
  language: Lang;
}

export interface RouteInfo {
  route: InferenceRoute;
  /** Human-readable engine label, e.g. "Gemini Nano 4 (on-device)". */
  engine: string;
  latencyMs: number;
  /** Cloud tokens consumed (0 for on-device and mock runs). */
  cloudTokens: number;
  /** i18n key explaining why cloud was used, when the route is cloud. */
  fallbackReasonKey?: string;
  offline: boolean;
}

export interface DeepTactic {
  tactic: string;
  /** Direct quote from the message. */
  evidence: string;
  explanation: string;
}

export interface DeepAnalysisResult {
  scamType: string;
  verdict: string;
  tactics: DeepTactic[];
  riskFactors: string[];
  safeSteps: string[];
  /** A short, safe reply the user can send (or a refusal script). */
  safeReply: string;
}

export interface CheckRecord {
  id: string;
  createdAt: number;
  /** First ~120 chars of the checked message. */
  snippet: string;
  risk: RiskLevel;
  route: InferenceRoute;
  summary: string;
}

export interface SampleMessage {
  id: string;
  /** Short label for the sample chip, both languages. */
  label: { en: string; id: string };
  source: 'sms' | 'whatsapp' | 'email';
  text: string;
  expectedRisk: RiskLevel;
}

export interface PatternInfo {
  id: string;
  title: { en: string; id: string };
  description: { en: string; id: string };
  redFlags: { en: string[]; id: string[] };
  example: { en: string; id: string };
  action: { en: string; id: string };
}

/** Error thrown by the AI layer with a stable, UI-mappable code. */
export class PerisaiError extends Error {
  code: 'OFFLINE' | 'AI_UNAVAILABLE' | 'MOCK_NO_OCR' | 'PARSE_FAILED' | 'UNKNOWN';
  constructor(
    code: PerisaiError['code'],
    message: string,
  ) {
    super(message);
    this.name = 'PerisaiError';
    this.code = code;
  }
}
