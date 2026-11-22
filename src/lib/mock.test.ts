import { describe, expect, it } from 'vitest';
import { mockDeepAnalysis, mockTriage } from './mock';
import { SAMPLE_MESSAGES } from './samples';

const byId = (id: string) =>
  SAMPLE_MESSAGES.find((s) => s.id === id) ?? SAMPLE_MESSAGES[0];

describe('mockTriage', () => {
  it('flags the fake bank OTP scam as high risk', () => {
    const out = mockTriage(byId('bank-otp').text);
    expect(out.risk).toBe('high');
    expect(out.confidence).toBeGreaterThanOrEqual(80);
    const ids = out.patterns.map((p) => p.id);
    expect(ids).toContain('otp-request');
    expect(ids).toContain('suspicious-link');
    expect(ids).toContain('impersonation');
    expect(out.language).toBe('id');
  });

  it('rates the task-job message as medium risk', () => {
    const out = mockTriage(byId('job-task').text);
    expect(out.risk).toBe('medium');
    const ids = out.patterns.map((p) => p.id);
    expect(ids).toContain('too-good-offer');
    expect(ids).toContain('impersonation');
  });

  it('rates the legitimate delivery notice as safe', () => {
    const out = mockTriage(byId('delivery-legit').text);
    expect(out.risk).toBe('safe');
    expect(out.patterns).toHaveLength(0);
  });

  it('flags the English package-fee scam as high risk', () => {
    const out = mockTriage(byId('package-fee').text);
    expect(out.risk).toBe('high');
    expect(out.language).toBe('en');
    const ids = out.patterns.map((p) => p.id);
    expect(ids).toContain('suspicious-link');
    expect(ids).toContain('transfer-request');
  });

  it('rates the dentist reminder as safe', () => {
    const out = mockTriage(byId('dentist-legit').text);
    expect(out.risk).toBe('safe');
  });

  it('handles empty / very short input as uncertain-safe', () => {
    const out = mockTriage('hi');
    expect(out.risk).toBe('safe');
    expect(out.confidence).toBeLessThan(70);
  });

  it('is deterministic', () => {
    const text = byId('bank-otp').text;
    expect(mockTriage(text)).toEqual(mockTriage(text));
  });

  it('attaches evidence quotes to patterns', () => {
    const out = mockTriage(byId('bank-otp').text);
    const withEvidence = out.patterns.filter((p) => p.evidence);
    expect(withEvidence.length).toBeGreaterThan(0);
  });
});

describe('mockDeepAnalysis', () => {
  it('builds a full breakdown for a high-risk triage', () => {
    const triage = mockTriage(byId('bank-otp').text);
    const deep = mockDeepAnalysis(byId('bank-otp').text, triage);
    expect(deep.scamType).toMatch(/OTP/i);
    expect(deep.tactics.length).toBeGreaterThan(0);
    expect(deep.riskFactors.length).toBeGreaterThan(0);
    expect(deep.safeSteps.length).toBeGreaterThanOrEqual(3);
    expect(deep.safeReply.length).toBeGreaterThan(10);
    expect(deep.verdict.length).toBeGreaterThan(10);
  });

  it('returns a not-a-scam result for safe triage', () => {
    const triage = mockTriage(byId('delivery-legit').text);
    const deep = mockDeepAnalysis(byId('delivery-legit').text, triage);
    expect(deep.tactics).toHaveLength(0);
    expect(deep.scamType).toMatch(/Bukan penipuan|Not a scam/);
  });

  it('answers in the message language', () => {
    const triage = mockTriage(byId('package-fee').text);
    const deep = mockDeepAnalysis(byId('package-fee').text, triage);
    expect(deep.safeReply).toMatch(/Sorry/);
  });
});
