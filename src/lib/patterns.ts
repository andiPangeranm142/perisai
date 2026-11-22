/**
 * Pattern content shared by the mock engine and the UI.
 *
 * - PATTERN_META: the 10 triage patterns (labels + explanations, EN + ID).
 * - SCAM_LIBRARY: 8 common Indonesian scam types for the pattern library page.
 */

import type { Lang, PatternId, PatternInfo } from './types';

export interface PatternMeta {
  label: { en: string; id: string };
  tactic: { en: string; id: string };
  explanation: { en: string; id: string };
  risk: { en: string; id: string };
}

export const PATTERN_META: Record<PatternId, PatternMeta> = {
  urgency: {
    label: { en: 'False urgency', id: 'Desakan waktu palsu' },
    tactic: { en: 'False urgency', id: 'Desakan waktu palsu' },
    explanation: {
      en: 'A tight deadline is used to rush you into acting before you can think or verify.',
      id: 'Batas waktu yang mepet dipakai agar Anda bertindak sebelum sempat berpikir atau memverifikasi.',
    },
    risk: {
      en: 'You may act without verifying and fall for the scam.',
      id: 'Anda bisa bertindak tanpa verifikasi dan terjebak penipuan.',
    },
  },
  impersonation: {
    label: { en: 'Impersonation', id: 'Penyamaran' },
    tactic: { en: 'Impersonation', id: 'Penyamaran' },
    explanation: {
      en: 'The sender claims to be a bank, marketplace, courier, or official — scammers borrow trusted names.',
      id: 'Pengirim mengaku dari bank, marketplace, kurir, atau instansi resmi — penipu meminjam nama tepercaya.',
    },
    risk: {
      en: 'You may trust the message because of the brand name.',
      id: 'Anda bisa percaya karena nama merek yang dipakai.',
    },
  },
  'suspicious-link': {
    label: { en: 'Suspicious link', id: 'Tautan mencurigakan' },
    tactic: { en: 'Suspicious link', id: 'Tautan mencurigakan' },
    explanation: {
      en: 'Shortened or lookalike links hide the real destination — often a fake login page.',
      id: 'Tautan pendek atau mirip menyembunyikan tujuan asli — sering halaman login palsu.',
    },
    risk: {
      en: 'Clicking can steal your login credentials or install malware.',
      id: 'Mengklik bisa mencuri kredensial login atau memasang malware.',
    },
  },
  'transfer-request': {
    label: { en: 'Transfer / payment request', id: 'Permintaan transfer / bayar' },
    tactic: { en: 'Transfer request', id: 'Permintaan transfer' },
    explanation: {
      en: 'You are asked to send money, pay a fee, or deposit funds — the core goal of most scams.',
      id: 'Anda diminta mengirim uang, membayar biaya, atau deposit — tujuan utama kebanyakan penipuan.',
    },
    risk: {
      en: 'Money sent to scammers is almost never recoverable.',
      id: 'Uang yang dikirim ke penipu hampir tidak pernah bisa kembali.',
    },
  },
  'otp-request': {
    label: { en: 'OTP / PIN request', id: 'Permintaan OTP / PIN' },
    tactic: { en: 'OTP theft', id: 'Pencurian OTP' },
    explanation: {
      en: 'No legitimate service ever asks for your OTP, PIN, or password by chat. Anyone who does is a scammer.',
      id: 'Tidak ada layanan resmi yang meminta OTP, PIN, atau kata sandi lewat chat. Siapa pun yang meminta adalah penipu.',
    },
    risk: {
      en: 'Sharing an OTP gives the scammer full access to your account.',
      id: 'Membagikan OTP memberi penipu akses penuh ke akun Anda.',
    },
  },
  'prize-lottery': {
    label: { en: 'Fake prize / lottery', id: 'Hadiah / undian palsu' },
    tactic: { en: 'Prize lure', id: 'Iming-iming hadiah' },
    explanation: {
      en: '"You won!" is used to make you drop your guard — the prize does not exist.',
      id: '"Anda menang!" dipakai agar Anda lengah — hadiahnya tidak ada.',
    },
    risk: {
      en: 'Victims pay "admin fees" or share personal data to claim a fake prize.',
      id: 'Korban membayar "biaya admin" atau membagikan data pribadi untuk hadiah palsu.',
    },
  },
  'too-good-offer': {
    label: { en: 'Too-good-to-be-true offer', id: 'Tawaran terlalu bagus' },
    tactic: { en: 'Too-good-to-be-true offer', id: 'Tawaran terlalu bagus' },
    explanation: {
      en: 'Huge earnings for tiny effort is the classic bait of job-task and investment scams.',
      id: 'Penghasilan besar dengan usaha kecil adalah umpan klasik penipuan tugas dan investasi.',
    },
    risk: {
      en: 'Victims pay deposits or "activation fees" and never see returns.',
      id: 'Korban membayar deposit atau "biaya aktivasi" dan tidak pernah mendapat hasil.',
    },
  },
  threat: {
    label: { en: 'Threat / intimidation', id: 'Ancaman / intimidasi' },
    tactic: { en: 'Threat', id: 'Ancaman' },
    explanation: {
      en: 'Threats of blocking, fines, or police reports create fear so you comply without checking.',
      id: 'Ancaman blokir, denda, atau laporan polisi menimbulkan takut agar Anda patuh tanpa memeriksa.',
    },
    risk: {
      en: 'Fear makes people hand over money or data they would otherwise protect.',
      id: 'Rasa takut membuat orang menyerahkan uang atau data yang seharusnya dilindungi.',
    },
  },
  'sensitive-data': {
    label: { en: 'Sensitive data request', id: 'Permintaan data sensitif' },
    tactic: { en: 'Data harvesting', id: 'Pencurian data' },
    explanation: {
      en: 'Requests for KTP/ID numbers, card numbers, or photos of documents enable identity theft.',
      id: 'Permintaan nomor KTP, nomor kartu, atau foto dokumen memungkinkan pencurian identitas.',
    },
    risk: {
      en: 'Your identity can be used to open accounts or take loans in your name.',
      id: 'Identitas Anda bisa dipakai membuka rekening atau mengambil pinjaman atas nama Anda.',
    },
  },
  'unverified-sender': {
    label: { en: 'Unverified sender', id: 'Pengirim tak terverifikasi' },
    tactic: { en: 'Unverified sender', id: 'Pengirim tak terverifikasi' },
    explanation: {
      en: 'The message comes from an unknown personal number, not an official channel.',
      id: 'Pesan datang dari nomor pribadi yang tidak dikenal, bukan kanal resmi.',
    },
    risk: {
      en: 'Anyone can claim to be anyone from a personal number.',
      id: 'Siapa pun bisa mengaku sebagai siapa pun dari nomor pribadi.',
    },
  },
};

