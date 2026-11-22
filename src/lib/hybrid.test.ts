import { describe, expect, it } from 'vitest';
import {
  explainCloudFallback,
  parseDeepJson,
  parseTriageJson,
  probeDeviceModel,
  shouldOfferDeepAnalysis,
} from './hybrid';
import { PerisaiError } from './types';
import type { TriageResult } from './types';

const triage = (
  risk: TriageResult['risk'],
  confidence: number,
): TriageResult => ({
  risk,
  confidence,
  patterns: [],
  summary: 'x',
  language: 'en',
});

describe('shouldOfferDeepAnalysis', () => {
  it('offers for medium and high risk', () => {
    expect(shouldOfferDeepAnalysis(triage('medium', 90))).toBe(true);
    expect(shouldOfferDeepAnalysis(triage('high', 90))).toBe(true);
  });

  it('offers for low-confidence results', () => {
    expect(shouldOfferDeepAnalysis(triage('low', 50))).toBe(true);
    expect(shouldOfferDeepAnalysis(triage('safe', 55))).toBe(true);
  });

  it('does not offer for confident low/safe results', () => {
    expect(shouldOfferDeepAnalysis(triage('low', 80))).toBe(false);
    expect(shouldOfferDeepAnalysis(triage('safe', 90))).toBe(false);
  });
});

describe('parseTriageJson', () => {
  it('parses valid triage JSON', () => {
    const out = parseTriageJson(
      JSON.stringify({
        risk: 'high',
        confidence: 91,
        patterns: [{ id: 'otp-request', evidence: 'kirim kode OTP' }],
        summary: 'Jelas penipuan.',
        language: 'id',
      }),
    );
    expect(out.risk).toBe('high');
    expect(out.confidence).toBe(91);
    expect(out.patterns).toHaveLength(1);
    expect(out.language).toBe('id');
  });

  it('tolerates markdown fences around JSON', () => {
    const out = parseTriageJson(
      '```json\n{"risk":"safe","confidence":90,"patterns":[],"summary":"OK","language":"en"}\n```',
    );
    expect(out.risk).toBe('safe');
  });

  it('throws PerisaiError on unparseable JSON', () => {
    expect(() => parseTriageJson('not json at all')).toThrow(PerisaiError);
  });

  it('normalizes out-of-range confidence and unknown values', () => {
    const out = parseTriageJson(
      JSON.stringify({
        risk: 'definitely-scam',
        confidence: 250,
        patterns: [{ id: 'not-a-pattern' }, { id: 'urgency' }],
        summary: '',
        language: 'fr',
      }),
    );
    expect(out.risk).toBe('low');
    expect(out.confidence).toBe(100);
    expect(out.patterns).toHaveLength(1);
    expect(out.patterns[0].id).toBe('urgency');
    expect(out.summary).toBe('No summary provided.');
    expect(out.language).toBe('id');
  });
});

describe('parseDeepJson', () => {
  it('parses valid deep-analysis JSON', () => {
    const out = parseDeepJson(
      JSON.stringify({
        scamType: 'OTP theft',
        verdict: 'This is a scam.',
        tactics: [
          { tactic: 'Urgency', evidence: 'dalam 1 jam', explanation: 'Rushes you.' },
        ],
        riskFactors: ['Account takeover'],
        safeSteps: ['Do not click.'],
        safeReply: 'No thanks.',
      }),
    );
    expect(out.scamType).toBe('OTP theft');
    expect(out.tactics).toHaveLength(1);
    expect(out.safeSteps).toEqual(['Do not click.']);
  });

  it('defaults missing arrays to empty', () => {
    const out = parseDeepJson(JSON.stringify({ scamType: 'X' }));
    expect(out.tactics).toEqual([]);
    expect(out.riskFactors).toEqual([]);
    expect(out.safeSteps).toEqual([]);
  });

  it('throws on garbage', () => {
    expect(() => parseDeepJson('{{{')).toThrow(PerisaiError);
  });
});

describe('explainCloudFallback', () => {
  it('maps device states to i18n keys', () => {
    expect(explainCloudFallback('unsupported', true)).toBe('route.reason.noDevice');
    expect(explainCloudFallback('unavailable', true)).toBe('route.reason.noDevice');
    expect(explainCloudFallback('downloading', true)).toBe(
      'route.reason.downloading',
    );
    expect(explainCloudFallback('downloadable', true)).toBe(
      'route.reason.downloadable',
    );
    expect(explainCloudFallback('available', false)).toBe('route.reason.offline');
    expect(explainCloudFallback('available', true)).toBe('route.reason.generic');
  });
});

describe('probeDeviceModel', () => {
  it('reports unsupported in Node (no Prompt API)', async () => {
    await expect(probeDeviceModel()).resolves.toBe('unsupported');
  });
});
