/**
 * UI copy in English + Indonesian. UI defaults to English (for the judges);
 * the toggle switches the whole interface. The AI answers in the *message's*
 * language, independently of the UI language.
 */

import type { Lang } from './types';

const EN: Record<string, string> = {
  // Nav + brand
  'nav.home': 'Home',
  'nav.checker': 'Check a message',
  'nav.library': 'Scam patterns',
  'nav.history': 'History',
  'brand.tagline': 'Privacy-first scam checker',
  'lang.toggle': 'Bahasa Indonesia',

  // Hero
  'hero.badge': 'Hybrid AI · On-device + Cloud',
  'hero.title': 'Is this message a scam?',
  'hero.titleAccent': 'Ask Perisai — privately.',
  'hero.subtitle':
    'Paste any suspicious message. Perisai triages it instantly on your device with Gemini Nano — your message never leaves your phone — then digs deeper in the cloud when it matters.',
  'hero.ctaCheck': 'Check a message now',
  'hero.ctaLibrary': 'Browse scam patterns',
  'hero.stat1value': '0',
  'hero.stat1label': 'cloud tokens for on-device triage',
  'hero.stat2value': '100%',
  'hero.stat2label': 'private triage — nothing leaves your device',
  'hero.stat3value': '2s',
  'hero.stat3label': 'typical instant triage',
  'hero.trust': 'Free · No sign-up · Works offline for triage',

  // How it works
  'how.title': 'How Perisai works',
  'how.subtitle': 'Three steps between you and a scam-free inbox.',
  'how.step1title': 'Paste or snap',
  'how.step1desc': 'Paste a suspicious SMS, WhatsApp, or email — or upload a screenshot of it.',
  'how.step2title': 'Instant private triage',
  'how.step2desc': 'Gemini Nano, running on your device, scores the risk and spots scam patterns in seconds — offline, with zero data leaving your device.',
  'how.step3title': 'Deep cloud analysis',
  'how.step3desc': 'For risky or unclear messages, Gemini in the cloud breaks down the tactics, quotes the evidence, and tells you exactly what to do next.',

  // Hybrid section
  'hybrid.title': 'Two engines, one shield',
  'hybrid.subtitle':
    'On-device AI is fast and private, but small. Cloud AI is powerful, but needs internet and sees your data. Perisai uses each where it shines.',
  'hybrid.deviceTitle': 'On-device · Gemini Nano 4',
  'hybrid.deviceDesc': 'Instant triage for every message.',
  'hybrid.devicePoint1': 'Risk score + scam patterns in ~2 seconds',
  'hybrid.devicePoint2': 'Works fully offline',
  'hybrid.devicePoint3': 'Your message never leaves your device',
  'hybrid.devicePoint4': 'Zero cloud cost, zero tokens',
  'hybrid.cloudTitle': 'In-cloud · Gemini',
  'hybrid.cloudDesc': 'Deep investigation when it matters.',
  'hybrid.cloudPoint1': 'Scam-type classification with quoted evidence',
  'hybrid.cloudPoint2': 'Tactic-by-tactic breakdown in plain language',
  'hybrid.cloudPoint3': 'Safe next steps + a safe reply you can send',
  'hybrid.cloudPoint4': 'Screenshot OCR for messages you can only photograph',
  'hybrid.note':
    'Perisai always shows which engine ran, how long it took, and — when the cloud was used — why. No black boxes.',

  // Checker
  'checker.title': 'Check a message',
  'checker.subtitle':
    'Paste the full message. Triage runs on-device when possible — private and instant.',
  'checker.label': 'Suspicious message',
  'checker.placeholder':
    'Paste the SMS, WhatsApp, or email message here…\n\nExample: "Yth Nasabah, akun Anda akan DIBLOKIR dalam 1 jam. Segera verifikasi di bit.ly/…"',
  'checker.checkButton': 'Check this message',
  'checker.checking': 'Checking…',
  'checker.analyzingDevice': 'Analyzing on your device…',
  'checker.analyzingCloud': 'Analyzing in the cloud…',
  'checker.downloading': 'Downloading on-device model…',
  'checker.samplesLabel': 'Or try a sample:',
  'checker.uploadLabel': 'Or upload a screenshot',
  'checker.uploadHint': 'JPG or PNG. The text is read by cloud AI, then triaged like a pasted message.',
  'checker.uploadButton': 'Choose screenshot',
  'checker.ocrReading': 'Reading screenshot…',
  'checker.clearButton': 'Clear',
  'checker.emptyError': 'Paste a message or upload a screenshot first.',
  'checker.tooLong': 'Message trimmed to 4,000 characters for analysis.',
  'checker.tryAnother': 'Check another message',

  // Results
  'result.title': 'Result',
  'result.riskSafe': 'Looks safe',
  'result.riskLow': 'Low risk',
  'result.riskMedium': 'Medium risk',
  'result.riskHigh': 'High risk — likely a scam',
  'result.confidence': 'Confidence',
  'result.patterns': 'Patterns detected',
  'result.noPatterns': 'No scam patterns detected.',
  'result.summary': 'Summary',
  'result.detectedLanguage': 'Message language',
  'result.deepOfferTitle': 'Want the full breakdown?',
  'result.deepOfferDesc':
    'Deep analysis identifies the scam type, quotes the exact tactics used, and gives you safe next steps and a reply you can send.',
  'result.deepButton': 'Run deep analysis',
  'result.deepLoading': 'Running deep analysis…',
  'result.deepTitle': 'Deep analysis',
  'result.scamType': 'Scam type',
  'result.verdict': 'Verdict',
  'result.tactics': 'Tactics used',
  'result.riskFactors': 'Why this is risky',
  'result.safeSteps': 'What to do now',
  'result.safeReply': 'Safe reply you can send',
  'result.copyReply': 'Copy reply',
  'result.copied': 'Copied!',
  'result.saved': 'Saved to history',

  // Route panel
  'route.title': 'How this check ran',
  'route.engine': 'Engine',
  'route.latency': 'Time',
  'route.cloudTokens': 'Cloud tokens',
  'route.tokensNone': '0 — nothing was sent to the cloud',
  'route.offline': 'You were offline — triage ran fully on-device.',
  'route.fallbackLabel': 'Why the cloud was used:',
  'route.mockNote':
    'Demo engine: rule-based triage running locally. Connect Firebase to use live Gemini Nano + Gemini.',
  'route.reason.noDevice':
    'No on-device model is available in this browser (needs Chrome on desktop, v139+).',
  'route.reason.downloading':
    'The on-device model is still downloading, so this check ran in the cloud.',
  'route.reason.downloadable':
    'The on-device model is not downloaded yet, so this check ran in the cloud.',
  'route.reason.offline': 'Offline, and the on-device model was not ready.',
  'route.reason.generic': 'On-device inference was not available for this check.',
  'route.badgeDevice': 'On-device · Gemini Nano',
  'route.badgeCloud': 'Cloud · Gemini',
  'route.badgeMock': 'Demo engine',
  'route.privateNote': 'Message never left your device',
  'route.cloudNote': 'Message was sent to the cloud for this step',

  // Offline banner
  'offline.banner':
    "You're offline. Triage still works on-device; deep analysis and screenshot OCR need internet.",

  // History
  'history.title': 'Check history',
  'history.subtitle': 'Your past checks, newest first. Stored privately under your anonymous ID.',
  'history.empty': 'No checks yet. Check a message and it will appear here.',
  'history.delete': 'Delete',
  'history.clear': 'Clear all',
  'history.storedCloud': 'Synced to your account',
  'history.storedLocal': 'Stored on this device only',
  'history.view': 'View',
  'history.loading': 'Loading history…',
  'history.confirmClear': 'Delete all history?',

  // Library
  'library.title': 'Scam pattern library',
  'library.subtitle':
    'The most common scams in Indonesia — what they look like, the red flags, and what to do.',
  'library.redFlags': 'Red flags',
  'library.example': 'Example',
  'library.action': 'What to do',
  'library.tryInChecker': 'Try a similar message in the checker',

  // Errors
  'error.offline':
    "You're offline and this browser has no on-device model. Connect to the internet or use Chrome on desktop to check messages offline.",
  'error.aiUnavailable':
    'The AI service could not complete this check. Please try again.',
  'error.parseFailed': 'The AI returned an unclear result. Please try again.',
  'error.mockNoOcr':
    'Screenshot OCR needs live Firebase AI. In this demo build, please paste the message text instead.',
  'error.generic': 'Something went wrong. Please try again.',
  'error.retry': 'Try again',
  'error.ocrEmpty': 'No text could be read from this screenshot. Try a clearer image, or paste the text.',

  // Mode badges
  'mode.live': 'Live AI',
  'mode.demo': 'Demo mode',

  // Footer
  'footer.text':
    'Perisai is a hackathon project for #BuildHybridAI 2026. It helps you spot scams — it is not a substitute for official verification.',
  'footer.privacy': 'Triage runs on your device whenever possible. Nothing is uploaded without a clear reason.',
  'footer.builtWith': 'Built with Firebase AI Logic · Gemini Nano + Gemini',
};

