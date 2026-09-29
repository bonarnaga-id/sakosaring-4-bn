/**
 * lib/docs.js — Konten dokumentasi & FAQ SakoSaring (Bahasa Indonesia).
 * Dipakai oleh komponen Documentation.jsx.
 */

export const DOC_SECTIONS = [
  {
    id: 'tentang',
    title: 'Tentang SakoSaring',
    icon: 'ℹ️',
    body: [
      'SakoSaring adalah sistem pemantauan & analisis kualitas udara untuk Kecamatan Sako, Kota Palembang, Sumatera Selatan. Aplikasi ini menampilkan Indeks Standar Pencemar Udara (ISPU) untuk PM2.5, PM10, CO, dan SO₂ secara real-time, lengkap dengan indeks kenyamanan & rekomendasi kesehatan.',
      'Dibangun dengan React + Vite + Tailwind CSS, dan tersambung ke database Neon PostgreSQL. Sumber daya gratis, bebas iklan, dan open source.'
    ]
  },
  {
    id: 'ispu',
    title: 'Memahami ISPU',
    icon: '📊',
    body: [
      'ISPU (Indeks Standar Pencemar Udara) adalah standar Kementerian Lingkungan Hidup & Kehutanan (KLHK) dengan skala 0–500:',
      '0–50 Baik (Hijau) • 51–100 Sedang (Kuning) • 101–199 Tidak Sehat (Oranye) • 200–299 Sangat Tidak Sehat (Merah) • ≥300 Berbahaya (Merah Tua).',
      'Nilai ISPU di SakoSaring dihitung dari sub-indeks tertinggi antara PM2.5, PM10, CO, dan SO₂, mengikuti praktik KLHK/BMKG.'
    ]
  },
  {
    id: 'cara-pakai',
    title: 'Cara Pakai',
    icon: '🚀',
    steps: [
      'Buka dashboard — pilih stasiun pemantauan di Kecamatan Sako.',
      'Lihat kartu ISPU: warna hijau = aman, kuning = waspada, merah = bahaya.',
      'Baca "Rekomendasi Kesehatan" untuk panduan aktivitas harian.',
      'Klik tombol hijau mengambang di kanan bawah untuk dukung via Trakteer.'
    ]
  },
  {
    id: 'instalasi',
    title: 'Instalasi Mandiri',
    icon: '🛠️',
    code: `# 1. Clone repository
git clone https://github.com/mzf/sakosaring.git
cd sakosaring

# 2. Install dependency
npm install

# 3. Siapkan database Neon
#    - Buat project di https://neon.tech
#    - Jalankan schema.sql di SQL Editor Neon

# 4. Konfigurasi environment
cp .env.example .env
#    isi VITE_NEON_CONNECTION_STRING=postgresql://...

# 5. Jalankan
npm run dev      # development → http://localhost:5173
npm run build    # produksi → folder dist/
npm run preview  # preview hasil build`
  },
  {
    id: 'keamanan',
    title: 'Keamanan',
    icon: '🔒',
    body: [
      'XSS prevention: semua input user disterilkan (lib/security.js) & React escape output otomatis.',
      'SQL injection: semua query memakai parameterized query via @neondatabase/serverless.',
      'Rate-limiting mock: pembatasan aksi sensitif di sisi client (lib/rateLimiter.js).',
      'Secure headers: CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy (vite.config.js).',
      'PENTING: jangan menaruh connection string Neon di client untuk produksi. Gunakan API proxy (Vercel/Netlify/Cloudflare Functions).'
    ]
  },
  {
    id: 'api',
    title: 'Struktur File Utama',
    icon: '📁',
    files: [
      ['src/App.jsx', 'Root: layout, state global, auto-refresh'],
      ['src/components/Dashboard.jsx', 'Dashboard ISPU + pemilihan stasiun'],
      ['src/components/FloatingWidget.jsx', 'Tombol & modal donasi Trakteer'],
      ['src/lib/neonClient.js', 'Connector Neon PostgreSQL'],
      ['src/lib/ispu.js', 'Perhitungan ISPU & rekomendasi kesehatan'],
      ['src/lib/security.js', 'Sanitasi input & XSS prevention'],
      ['schema.sql', 'Skema database: stasiun_sako & riwayat_trakteer']
    ]
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: '❓',
    faqs: [
      [
        'Dari mana data kualitas udara berasal?',
        'Dari sensor/stasiun pemantauan di Kecamatan Sako yang tersimpan di database Neon PostgreSQL. Jika belum dikonfigurasi, aplikasi memakai data demo.'
      ],
      [
        'Apakah aplikasi ini gratis?',
        'Ya, 100% gratis, bebas iklan, dan open source. Donasi via Trakteer bersifat sukarela untuk biaya server.'
      ],
      [
        'Seberapa sering data diperbarui?',
        'Setiap 1 menit (bisa diatur via VITE_REFRESH_INTERVAL). Anda juga bisa refresh manual.'
      ],
      [
        'Kenapa harus donasi Rp6.000?',
        'Harga secangkir kopi kecil. Cukup untuk membantu biaya server agar aplikasi tetap online & gratis untuk semua.'
      ]
    ]
  }
]

export default DOC_SECTIONS