export function patternLabel(id: PatternId, lang: Lang): string {
  return PATTERN_META[id].label[lang];
}

export const SCAM_LIBRARY: PatternInfo[] = [
  {
    id: 'fake-admin',
    title: { en: 'Fake bank / admin impersonation', id: 'Admin / bank palsu' },
    description: {
      en: 'Someone pretends to be bank staff, a marketplace admin, or a government officer, then asks you to "verify" your account.',
      id: 'Seseorang mengaku staf bank, admin marketplace, atau petugas instansi, lalu meminta Anda "verifikasi" akun.',
    },
    redFlags: {
      en: [
        'Contact from a personal number, not an official channel',
        'Asks for OTP, PIN, or password',
        'Sends a "verification" link',
      ],
      id: [
        'Menghubungi dari nomor pribadi, bukan kanal resmi',
        'Meminta OTP, PIN, atau kata sandi',
        'Mengirim tautan "verifikasi"',
      ],
    },
    example: {
      en: '"Dear customer, your account will be blocked. Verify now at bit.ly/bank-secure and send the OTP we sent you. — Bank Admin"',
      id: '"Yth Nasabah, akun Anda akan DIBLOKIR. Segera verifikasi di bit.ly/bank-aman dan kirim kode OTP yang kami kirimkan. — Admin Bank"',
    },
    action: {
      en: 'Never share OTP/PIN. Contact the bank through its official app or number.',
      id: 'Jangan pernah bagikan OTP/PIN. Hubungi bank lewat aplikasi atau nomor resminya.',
    },
  },
  {
    id: 'otp-theft',
    title: { en: 'OTP / PIN theft', id: 'Pencurian OTP / PIN' },
    description: {
      en: 'The scammer tricks you into reading out a one-time code, then uses it to take over your account.',
      id: 'Penipu membujuk Anda membacakan kode sekali pakai, lalu menggunakannya untuk mengambil alih akun Anda.',
    },
    redFlags: {
      en: [
        'Any request for a code sent to your phone',
        'Claims the code is needed to "cancel" something',
        'Caller pretends to be support staff',
      ],
      id: [
        'Permintaan kode apa pun yang dikirim ke HP Anda',
        'Berdalih kode diperlukan untuk "membatalkan" sesuatu',
        'Penelepon mengaku staf layanan pelanggan',
      ],
    },
    example: {
      en: '"Hi, this is support. We sent a 6-digit code to your phone — please read it to me so I can secure your account."',
      id: '"Halo, saya dari layanan pelanggan. Kami mengirim kode 6 digit ke HP Anda — tolong bacakan agar akun Anda bisa diamankan."',
    },
    action: {
      en: 'OTP is only for you. Hang up and report the number.',
      id: 'OTP hanya untuk Anda. Tutup telepon dan laporkan nomornya.',
    },
  },
  {
    id: 'prize-lottery',
    title: { en: 'Fake prize / lottery', id: 'Hadiah / undian palsu' },
    description: {
      en: '"You won a prize!" — but you must pay an admin fee or tax first. The prize never exists.',
      id: '"Anda memenangkan hadiah!" — tapi harus membayar biaya admin atau pajak dulu. Hadiahnya tidak pernah ada.',
    },
    redFlags: {
      en: [
        'You never entered any contest',
        'Must pay to claim the prize',
        'Asked for ID photos or bank details',
      ],
      id: [
        'Anda tidak pernah ikut undian apa pun',
        'Harus membayar untuk mengklaim hadiah',
        'Diminta foto KTP atau detail rekening',
      ],
    },
    example: {
      en: '"CONGRATULATIONS! You won a new phone in our anniversary draw. Pay the Rp 150,000 delivery fee to claim it."',
      id: '"SELAMAT! Anda memenangkan HP baru dalam undian ulang tahun kami. Bayar biaya pengiriman Rp 150.000 untuk mengklaimnya."',
    },
    action: {
      en: 'Real prizes never ask winners to pay. Ignore and block.',
      id: 'Hadiah asli tidak pernah meminta pemenang membayar. Abaikan dan blokir.',
    },
  },
  {
    id: 'task-job',
    title: { en: 'Part-time task job scam', id: 'Penipuan kerja tugas paruh waktu' },
    description: {
      en: 'Fake recruiters offer easy money for liking products or completing tasks, then demand deposits or "activation fees".',
      id: 'Perekrut palsu menawarkan uang mudah untuk like produk atau menyelesaikan tugas, lalu meminta deposit atau "biaya aktivasi".',
    },
    redFlags: {
      en: [
        'Recruitment via WhatsApp from a personal number',
        'Pay that is far too high for the work',
        'Any upfront deposit or fee',
      ],
      id: [
        'Rekrutmen lewat WhatsApp dari nomor pribadi',
        'Bayaran jauh di atas kewajaran untuk pekerjaannya',
        'Ada deposit atau biaya di muka',
      ],
    },
    example: {
      en: '"Earn Rp 50,000 per task liking products! Deposit Rp 100,000 to activate your account and start today."',
      id: '"Dapatkan Rp 50.000 per tugas like produk! Deposit Rp 100.000 untuk aktivasi akun dan mulai hari ini."',
    },
    action: {
      en: 'Legitimate employers never charge applicants. Verify the company independently.',
      id: 'Perusahaan asli tidak pernah memungut biaya dari pelamar. Verifikasi perusahaan secara independen.',
    },
  },
  {
    id: 'fake-delivery',
    title: { en: 'Fake delivery fee', id: 'Biaya pengiriman palsu' },
    description: {
      en: 'A text claims your package is held and asks for a small redelivery fee via a phishing link.',
      id: 'SMS mengklaim paket Anda tertahan dan meminta biaya kirim ulang kecil lewat tautan phishing.',
    },
    redFlags: {
      en: [
        'You are not expecting a package',
        'Shortened link instead of the courier site',
        'Urgency: pay within hours or lose the parcel',
      ],
      id: [
        'Anda tidak sedang menunggu paket',
        'Tautan pendek, bukan situs kurir resmi',
        'Desakan: bayar dalam hitungan jam atau paket hangus',
      ],
    },
    example: {
      en: '"Your package could not be delivered. Pay the $2.99 fee within 24 hours at tinyurl.com/delivery-fix."',
      id: '"Paket Anda tidak dapat dikirim. Bayar biaya Rp 15.000 dalam 24 jam di s.id/kirim-ulang."',
    },
    action: {
      en: 'Check tracking only in the courier\'s official app or site.',
      id: 'Cek resi hanya di aplikasi atau situs resmi kurir.',
    },
  },
  {
    id: 'fake-investment',
    title: { en: 'Fake investment / trading', id: 'Investasi / trading palsu' },
    description: {
      en: 'Guaranteed huge returns from crypto, trading, or "managed" investments — often via a fake app or group chat.',
      id: 'Iming-iming keuntungan besar yang dijamin dari kripto, trading, atau investasi "dikelola" — sering lewat aplikasi atau grup chat palsu.',
    },
    redFlags: {
      en: [
        '"Guaranteed" profits or returns far above market',
        'Pressure to recruit others',
        'Cannot withdraw without paying more',
      ],
      id: [
        'Keuntungan "dijamin" jauh di atas pasar',
        'Desakan untuk mengajak orang lain',
        'Tidak bisa menarik dana tanpa membayar lagi',
      ],
    },
    example: {
      en: '"Invest $100 and earn $500 in a week, guaranteed! Join our VIP trading group now."',
      id: '"Investasi Rp 500 ribu jadi Rp 5 juta dalam seminggu, dijamin! Gabung grup trading VIP kami sekarang."',
    },
    action: {
      en: 'Check OJK registration. If returns are guaranteed, it is a scam.',
      id: 'Cek izin OJK. Jika keuntungannya dijamin, itu penipuan.',
    },
  },
  {
    id: 'account-threat',
    title: { en: 'Account blocked threat', id: 'Ancaman akun diblokir' },
    description: {
      en: 'A message threatens to block, fine, or report you unless you act immediately — fear is the weapon.',
      id: 'Pesan mengancam memblokir, mendenda, atau melaporkan Anda kecuali bertindak segera — rasa takut adalah senjatanya.',
    },
    redFlags: {
      en: [
        'Threats of blocking, fines, or police',
        'Extremely short deadline',
        'A link or number to "resolve" it',
      ],
      id: [
        'Ancaman blokir, denda, atau polisi',
        'Batas waktu yang sangat singkat',
        'Tautan atau nomor untuk "menyelesaikan" masalah',
      ],
    },
    example: {
      en: '"Your account shows illegal activity and will be closed in 1 hour. Call this number immediately to avoid legal action."',
      id: '"Akun Anda terdeteksi aktivitas ilegal dan akan ditutup dalam 1 jam. Hubungi nomor ini segera untuk menghindari proses hukum."',
    },
    action: {
      en: 'Pause. Real institutions do not threaten by SMS. Verify via official channels.',
      id: 'Berhenti sejenak. Institusi asli tidak mengancam lewat SMS. Verifikasi lewat kanal resmi.',
    },
  },
  {
    id: 'fake-support',
    title: { en: 'Fake support / refund scam', id: 'Customer service / refund palsu' },
    description: {
      en: 'A "support agent" offers a refund or help, then asks for your banking details or remote access to your device.',
      id: '"Agen layanan" menawarkan refund atau bantuan, lalu meminta detail perbankan atau akses jarak jauh ke perangkat Anda.',
    },
    redFlags: {
      en: [
        'They contacted you first about a problem you did not report',
        'Asks for banking details or screen sharing',
        'Refund requires you to "verify" by paying',
      ],
      id: [
        'Mereka menghubungi duluan soal masalah yang tidak Anda laporkan',
        'Meminta detail perbankan atau berbagi layar',
        'Refund mengharuskan Anda "verifikasi" dengan membayar',
      ],
    },
    example: {
      en: '"We owe you a refund of $49.99. Please share your card number and the code we just sent so we can process it."',
      id: '"Kami akan mengembalikan dana Rp 499.000. Mohon bagikan nomor kartu dan kode yang baru kami kirim agar bisa diproses."',
    },
    action: {
      en: 'Never share card details by chat. Use the app\'s official support.',
      id: 'Jangan pernah bagikan detail kartu lewat chat. Gunakan layanan resmi di aplikasi.',
    },
  },
];