const ID: Record<string, string> = {
  // Nav + brand
  'nav.home': 'Beranda',
  'nav.checker': 'Periksa pesan',
  'nav.library': 'Pola penipuan',
  'nav.history': 'Riwayat',
  'brand.tagline': 'Pemeriksa penipuan yang menjaga privasi',
  'lang.toggle': 'English',

  // Hero
  'hero.badge': 'AI Hybrid · On-device + Cloud',
  'hero.title': 'Pesan ini penipuan?',
  'hero.titleAccent': 'Tanya Perisai — secara privat.',
  'hero.subtitle':
    'Tempel pesan mencurigakan apa pun. Perisai menilainya seketika di perangkat Anda dengan Gemini Nano — pesan tidak pernah keluar dari HP Anda — lalu menganalisis lebih dalam di cloud bila diperlukan.',
  'hero.ctaCheck': 'Periksa pesan sekarang',
  'hero.ctaLibrary': 'Lihat pola penipuan',
  'hero.stat1value': '0',
  'hero.stat1label': 'token cloud untuk triase on-device',
  'hero.stat2value': '100%',
  'hero.stat2label': 'triase privat — tidak ada data keluar perangkat',
  'hero.stat3value': '2 dtk',
  'hero.stat3label': 'triase instan pada umumnya',
  'hero.trust': 'Gratis · Tanpa daftar · Triase jalan offline',

  // How it works
  'how.title': 'Cara kerja Perisai',
  'how.subtitle': 'Tiga langkah antara Anda dan pesan penipuan.',
  'how.step1title': 'Tempel atau foto',
  'how.step1desc': 'Tempel SMS, WhatsApp, atau email mencurigakan — atau unggah tangkapan layarnya.',
  'how.step2title': 'Triase privat instan',
  'how.step2desc': 'Gemini Nano yang berjalan di perangkat Anda menilai risiko dan menemukan pola penipuan dalam hitungan detik — offline, tanpa data keluar dari perangkat.',
  'how.step3title': 'Analisis mendalam cloud',
  'how.step3desc': 'Untuk pesan berisiko atau tidak jelas, Gemini di cloud membedah taktiknya, mengutip buktinya, dan memberi tahu langkah aman berikutnya.',

  // Hybrid section
  'hybrid.title': 'Dua mesin, satu perisai',
  'hybrid.subtitle':
    'AI on-device cepat dan privat, tapi kecil. AI cloud kuat, tapi butuh internet dan melihat data Anda. Perisai memakai masing-masing di tempat terbaiknya.',
  'hybrid.deviceTitle': 'On-device · Gemini Nano 4',
  'hybrid.deviceDesc': 'Triase instan untuk setiap pesan.',
  'hybrid.devicePoint1': 'Skor risiko + pola penipuan dalam ~2 detik',
  'hybrid.devicePoint2': 'Berjalan sepenuhnya offline',
  'hybrid.devicePoint3': 'Pesan tidak pernah keluar dari perangkat Anda',
  'hybrid.devicePoint4': 'Nol biaya cloud, nol token',
  'hybrid.cloudTitle': 'In-cloud · Gemini',
  'hybrid.cloudDesc': 'Investigasi mendalam saat dibutuhkan.',
  'hybrid.cloudPoint1': 'Klasifikasi jenis penipuan dengan kutipan bukti',
  'hybrid.cloudPoint2': 'Bedah taktik satu per satu dengan bahasa sederhana',
  'hybrid.cloudPoint3': 'Langkah aman berikutnya + draf balasan aman',
  'hybrid.cloudPoint4': 'OCR tangkapan layar untuk pesan yang hanya bisa difoto',
  'hybrid.note':
    'Perisai selalu menunjukkan mesin mana yang berjalan, berapa lama, dan — bila cloud dipakai — mengapa. Tanpa kotak hitam.',

  // Checker
  'checker.title': 'Periksa pesan',
  'checker.subtitle':
    'Tempel isi pesan selengkapnya. Triase berjalan on-device bila memungkinkan — privat dan instan.',
  'checker.label': 'Pesan mencurigakan',
  'checker.placeholder':
    'Tempel SMS, WhatsApp, atau email di sini…\n\nContoh: "Yth Nasabah, akun Anda akan DIBLOKIR dalam 1 jam. Segera verifikasi di bit.ly/…"',
  'checker.checkButton': 'Periksa pesan ini',
  'checker.checking': 'Memeriksa…',
  'checker.analyzingDevice': 'Menganalisis di perangkat Anda…',
  'checker.analyzingCloud': 'Menganalisis di cloud…',
  'checker.downloading': 'Mengunduh model on-device…',
  'checker.samplesLabel': 'Atau coba contoh:',
  'checker.uploadLabel': 'Atau unggah tangkapan layar',
  'checker.uploadHint': 'JPG atau PNG. Teks dibaca oleh AI cloud, lalu ditriase seperti pesan yang ditempel.',
  'checker.uploadButton': 'Pilih tangkapan layar',
  'checker.ocrReading': 'Membaca tangkapan layar…',
  'checker.clearButton': 'Bersihkan',
  'checker.emptyError': 'Tempel pesan atau unggah tangkapan layar dulu.',
  'checker.tooLong': 'Pesan dipangkas ke 4.000 karakter untuk analisis.',
  'checker.tryAnother': 'Periksa pesan lain',

  // Results
  'result.title': 'Hasil',
  'result.riskSafe': 'Terlihat aman',
  'result.riskLow': 'Risiko rendah',
  'result.riskMedium': 'Risiko sedang',
  'result.riskHigh': 'Risiko tinggi — kemungkinan penipuan',
  'result.confidence': 'Keyakinan',
  'result.patterns': 'Pola terdeteksi',
  'result.noPatterns': 'Tidak ada pola penipuan terdeteksi.',
  'result.summary': 'Ringkasan',
  'result.detectedLanguage': 'Bahasa pesan',
  'result.deepOfferTitle': 'Mau bedah selengkapnya?',
  'result.deepOfferDesc':
    'Analisis mendalam mengidentifikasi jenis penipuan, mengutip taktik yang dipakai, dan memberi langkah aman berikutnya serta balasan yang bisa Anda kirim.',
  'result.deepButton': 'Jalankan analisis mendalam',
  'result.deepLoading': 'Menjalankan analisis mendalam…',
  'result.deepTitle': 'Analisis mendalam',
  'result.scamType': 'Jenis penipuan',
  'result.verdict': 'Kesimpulan',
  'result.tactics': 'Taktik yang dipakai',
  'result.riskFactors': 'Mengapa ini berisiko',
  'result.safeSteps': 'Yang harus dilakukan sekarang',
  'result.safeReply': 'Balasan aman yang bisa dikirim',
  'result.copyReply': 'Salin balasan',
  'result.copied': 'Disalin!',
  'result.saved': 'Disimpan ke riwayat',

  // Route panel
  'route.title': 'Cara pemeriksaan ini berjalan',
  'route.engine': 'Mesin',
  'route.latency': 'Waktu',
  'route.cloudTokens': 'Token cloud',
  'route.tokensNone': '0 — tidak ada yang dikirim ke cloud',
  'route.offline': 'Anda sedang offline — triase berjalan sepenuhnya on-device.',
  'route.fallbackLabel': 'Mengapa cloud dipakai:',
  'route.mockNote':
    'Mesin demo: triase berbasis aturan yang berjalan lokal. Hubungkan Firebase untuk memakai Gemini Nano + Gemini asli.',
  'route.reason.noDevice':
    'Tidak ada model on-device di browser ini (butuh Chrome desktop v139+).',
  'route.reason.downloading':
    'Model on-device masih diunduh, jadi pemeriksaan ini berjalan di cloud.',
  'route.reason.downloadable':
    'Model on-device belum diunduh, jadi pemeriksaan ini berjalan di cloud.',
  'route.reason.offline': 'Offline, dan model on-device belum siap.',
  'route.reason.generic': 'Inference on-device tidak tersedia untuk pemeriksaan ini.',
  'route.badgeDevice': 'On-device · Gemini Nano',
  'route.badgeCloud': 'Cloud · Gemini',
  'route.badgeMock': 'Mesin demo',
  'route.privateNote': 'Pesan tidak pernah keluar dari perangkat Anda',
  'route.cloudNote': 'Pesan dikirim ke cloud untuk langkah ini',

  // Offline banner
  'offline.banner':
    'Anda sedang offline. Triase tetap jalan on-device; analisis mendalam dan OCR tangkapan layar butuh internet.',

  // History
  'history.title': 'Riwayat pemeriksaan',
  'history.subtitle': 'Pemeriksaan Anda sebelumnya, terbaru dulu. Disimpan privat di bawah ID anonim Anda.',
  'history.empty': 'Belum ada pemeriksaan. Periksa pesan dan hasilnya akan muncul di sini.',
  'history.delete': 'Hapus',
  'history.clear': 'Hapus semua',
  'history.storedCloud': 'Tersinkron ke akun Anda',
  'history.storedLocal': 'Tersimpan di perangkat ini saja',
  'history.view': 'Lihat',
  'history.loading': 'Memuat riwayat…',
  'history.confirmClear': 'Hapus semua riwayat?',

  // Library
  'library.title': 'Pustaka pola penipuan',
  'library.subtitle':
    'Penipuan paling umum di Indonesia — bentuknya, tanda bahayanya, dan yang harus dilakukan.',
  'library.redFlags': 'Tanda bahaya',
  'library.example': 'Contoh',
  'library.action': 'Yang harus dilakukan',
  'library.tryInChecker': 'Coba pesan serupa di pemeriksa',

  // Errors
  'error.offline':
    'Anda sedang offline dan browser ini tidak punya model on-device. Sambungkan internet atau gunakan Chrome desktop untuk memeriksa pesan secara offline.',
  'error.aiUnavailable':
    'Layanan AI tidak bisa menyelesaikan pemeriksaan ini. Silakan coba lagi.',
  'error.parseFailed': 'AI mengembalikan hasil yang tidak jelas. Silakan coba lagi.',
  'error.mockNoOcr':
    'OCR tangkapan layar butuh Firebase AI asli. Di build demo ini, silakan tempel teks pesannya.',
  'error.generic': 'Terjadi kesalahan. Silakan coba lagi.',
  'error.retry': 'Coba lagi',
  'error.ocrEmpty': 'Tidak ada teks yang bisa dibaca dari tangkapan layar ini. Coba gambar yang lebih jelas, atau tempel teksnya.',

  // Mode badges
  'mode.live': 'Live AI',
  'mode.demo': 'Mode demo',

  // Footer
  'footer.text':
    'Perisai adalah proyek hackathon untuk #BuildHybridAI 2026. Aplikasi ini membantu Anda mengenali penipuan — bukan pengganti verifikasi resmi.',
  'footer.privacy': 'Triase berjalan di perangkat Anda bila memungkinkan. Tidak ada yang diunggah tanpa alasan yang jelas.',
  'footer.builtWith': 'Dibangun dengan Firebase AI Logic · Gemini Nano + Gemini',
};

