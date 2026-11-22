/**
 * Demo (rule-based) engine.
 *
 * Used when no Firebase config is present (or `VITE_AI_MOCK=true`) so the
 * whole app — triage, deep analysis, history — works end-to-end without any
 * backend. The engine is deterministic: same message, same result.
 *
 * It mirrors the live AI output shapes exactly, so the UI cannot tell the
 * difference (except for the route badge, which honestly says "Demo engine").
 */

import { PATTERN_META } from './patterns';
import { detectMessageLanguage, trimMessage } from './prompts';
import type {
  DeepAnalysisResult,
  DeepTactic,
  Lang,
  PatternId,
  RiskLevel,
  TriagePattern,
  TriageResult,
} from './types';

interface PatternRule {
  id: PatternId;
  weight: number;
  keywords: string[];
  regexes?: RegExp[];
}

const RULES: PatternRule[] = [
  {
    id: 'otp-request',
    weight: 40,
    keywords: [
      'otp', 'kode verifikasi', 'kode otp', 'kode keamanan', 'kode rahasia',
      'pin', 'kata sandi', 'password', 'one-time password',
      'verification code', 'kode yang kami kirim',
    ],
  },
  {
    id: 'sensitive-data',
    weight: 35,
    keywords: [
      'ktp', 'nik', 'nomor kartu', 'cvv', 'foto ktp', 'nomor kk',
      'id card', 'card number', 'social security', 'nomor rekening',
    ],
  },
  {
    id: 'transfer-request',
    weight: 30,
    keywords: [
      'transfer', 'kirim uang', 'bayar', 'rekening', 'virtual account',
      'biaya admin', 'deposit', 'pembayaran', 'setor', 'bayar dulu',
      'send money', 'wire transfer', 'payment', 'pay the', 'pay $', 'pay rp',
    ],
  },
  {
    id: 'suspicious-link',
    weight: 25,
    keywords: [
      'bit.ly', 'tinyurl', 's.id', 'cutt.ly', 't.co', 'gg.gg', 'is.gd',
      'klik link', 'klik tautan', 'klik di sini', 'click here',
    ],
    regexes: [
      /https?:\/\/\S+/i,
      /\.(xyz|top|site|online|club|buzz|fun|icu)\b/i,
      /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
    ],
  },
  {
    id: 'prize-lottery',
    weight: 25,
    keywords: [
      'hadiah', 'undian', 'giveaway', 'selamat anda', 'jackpot', 'pemenang',
      'congratulations', 'you won', 'you have won', 'lottery', 'free prize',
      'memenangkan', 'anda menang',
    ],
  },
  {
    id: 'too-good-offer',
    weight: 25,
    keywords: [
      'penghasilan', 'komisi', 'investasi', 'cuan', 'untung besar',
      'modal kecil', 'part time', 'paruh waktu', 'kerja sampingan',
      'tugas', 'like produk', 'gaji', 'earn money', 'easy money',
      'guaranteed profit', 'double your money', 'trading', 'crypto',
    ],
  },
  {
    id: 'impersonation',
    weight: 20,
    keywords: [
      'kami dari', 'saya dari', 'admin', 'customer service',
      'layanan pelanggan', 'bank bri', 'bank bca', 'bank mandiri',
      'polisi', 'beacukai', 'bea cukai', 'kurir', 'shopee', 'tokopedia',
      'dana', 'ovo', 'gopay', 'official', 'resmi', 'pusat bantuan',
      'help center', 'support team', 'tim rekrutmen',
    ],
  },
  {
    id: 'threat',
    weight: 20,
    keywords: [
      'blokir', 'diblokir', 'denda', 'lapor polisi', 'akun anda akan',
      'ditangkap', 'dibekukan', 'ditutup', 'suspended', 'blocked',
      'account will be closed', 'legal action', 'penjara', 'proses hukum',
    ],
  },
  {
    id: 'urgency',
    weight: 15,
    keywords: [
      'segera', 'sekarang juga', 'batas waktu', 'dalam 1 jam',
      'dalam 24 jam', 'hari ini terakhir', 'sebelum', 'urgent',
      'immediately', 'limited time', 'act now', 'sekarang',
      'last chance', 'deadline', 'within 24 hours', '24 hours',
      'secepatnya', 'saat ini juga',
    ],
  },
  {
    id: 'unverified-sender',
    weight: 10,
    keywords: [
      'nomor baru', 'nomor tidak dikenal', 'unknown number',
      'ini nomor baru saya', 'saya ganti nomor', 'nomor pribadi',
    ],
  },
];

