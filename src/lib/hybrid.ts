/**
 * Hybrid inference layer — the heart of Perisai.
 *
 * Triage runs through Firebase AI Logic with `PREFER_ON_DEVICE`: Gemini Nano
 * in Chrome when available, automatic fallback to a cloud Gemini model
 * otherwise. Deep analysis and screenshot OCR run `ONLY_IN_CLOUD` (they need
 * stronger reasoning / multimodal input).
 *
 * When Firebase is not configured (or `VITE_AI_MOCK=true`), the deterministic
 * rule-based demo engine in `mock.ts` is used instead — same output shapes,
 * honestly labelled as "Demo engine" in the UI.
 */

import {
  getGenerativeModel,
  InferenceMode,
  InferenceSource,
  ThinkingLevel,
  type GenerativeModel,
} from 'firebase/ai';
import { getAIClient, useMockEngine } from './firebase';
import { deepAnalysisSchema, triageSchema } from './schemas';
import {
  buildDeepPrompt,
  buildTriagePrompt,
  DEEP_SYSTEM_PROMPT,
  OCR_PROMPT,
  TRIAGE_SYSTEM_PROMPT,
} from './prompts';
import { mockDeepAnalysis, mockTriage } from './mock';
import {
  PerisaiError,
  type DeepAnalysisResult,
  type InferenceRoute,
  type RouteInfo,
  type TriageResult,
} from './types';

/**
 * Cloud model for the fallback and for cloud-only calls. This is the
 * documented SDK v13 default fallback (`gemini-3.5-flash-lite`), chosen
 * deliberately: it is guaranteed to exist, while stronger model names could
 * not be verified without a live project.
 */
export const CLOUD_MODEL = 'gemini-3.5-flash-lite';

export const ON_DEVICE_ENGINE = 'Gemini Nano 4 (on-device)';
export const CLOUD_ENGINE = 'Gemini 3.5 Flash Lite (cloud)';
export const MOCK_ENGINE = 'Demo engine (rule-based)';

export type DeviceAvailability =
  | 'available'
  | 'downloading'
  | 'downloadable'
  | 'unavailable'
  | 'unsupported';

/** Probes Chrome's built-in Prompt API for on-device model availability. */
export async function probeDeviceModel(): Promise<DeviceAvailability> {
  try {
    const lm = (
      globalThis as unknown as {
        LanguageModel?: { availability: () => Promise<string> };
      }
    ).LanguageModel;
    if (!lm || typeof lm.availability !== 'function') return 'unsupported';
    const status = await lm.availability();
    if (
      status === 'available' ||
      status === 'downloading' ||
      status === 'downloadable' ||
      status === 'unavailable'
    ) {
      return status;
    }
    return 'unsupported';
  } catch {
    return 'unsupported';
  }
}

