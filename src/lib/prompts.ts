/**
 * Prompt builders for Perisai's AI calls. Pure functions — fully unit-tested.
 *
 * Design notes for the on-device model (Gemini Nano):
 *  - one task per call, short system prompt, closed set of allowed outputs,
 *    JSON constrained by schema, inputs trimmed to what matters.
 */

import type { Lang, TriageResult } from './types';

/** Max message chars sent to the model (keeps Nano's context comfortable). */
export const MAX_MESSAGE_CHARS = 4000;

export const TRIAGE_SYSTEM_PROMPT = [
  'You are Perisai, a scam-message triage assistant.',
  'Analyze the message and reply with JSON only, matching the schema.',
  'Classify risk: safe (clearly legitimate), low (slightly suspicious),',
  'medium (likely scam), high (clear scam).',
  'Detect patterns: urgency, impersonation, suspicious-link, transfer-request,',
  'otp-request, prize-lottery, too-good-offer, threat, sensitive-data,',
  'unverified-sender.',
  'Common Indonesian scams: fake bank/admin impersonation, OTP theft, prize',
  'lotteries, part-time task jobs, fake delivery fees, fake investment.',
  'Write the one-line summary in the SAME language as the message',
  '(Indonesian or English).',
  'Be careful: ordinary delivery notifications and appointment reminders',
  'from real businesses are safe.',
].join(' ');

export const DEEP_SYSTEM_PROMPT = [
  'You are Perisai, a scam-analysis expert.',
  'Analyze the message deeply and reply with JSON only, matching the schema.',
  'Identify the scam type, break down each manipulation tactic with a direct',
  'quote from the message as evidence, list concrete risk factors, give',
  'concrete safe next steps (do NOT click links, never share OTP/PIN/password,',
  'verify through official channels, report to the platform and police),',
  'and draft a short safe reply the user can send.',
  'If the message is legitimate, say so clearly and explain why.',
  'Respond in the SAME language as the message (Indonesian or English),',
  'in plain language a non-technical person can understand.',
].join(' ');

export const OCR_PROMPT =
  'Transcribe all text visible in this screenshot exactly, preserving line breaks. ' +
  'It is a chat or SMS message. Output only the transcribed text, nothing else.';

const ID_MARKERS = [
  'yang', 'anda', 'kamu', 'saya', 'kami', 'dari', 'untuk', 'dengan',
  'segera', 'silakan', 'silahkan', 'akun', 'rekening', 'hadiah', 'menang',
  'klik', 'kirim', 'bayar', 'transfer', 'kode', 'verifikasi', 'paket',
  'pesanan', 'terima kasih', 'halo', 'selamat', 'bapak', 'ibu', 'kak',
  'sebelum', 'hari ini', 'mohon', 'apabila', 'jika', 'nasabah',
];

const EN_MARKERS = [
  'your', 'account', 'click', 'verify', 'code', 'package', 'delivery',
  'congratulations', 'winner', 'urgent', 'immediately', 'transfer',
  'payment', 'bank', 'prize', 'claim', 'hello', 'dear', 'please',
  'within', 'hours', 'suspended', 'blocked', 'confirm', 'security',
];

function countMarkers(text: string, markers: string[]): number {
  const lower = text.toLowerCase();
  let n = 0;
  for (const m of markers) {
    if (lower.includes(m)) n += 1;
  }
  return n;
}

/**
 * Detects whether a message is Indonesian or English by keyword scoring.
 * Ties (or no markers) default to Indonesian — Perisai's primary audience.
 */
export function detectMessageLanguage(text: string): Lang {
  const idScore = countMarkers(text, ID_MARKERS);
  const enScore = countMarkers(text, EN_MARKERS);
  return enScore > idScore ? 'en' : 'id';
}

export interface TrimmedMessage {
  text: string;
  truncated: boolean;
}

/** Trims whitespace and caps length for model input. */
export function trimMessage(text: string): TrimmedMessage {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_MESSAGE_CHARS) {
    return { text: trimmed, truncated: false };
  }
  return { text: trimmed.slice(0, MAX_MESSAGE_CHARS), truncated: true };
}

export function buildTriagePrompt(message: string): string {
  const { text } = trimMessage(message);
  return `Analyze this message for scam risk. Reply with JSON only.\n\nMESSAGE:\n"""\n${text}\n"""`;
}

export function buildDeepPrompt(
  message: string,
  triage: TriageResult,
): string {
  const { text } = trimMessage(message);
  const patternList =
    triage.patterns.length > 0
      ? triage.patterns.map((p) => p.id).join(', ')
      : 'none';
  return (
    `Analyze this message in depth. The instant triage rated it "${triage.risk}" ` +
    `risk (confidence ${triage.confidence}%) with patterns: ${patternList}.\n\n` +
    `MESSAGE:\n"""\n${text}\n"""\n\nReply with JSON only.`
  );
}