function matchRule(text: string, rule: PatternRule): boolean {
  const lower = text.toLowerCase();
  if (rule.keywords.some((k) => lower.includes(k))) return true;
  return (rule.regexes ?? []).some((re) => re.test(text));
}

/** Finds the first sentence containing a matched keyword, as evidence. */
function findEvidence(text: string, rule: PatternRule): string | undefined {
  const sentences = text
    .split(/[\n.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const lower = (s: string) => s.toLowerCase();
  for (const s of sentences) {
    const hit =
      rule.keywords.some((k) => lower(s).includes(k)) ||
      (rule.regexes ?? []).some((re) => re.test(s));
    if (hit) {
      return s.length > 140 ? `${s.slice(0, 137)}…` : s;
    }
  }
  return undefined;
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 55) return 'high';
  if (score >= 30) return 'medium';
  if (score >= 12) return 'low';
  return 'safe';
}

function confidenceFor(risk: RiskLevel, score: number, short: boolean): number {
  if (short && risk === 'safe') return 55;
  switch (risk) {
    case 'high':
      return Math.min(95, Math.round(80 + (score - 55) / 2));
    case 'medium':
      return Math.min(88, Math.round(68 + (score - 30)));
    case 'low':
      return Math.min(75, Math.round(58 + score));
    default:
      return 86;
  }
}

const SUMMARIES: Record<RiskLevel, { en: string; id: string }> = {
  high: {
    en: 'Clear scam signals: this message shows multiple classic fraud patterns.',
    id: 'Sinyal penipuan jelas: pesan ini menunjukkan beberapa pola penipuan klasik.',
  },
  medium: {
    en: 'Suspicious: several red flags — verify through official channels before acting.',
    id: 'Mencurigakan: ada beberapa tanda bahaya — verifikasi lewat kanal resmi sebelum bertindak.',
  },
  low: {
    en: 'Slightly suspicious: one weak signal, but nothing conclusive. Stay cautious.',
    id: 'Sedikit mencurigakan: ada satu sinyal lemah, tapi belum bisa disimpulkan. Tetap waspada.',
  },
  safe: {
    en: 'No scam patterns detected. This message looks legitimate.',
    id: 'Tidak ada pola penipuan terdeteksi. Pesan ini terlihat sah.',
  },
};

export function mockTriage(message: string): TriageResult {
  const { text } = trimMessage(message);
  const lang = detectMessageLanguage(text);
  const patterns: TriagePattern[] = [];
  let score = 0;
  for (const rule of RULES) {
    if (matchRule(text, rule)) {
      score += rule.weight;
      patterns.push({ id: rule.id, evidence: findEvidence(text, rule) });
    }
  }
  // Strongest patterns first.
  patterns.sort(
    (a, b) =>
      (RULES.find((r) => r.id === b.id)?.weight ?? 0) -
      (RULES.find((r) => r.id === a.id)?.weight ?? 0),
  );
  const risk = riskFromScore(score);
  const short = text.length < 10;
  return {
    risk,
    confidence: confidenceFor(risk, score, short),
    patterns,
    summary:
      short && risk === 'safe'
        ? lang === 'id'
          ? 'Pesan terlalu singkat untuk dinilai dengan pasti.'
          : 'Message too short to assess confidently.'
        : SUMMARIES[risk][lang],
    language: lang,
  };
}

const SCAM_TYPE_BY_PATTERN: Record<PatternId, { en: string; id: string }> = {
  'otp-request': {
    en: 'Fake admin / OTP theft',
    id: 'Admin palsu / pencurian OTP',
  },
  'sensitive-data': {
    en: 'Identity theft attempt',
    id: 'Percobaan pencurian identitas',
  },
  'transfer-request': {
    en: 'Payment / advance-fee fraud',
    id: 'Penipuan pembayaran / biaya di muka',
  },
  'suspicious-link': { en: 'Phishing link scam', id: 'Penipuan tautan phishing' },
  'prize-lottery': { en: 'Fake prize / lottery', id: 'Hadiah / undian palsu' },
  'too-good-offer': { en: 'Fake job / task scam', id: 'Penipuan kerja / tugas palsu' },
  impersonation: { en: 'Impersonation scam', id: 'Penipuan penyamaran' },
  threat: { en: 'Threat / extortion scam', id: 'Penipuan ancaman / pemerasan' },
  urgency: { en: 'Pressure / urgency scam', id: 'Penipuan desakan waktu' },
  'unverified-sender': { en: 'Unverified sender', id: 'Pengirim tak terverifikasi' },
};

const SAFE_STEPS_HIGH: { en: string[]; id: string[] } = {
  en: [
    'Do not click any link in the message.',
    'Never share OTP, PIN, passwords, or ID photos.',
    'Verify through the official app, website, or phone number — never the contact in the message.',
    'Block the sender and report the message as spam.',
  ],
  id: [
    'Jangan klik tautan apa pun dalam pesan.',
    'Jangan pernah bagikan OTP, PIN, kata sandi, atau foto KTP.',
    'Verifikasi lewat aplikasi, situs, atau nomor resmi — bukan kontak dalam pesan.',
    'Blokir pengirim dan laporkan pesan sebagai spam.',
  ],
};

const SAFE_STEPS_LOW: { en: string[]; id: string[] } = {
  en: [
    'Stay cautious: verify the sender before replying or clicking.',
    'If money or personal data is involved, confirm through official channels first.',
  ],
  id: [
    'Tetap waspada: verifikasi pengirim sebelum membalas atau mengklik.',
    'Jika melibatkan uang atau data pribadi, konfirmasi lewat kanal resmi dulu.',
  ],
};

const SAFE_STEPS_SAFE: { en: string[]; id: string[] } = {
  en: [
    'No action needed — but stay alert: scammers often imitate messages like this.',
    'When in doubt, check anything suspicious with Perisai again.',
  ],
  id: [
    'Tidak perlu tindakan — tapi tetap waspada: penipu sering meniru pesan seperti ini.',
    'Jika ragu, periksa lagi pesan mencurigakan dengan Perisai.',
  ],
};

export function mockDeepAnalysis(
  message: string,
  triage: TriageResult,
): DeepAnalysisResult {
  const lang: Lang = triage.language;
  if (triage.risk === 'safe') {
    return {
      scamType: lang === 'id' ? 'Bukan penipuan' : 'Not a scam',
      verdict:
        lang === 'id'
          ? 'Pesan ini tidak menunjukkan pola penipuan. Isinya konsisten dengan pesan sah biasa.'
          : 'This message shows no scam patterns. Its content is consistent with an ordinary legitimate message.',
      tactics: [],
      riskFactors: [],
      safeSteps: SAFE_STEPS_SAFE[lang],
      safeReply:
        lang === 'id'
          ? 'Tidak perlu dibalas — pesan ini terlihat sah.'
          : 'No reply needed — this message looks legitimate.',
    };
  }

  const top = triage.patterns[0];
  const scamType = top
    ? SCAM_TYPE_BY_PATTERN[top.id][lang]
    : lang === 'id'
      ? 'Penipuan'
      : 'Scam';
  const tactics: DeepTactic[] = triage.patterns.slice(0, 4).map((p) => ({
    tactic: PATTERN_META[p.id].tactic[lang],
    evidence: p.evidence ?? message.slice(0, 120),
    explanation: PATTERN_META[p.id].explanation[lang],
  }));
  const riskFactors = triage.patterns
    .slice(0, 4)
    .map((p) => PATTERN_META[p.id].risk[lang]);
  const high = triage.risk === 'high';
  return {
    scamType,
    verdict:
      lang === 'id'
        ? `Pesan ini ${high ? 'sangat mungkin' : 'kemungkinan'} penipuan (${triage.patterns.length} pola terdeteksi). Jangan ikuti instruksinya sebelum verifikasi lewat kanal resmi.`
        : `This message is ${high ? 'very likely' : 'possibly'} a scam (${triage.patterns.length} patterns detected). Do not follow its instructions until you verify through official channels.`,
    tactics,
    riskFactors,
    safeSteps: high ? SAFE_STEPS_HIGH[lang] : SAFE_STEPS_LOW[lang],
    safeReply:
      lang === 'id'
        ? 'Maaf, saya tidak bisa membagikan kode atau data pribadi lewat chat. Saya akan menghubungi layanan resmi langsung. Terima kasih.'
        : "Sorry, I can't share codes or personal data over chat. I'll contact the official service directly. Thank you.",
  };
}
