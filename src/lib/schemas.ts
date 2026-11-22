/**
 * Structured-output schemas for Firebase AI Logic.
 *
 * The same `Schema` objects are used for BOTH runtimes:
 *  - cloud: `inCloudParams.generationConfig.responseSchema`
 *  - on-device: `onDeviceParams.promptOptions.responseConstraint`
 * (see Firebase AI Logic docs: "Generate structured output for hybrid
 * experiences in Web apps").
 */

import { Schema } from 'firebase/ai';
import { PATTERN_IDS } from './types';

export const triageSchema = Schema.object({
  properties: {
    risk: Schema.enumString({
      enum: ['safe', 'low', 'medium', 'high'],
      description: 'Overall scam risk of the message.',
    }),
    confidence: Schema.integer({
      description: 'Confidence in the risk rating, 0-100.',
    }),
    patterns: Schema.array({
      items: Schema.object({
        properties: {
          id: Schema.enumString({
            enum: [...PATTERN_IDS],
            description: 'Detected scam pattern.',
          }),
          evidence: Schema.string({
            description: 'Short quote from the message showing the pattern.',
          }),
        },
        optionalProperties: ['evidence'],
      }),
      description: 'Scam patterns detected in the message (empty when safe).',
    }),
    summary: Schema.string({
      description:
        'One-line explanation of the verdict, in the same language as the message.',
    }),
    language: Schema.enumString({
      enum: ['id', 'en'],
      description: 'Language of the message: id (Indonesian) or en (English).',
    }),
  },
});

export const deepAnalysisSchema = Schema.object({
  properties: {
    scamType: Schema.string({
      description:
        'Short name of the scam type, e.g. "Fake bank admin / OTP theft". "Not a scam" when the message is legitimate.',
    }),
    verdict: Schema.string({
      description: 'Two-sentence verdict explaining the conclusion.',
    }),
    tactics: Schema.array({
      items: Schema.object({
        properties: {
          tactic: Schema.string({
            description: 'Name of the manipulation tactic.',
          }),
          evidence: Schema.string({
            description: 'Direct quote from the message demonstrating it.',
          }),
          explanation: Schema.string({
            description: 'Why this tactic is a red flag, in plain language.',
          }),
        },
      }),
      description: 'Manipulation tactics found, each with quoted evidence.',
    }),
    riskFactors: Schema.array({
      items: Schema.string(),
      description: 'Concrete risk factors for the reader.',
    }),
    safeSteps: Schema.array({
      items: Schema.string(),
      description:
        'Concrete next steps to stay safe (do not click, verify via official channels, report, ...).',
    }),
    safeReply: Schema.string({
      description:
        'A short, safe reply the user can send to the sender (polite refusal or request for official verification).',
    }),
  },
});
