import { describe, expect, it } from 'vitest';
import {
  buildDeepPrompt,
  buildTriagePrompt,
  detectMessageLanguage,
  MAX_MESSAGE_CHARS,
  trimMessage,
} from './prompts';
import { SAMPLE_MESSAGES } from './samples';
import type { TriageResult } from './types';

describe('trimMessage', () => {
  it('keeps short messages intact', () => {
    expect(trimMessage('  hello  ')).toEqual({ text: 'hello', truncated: false });
  });

  it('truncates long messages to the max length', () => {
    const long = 'x'.repeat(MAX_MESSAGE_CHARS + 500);
    const out = trimMessage(long);
    expect(out.text).toHaveLength(MAX_MESSAGE_CHARS);
    expect(out.truncated).toBe(true);
  });
});

describe('detectMessageLanguage', () => {
  it('detects Indonesian', () => {
    expect(detectMessageLanguage(SAMPLE_MESSAGES[0].text)).toBe('id');
  });

  it('detects English', () => {
    expect(detectMessageLanguage(SAMPLE_MESSAGES[3].text)).toBe('en');
  });

  it('defaults to Indonesian on empty/neutral text', () => {
    expect(detectMessageLanguage('')).toBe('id');
    expect(detectMessageLanguage('ok')).toBe('id');
  });
});

describe('buildTriagePrompt', () => {
  it('embeds the message and asks for JSON', () => {
    const prompt = buildTriagePrompt('hello world');
    expect(prompt).toContain('hello world');
    expect(prompt).toContain('JSON');
  });

  it('truncates over-long input', () => {
    const prompt = buildTriagePrompt('y'.repeat(MAX_MESSAGE_CHARS + 100));
    expect(prompt.length).toBeLessThan(MAX_MESSAGE_CHARS + 200);
  });
});

describe('buildDeepPrompt', () => {
  it('includes triage context and the message', () => {
    const triage: TriageResult = {
      risk: 'high',
      confidence: 92,
      patterns: [{ id: 'otp-request' }, { id: 'urgency' }],
      summary: 'test',
      language: 'id',
    };
    const prompt = buildDeepPrompt('pesan penipuan', triage);
    expect(prompt).toContain('high');
    expect(prompt).toContain('92');
    expect(prompt).toContain('otp-request');
    expect(prompt).toContain('pesan penipuan');
  });
});
