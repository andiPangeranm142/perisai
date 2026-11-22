/**
 * LIVE Firebase AI Logic verification — NOT part of the normal test suite.
 *
 * Run explicitly with:
 *   NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/etc/ssl/certs/hatch-egress-ca.pem \
 *   VITE_LIVE_TEST=1 npx vitest run src/lib/live-ai.test.ts
 *
 * Requires a real `.env` (Firebase config) and network access. In Node there
 * is no Chrome Prompt API, so triage is expected to run IN_CLOUD (fallback) —
 * this verifies the API key, the AI Logic backend, the schemas, and the
 * prompts end-to-end. On-device (Gemini Nano) can only be verified in Chrome
 * on desktop.
 */

import { describe, expect, it } from 'vitest';
import { runDeepAnalysis, runTriage } from './hybrid';
import { deleteCheck, listChecks, makeRecord, saveCheck } from './history';
import { SAMPLE_MESSAGES } from './samples';

const LIVE = import.meta.env.VITE_LIVE_TEST === '1';

describe.skipIf(!LIVE)('live Firebase AI Logic', () => {
  it(
    'triages the bank OTP scam via live AI',
    async () => {
      const sample = SAMPLE_MESSAGES.find((s) => s.id === 'bank-otp')!;
      const { triage, route } = await runTriage(sample.text);
      expect(['medium', 'high']).toContain(triage.risk);
      expect(triage.patterns.length).toBeGreaterThan(0);
      // Node has no Prompt API, so the hybrid model must fall back to cloud.
      expect(route.route).toBe('cloud');
      expect(route.engine).toContain('Gemini');
      expect(route.latencyMs).toBeGreaterThan(0);
    },
    120_000,
  );

  it(
    'runs deep cloud analysis via live AI',
    async () => {
      const sample = SAMPLE_MESSAGES.find((s) => s.id === 'bank-otp')!;
      const { triage } = await runTriage(sample.text);
      const { analysis, route } = await runDeepAnalysis(sample.text, triage);
      expect(analysis.scamType.length).toBeGreaterThan(0);
      expect(analysis.tactics.length).toBeGreaterThan(0);
      expect(analysis.safeSteps.length).toBeGreaterThan(0);
      expect(analysis.safeReply.length).toBeGreaterThan(0);
      expect(route.route).toBe('cloud');
    },
    120_000,
  );

  it(
    'history survives Firestore deny-all rules via local fallback',
    async () => {
      const record = makeRecord('live test message', 'high', 'cloud', 'test');
      const where = await saveCheck(record);
      expect(['firestore', 'local']).toContain(where);
      const list = await listChecks();
      expect(list.some((r) => r.id === record.id)).toBe(true);
      await deleteCheck(record.id);
      const after = await listChecks();
      expect(after.some((r) => r.id === record.id)).toBe(false);
    },
    120_000,
  );
});