export const STRINGS: Record<Lang, Record<string, string>> = { en: EN, id: ID };

/** Looks up a UI string; falls back to the key itself when missing. */
export function t(lang: Lang, key: string): string {
  return STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
}

export interface BilingualText {
  en: string;
  id: string;
}

/** "How it works" steps (titles + descriptions). */
export const HOW_STEPS: { title: BilingualText; desc: BilingualText }[] = [
  {
    title: { en: EN['how.step1title'], id: ID['how.step1title'] },
    desc: { en: EN['how.step1desc'], id: ID['how.step1desc'] },
  },
  {
    title: { en: EN['how.step2title'], id: ID['how.step2title'] },
    desc: { en: EN['how.step2desc'], id: ID['how.step2desc'] },
  },
  {
    title: { en: EN['how.step3title'], id: ID['how.step3title'] },
    desc: { en: EN['how.step3desc'], id: ID['how.step3desc'] },
  },
];

export const HYBRID_DEVICE_POINTS: BilingualText[] = [1, 2, 3, 4].map((n) => ({
  en: EN[`hybrid.devicePoint${n}`],
  id: ID[`hybrid.devicePoint${n}`],
}));

export const HYBRID_CLOUD_POINTS: BilingualText[] = [1, 2, 3, 4].map((n) => ({
  en: EN[`hybrid.cloudPoint${n}`],
  id: ID[`hybrid.cloudPoint${n}`],
}));

export const HERO_STATS: { value: BilingualText; label: BilingualText }[] = [
  {
    value: { en: EN['hero.stat1value'], id: ID['hero.stat1value'] },
    label: { en: EN['hero.stat1label'], id: ID['hero.stat1label'] },
  },
  {
    value: { en: EN['hero.stat2value'], id: ID['hero.stat2value'] },
    label: { en: EN['hero.stat2label'], id: ID['hero.stat2label'] },
  },
  {
    value: { en: EN['hero.stat3value'], id: ID['hero.stat3value'] },
    label: { en: EN['hero.stat3label'], id: ID['hero.stat3label'] },
  },
];