export function isOnline(): boolean {
  // Only an explicit `false` means offline. In non-browser runtimes
  // (Node) `navigator` may exist without `onLine` — treat that as online.
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

/** Deep analysis is offered for medium/high risk or low-confidence triage. */
export function shouldOfferDeepAnalysis(triage: TriageResult): boolean {
  return (
    triage.risk === 'medium' ||
    triage.risk === 'high' ||
    triage.confidence < 60
  );
}

/** i18n key explaining why a triage ran in the cloud instead of on-device. */
export function explainCloudFallback(
  device: DeviceAvailability,
  online: boolean,
): string {
  if (!online) return 'route.reason.offline';
  switch (device) {
    case 'unsupported':
    case 'unavailable':
      return 'route.reason.noDevice';
    case 'downloading':
      return 'route.reason.downloading';
    case 'downloadable':
      return 'route.reason.downloadable';
    default:
      return 'route.reason.generic';
  }
}

/** Extracts a JSON object from model text (tolerates markdown fences). */
function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

const RISK_LEVELS = ['safe', 'low', 'medium', 'high'] as const;

/**
 * Parses + normalizes triage JSON. Defensive: unknown values are clamped or
 * defaulted rather than failing the whole check; only unparseable JSON
 * throws.
 */
export function parseTriageJson(text: string): TriageResult {
  let raw: unknown;
  try {
    raw = JSON.parse(extractJson(text));
  } catch {
    throw new PerisaiError('PARSE_FAILED', 'Triage response was not valid JSON.');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new PerisaiError('PARSE_FAILED', 'Triage response was not an object.');
  }
  const obj = raw as Record<string, unknown>;
  const risk = RISK_LEVELS.includes(obj.risk as (typeof RISK_LEVELS)[number])
    ? (obj.risk as TriageResult['risk'])
    : 'low';
  const confidence =
    typeof obj.confidence === 'number'
      ? Math.max(0, Math.min(100, Math.round(obj.confidence)))
      : 50;
  const patterns = Array.isArray(obj.patterns)
    ? obj.patterns
        .filter(
          (p): p is Record<string, unknown> =>
            typeof p === 'object' && p !== null && typeof p.id === 'string',
        )
        .filter((p) =>
          (
            [
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
            ] as string[]
          ).includes(p.id as string),
        )
        .map((p) => ({
          id: p.id as TriageResult['patterns'][number]['id'],
          evidence:
            typeof p.evidence === 'string' && p.evidence.length > 0
              ? p.evidence
              : undefined,
        }))
    : [];
  const summary =
    typeof obj.summary === 'string' && obj.summary.length > 0
      ? obj.summary
      : 'No summary provided.';
  const language = obj.language === 'en' ? 'en' : 'id';
  return { risk, confidence, patterns, summary, language };
}

/** Parses + normalizes deep-analysis JSON (defensive, like triage). */
export function parseDeepJson(text: string): DeepAnalysisResult {
  let raw: unknown;
  try {
    raw = JSON.parse(extractJson(text));
  } catch {
    throw new PerisaiError(
      'PARSE_FAILED',
      'Deep analysis response was not valid JSON.',
    );
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new PerisaiError(
      'PARSE_FAILED',
      'Deep analysis response was not an object.',
    );
  }
  const obj = raw as Record<string, unknown>;
  const str = (v: unknown, fallback: string): string =>
    typeof v === 'string' && v.length > 0 ? v : fallback;
  const strArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  const tactics = Array.isArray(obj.tactics)
    ? obj.tactics
        .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
        .map((t) => ({
          tactic: str(t.tactic, 'Tactic'),
          evidence: str(t.evidence, ''),
          explanation: str(t.explanation, ''),
        }))
    : [];
  return {
    scamType: str(obj.scamType, 'Unknown'),
    verdict: str(obj.verdict, ''),
    tactics,
    riskFactors: strArray(obj.riskFactors),
    safeSteps: strArray(obj.safeSteps),
    safeReply: str(obj.safeReply, ''),
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let triageModel: GenerativeModel | null = null;
let deepModel: GenerativeModel | null = null;
let ocrModel: GenerativeModel | null = null;

function getTriageModel(): GenerativeModel {
  if (!triageModel) {
    triageModel = getGenerativeModel(getAIClient(), {
      mode: InferenceMode.PREFER_ON_DEVICE,
      inCloudParams: {
        model: CLOUD_MODEL,
        systemInstruction: TRIAGE_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: triageSchema,
          maxOutputTokens: 512,
          // Gemini 3.x thinks by default, which made triage take ~50s in
          // testing. Triage is classification — minimal reasoning is enough.
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      },
      onDeviceParams: {
        createOptions: {
          expectedInputs: [{ type: 'text', languages: ['en', 'id'] }],
          expectedOutputs: [{ type: 'text', languages: ['en', 'id'] }],
          initialPrompts: [
            {
              role: 'system',
              content: [{ type: 'text', value: TRIAGE_SYSTEM_PROMPT }],
            },
          ],
        },
        promptOptions: { responseConstraint: triageSchema },
      },
    });
  }
  return triageModel;
}

function getDeepModel(): GenerativeModel {
  if (!deepModel) {
    deepModel = getGenerativeModel(getAIClient(), {
      mode: InferenceMode.ONLY_IN_CLOUD,
      inCloudParams: {
        model: CLOUD_MODEL,
        systemInstruction: DEEP_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: deepAnalysisSchema,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      },
    });
  }
  return deepModel;
}

function getOcrModel(): GenerativeModel {
  if (!ocrModel) {
    ocrModel = getGenerativeModel(getAIClient(), {
      mode: InferenceMode.ONLY_IN_CLOUD,
      inCloudParams: { model: CLOUD_MODEL },
    });
  }
  return ocrModel;
}

export interface TriageOutcome {
  triage: TriageResult;
  route: RouteInfo;
}

export interface DeepOutcome {
  analysis: DeepAnalysisResult;
  route: RouteInfo;
}

export interface OcrOutcome {
  text: string;
  route: RouteInfo;
}

/**
 * Instant triage. On-device when Gemini Nano is available (private, works
 * offline), cloud fallback otherwise. Must be called from a user gesture so
 * `initializeDeviceModel` satisfies the user-activation requirement.
 */
export async function runTriage(
  message: string,
  opts?: { onDeviceDownload?: (progress: number) => void },
): Promise<TriageOutcome> {
  const start = performance.now();
  const online = isOnline();

  if (useMockEngine) {
    await delay(300 + Math.min(400, message.length));
    return {
      triage: mockTriage(message),
      route: {
        route: 'mock',
        engine: MOCK_ENGINE,
        latencyMs: Math.round(performance.now() - start),
        cloudTokens: 0,
        offline: !online,
      },
    };
  }

  const device = await probeDeviceModel();
  if (!online && device !== 'available') {
    throw new PerisaiError(
      'OFFLINE',
      'You are offline and no on-device model is available on this browser.',
    );
  }

  const model = getTriageModel();
  // Fire-and-forget: starts the on-device model download on first use.
  // Deliberately NOT awaited — generateContent uses the device model when
  // ready and falls back to the cloud otherwise, so triage never blocks on
  // a large first-time download. Called here (inside the click handler's
  // async chain) to satisfy the user-activation requirement.
  void model.initializeDeviceModel(opts?.onDeviceDownload).catch(() => {
    // Device init failed (e.g. no on-device model) — cloud fallback applies.
  });

  try {
    const result = await model.generateContent(buildTriagePrompt(message));
    const response = result.response;
    const route: InferenceRoute =
      response.inferenceSource === InferenceSource.ON_DEVICE
        ? 'on-device'
        : 'cloud';
    const triage = parseTriageJson(response.text());
    return {
      triage,
      route: {
        route,
        engine: route === 'on-device' ? ON_DEVICE_ENGINE : CLOUD_ENGINE,
        latencyMs: Math.round(performance.now() - start),
        cloudTokens:
          route === 'cloud'
            ? (response.usageMetadata?.totalTokenCount ?? 0)
            : 0,
        fallbackReasonKey:
          route === 'cloud'
            ? explainCloudFallback(device, online)
            : undefined,
        offline: !online,
      },
    };
  } catch (err) {
    if (err instanceof PerisaiError) throw err;
    throw new PerisaiError(
      'AI_UNAVAILABLE',
      err instanceof Error ? err.message : 'AI request failed.',
    );
  }
}

/** Deep cloud analysis for medium/high-risk or ambiguous messages. */
export async function runDeepAnalysis(
  message: string,
  triage: TriageResult,
): Promise<DeepOutcome> {
  const start = performance.now();
  const online = isOnline();

  if (useMockEngine) {
    await delay(400 + Math.min(400, message.length));
    return {
      analysis: mockDeepAnalysis(message, triage),
      route: {
        route: 'mock',
        engine: MOCK_ENGINE,
        latencyMs: Math.round(performance.now() - start),
        cloudTokens: 0,
        offline: !online,
      },
    };
  }

  if (!online) {
    throw new PerisaiError(
      'OFFLINE',
      'Deep analysis needs an internet connection.',
    );
  }

  try {
    const result = await getDeepModel().generateContent(
      buildDeepPrompt(message, triage),
    );
    const response = result.response;
    return {
      analysis: parseDeepJson(response.text()),
      route: {
        route: 'cloud',
        engine: CLOUD_ENGINE,
        latencyMs: Math.round(performance.now() - start),
        cloudTokens: response.usageMetadata?.totalTokenCount ?? 0,
        offline: false,
      },
    };
  } catch (err) {
    if (err instanceof PerisaiError) throw err;
    throw new PerisaiError(
      'AI_UNAVAILABLE',
      err instanceof Error ? err.message : 'AI request failed.',
    );
  }
}

/**
 * OCRs a screenshot of a chat/SMS message (cloud-only, multimodal).
 * Throws MOCK_NO_OCR in mock mode — the rule-based engine cannot read images.
 */
export async function runOcr(
  base64: string,
  mimeType: string,
): Promise<OcrOutcome> {
  const start = performance.now();

  if (useMockEngine) {
    throw new PerisaiError(
      'MOCK_NO_OCR',
      'Screenshot OCR needs live Firebase AI.',
    );
  }
  if (!isOnline()) {
    throw new PerisaiError('OFFLINE', 'Screenshot OCR needs an internet connection.');
  }

  try {
    const result = await getOcrModel().generateContent([
      { type: 'text', text: OCR_PROMPT },
      { type: 'inlineData', inlineData: { data: base64, mimeType } },
    ]);
    const response = result.response;
    return {
      text: response.text().trim(),
      route: {
        route: 'cloud',
        engine: CLOUD_ENGINE,
        latencyMs: Math.round(performance.now() - start),
        cloudTokens: response.usageMetadata?.totalTokenCount ?? 0,
        offline: false,
      },
    };
  } catch (err) {
    if (err instanceof PerisaiError) throw err;
    throw new PerisaiError(
      'AI_UNAVAILABLE',
      err instanceof Error ? err.message : 'AI request failed.',
    );
  }
}
