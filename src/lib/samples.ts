/**
 * Ready-made sample messages for the checker — realistic Indonesian scams
 * plus legitimate messages, so anyone can try Perisai in one tap.
 */

import type { SampleMessage } from './types';

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'bank-otp',
    label: { en: 'Fake bank admin (OTP)', id: 'Admin bank palsu (OTP)' },
    source: 'sms',
    expectedRisk: 'high',
    text: 'Yth Nasabah, akun BRI Anda akan DIBLOKIR dalam 1 jam karena aktivitas mencurigakan. Segera verifikasi data Anda di http://bit.ly/bri-verif-aman dan kirim kode OTP yang kami kirimkan. - Admin BRI',
  },
  {
    id: 'job-task',
    label: { en: 'Part-time task job', id: 'Kerja tugas paruh waktu' },
    source: 'whatsapp',
    expectedRisk: 'medium',
    text: 'Halo! Kami dari tim rekrutmen Shopee. Anda terpilih untuk pekerjaan paruh waktu: like produk & dapatkan komisi Rp 50.000 per tugas. Langsung mulai, tanpa biaya apa pun. Hubungi admin kami untuk info lebih lanjut!',
  },
  {
    id: 'delivery-legit',
    label: { en: 'Delivery notice (legit)', id: 'Notifikasi kiriman (asli)' },
    source: 'sms',
    expectedRisk: 'safe',
    text: 'Halo Kak, pesanan Anda #INV-88412 sudah dikirim via JNE, resi 1234567890. Estimasi tiba 2-3 hari kerja. Terima kasih sudah berbelanja di Toko Sinar Jaya.',
  },
  {
    id: 'package-fee',
    label: { en: 'Package fee scam (EN)', id: 'Penipuan biaya paket (EN)' },
    source: 'sms',
    expectedRisk: 'high',
    text: 'Dear customer, your package could not be delivered. Pay the $2.99 redelivery fee within 24 hours at http://tinyurl.com/delivery-fix or your parcel will be returned. — Postal Service',
  },
  {
    id: 'dentist-legit',
    label: { en: 'Appointment reminder (EN)', id: 'Pengingat janji (EN)' },
    source: 'sms',
    expectedRisk: 'safe',
    text: 'Hi Alex, your dentist appointment is confirmed for Thursday, Nov 27 at 10:30 AM. Reply C to confirm or R to reschedule. — Bright Smile Dental',
  },
];
