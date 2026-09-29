# 🌿 SakoSaring

**Sistem Pemantauan & Analisis Kualitas Udara Sako**
Kecamatan Sako, Kota Palembang, Sumatera Selatan, Indonesia

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=neon&logoColor=white)](https://neon.tech)

> Web app gratis & bebas iklan untuk memantau Indeks Standar Pencemar Udara
> (ISPU) di Kecamatan Sako, Palembang. Dibangun dengan React + Vite + Tailwind
> CSS, dengan database Neon PostgreSQL.

**Open Source oleh MZF - 2026**

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur File](#-struktur-file)
- [Instalasi Cepat](#-instalasi-cepat)
- [Setup Database Neon](#-setup-database-neon)
- [Kustomisasi](#-kustomisasi)
- [Keamanan](#-keamanan)
- [Build & Deploy](#-build--deploy)
- [FAQ](#-faq)

---

## ✨ Fitur Utama

- **📊 Dashboard ISPU real-time** — PM2.5, PM10, CO, SO₂ + indeks kenyamanan
- **🚦 Color-coded status** — Hijau (Baik), Kuning (Sedang), Merah (Tidak Sehat)
- **🧠 Rekomendasi kesehatan cerdas** — bahasa awam, langsung dipakai, berubah otomatis sesuai ISPU
- **☕ Widget Trakteer mengambang** — modal in-app dengan QRIS dinamis (Rp6.000 + kelipatan)
- **🗄️ Database Neon PostgreSQL** — `stasiun_sako` & `riwayat_trakteer`
- **🔒 Keamanan dasar** — XSS prevention, sanitasi input, rate-limiting mock, secure headers
- **📱 Mobile-first** — responsif, cepat, zero-friction
- **♿ Aksesibel** — keyboard navigation, focus trap, ARIA labels, reduced-motion

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React.js 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Database | Neon PostgreSQL (serverless) |
| Driver DB | `@neondatabase/serverless` (HTTP fetch) |
| QR Code | `qrcode` (generated client-side) |
| Bahasa UI | Indonesia 🇮🇩 |

---

## 📁 Struktur File

```
sakosaring/
├── index.html                  # HTML root + meta SEO & CSP
├── package.json
├── vite.config.js              # Vite + secure headers + chunk splitting
├── tailwind.config.js          # Tema warna ISPU + animasi
├── postcss.config.js
├── schema.sql                  # Skema Neon: stasiun_sako & riwayat_trakteer
├── .env.example                # Template environment variables
├── public/
│   └── _headers                # Secure headers untuk Netlify
├── src/
│   ├── main.jsx                # Entry point React
│   ├── App.jsx                 # Root: layout, state, auto-refresh
│   ├── index.css               # Tailwind + komponen kustom
│   ├── components/
│   │   ├── Header.jsx          # Header & branding (logo/domain placeholder)
│   │   ├── Dashboard.jsx       # Dashboard ISPU utama
│   │   ├── Hero.jsx            # Kartu ISPU besar + status
│   │   ├── StationSelector.jsx # Pemilih stasiun (chips)
│ │   ├── PollutantCard.jsx    # Kartu PM2.5/PM10/CO/SO₂
│   │   ├── ComfortCard.jsx     # Indeks kenyamanan
│   │   ├── HealthRecommendation.jsx  # Saran kesehatan dinamis
│ │   ├── FloatingWidget.jsx   # Tombol + modal Trakteer (QRIS)
│   │   ├── DownloadSection.jsx # CTA download source code
│   │   ├── Documentation.jsx   # Dokumentasi dalam app
│   │   └── Footer.jsx         # Footer
│   └── lib/
│       ├── neonClient.js       # Connector Neon PostgreSQL
│       ├── ispu.js             # Perhitungan ISPU & rekomendasi
│       ├── security.js         # Sanitasi input & XSS prevention
│       ├── rateLimiter.js      # Rate-limiting mock
│       ├── format.js           # Format Indonesia (id-ID)
│       ├── constants.js        # Konfigurasi & branding placeholder
│       └── docs.js             # Konten dokumentasi
```

---

## 🚀 Instalasi Cepat

> **Prasyarat:** Node.js 18+ dan npm

```bash
# 1. Clone repository
git clone https://github.com/mzf/sakosaring.git
cd sakosaring

# 2. Install dependency
npm install

# 3. Konfigurasi environment (lihat bagian database di bawah)
cp .env.example .env

# 4. Jalankan development server
npm run dev
```

Buka **http://localhost:5173** 🎉

Tanpa konfigurasi database, aplikasi otomatis berjalan dalam **Mode Demo**
(menampilkan data contoh yang realistis).

---

## 🗄️ Setup Database Neon

1. **Buat project Neon** gratis di [neon.tech](https://neon.tech)
2. Buka tab **SQL Editor** di dashboard Neon
3. **Copy-paste seluruh isi `schema.sql`** lalu klik **Run**. Ini akan membuat:
   - Tabel `stasiun_sako` — data kualitas udara per stasiun
   - Tabel `riwayat_trakteer` — catatan donasi
   - Tabel `riwayat_pembacaan` — riwayat untuk grafik (opsional)
   - Data contoh 3 stasiun di Kecamatan Sako
4. Salin **connection string** dari dashboard Neon (menu "Connection Details")
5. Tempel ke file `.env`:

```env
VITE_NEON_CONNECTION_STRING=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

6. Restart dev server: `npm run dev`

### Query yang dipakai

```js
import { fetchAirQuality, saveDonation } from './lib/neonClient.js'

const stations = await fetchAirQuality()      // SELECT dari stasiun_sako
await saveDonation({ nama: 'Budi', jumlah: 6000, pesan: 'Semangat!' })
```

Semua query memakai **parameterized query** (`$1`, `$2`, …) untuk mencegah
SQL injection.

---

## 🎨 Kustomisasi

Semua nilai branding terpusat di **`src/lib/constants.js`**:

```js
export const APP_CONFIG = {
  name: 'SakoSaring',              // Nama aplikasi
  logoUrl: null,                   // Ganti dengan path logo Anda
  domain: 'sakosaring.my.id',      // Ganti dengan domain Anda
  author: 'MZF',
  trakteerUrl: 'https://trakteer.id/sakosaring',
  downloadUrl: '#download',
  // ...
}
```

| Yang ingin diubah | Lokasi |
|---|---|
| Nama & logo aplikasi | `src/lib/constants.js` + markup SVG di `Header.jsx` |
| Domain | `src/lib/constants.js` → `APP_CONFIG.domain` |
| Warna tema | `tailwind.config.js` → `colors.brand` |
| Warna status ISPU | `tailwind.config.js` → `colors.ispu` + `src/lib/ispu.js` |
| Preset donasi | `src/lib/constants.js` → `DONATION_PRESETS` |
| Link download | `src/lib/constants.js` → `APP_CONFIG.downloadUrl` |
| Interval refresh | `.env` → `VITE_REFRESH_INTERVAL` (ms) |
| Rekomendasi kesehatan | `src/lib/ispu.js` → `getHealthRecommendation()` |

---

## 🔒 Keamanan

Aplikasi ini menerapkan lapisan keamanan dasar terhadap ancaman web umum:

| Ancaman | Mitigasi | Lokasi |
|---|---|---
| **XSS** | Sanitasi input (strip HTML tags, event handler, `javascript:`), React auto-escape output | `src/lib/security.js` |
| **SQL Injection** | Parameterized query via `@neondatabase/serverless` | `src/lib/neonClient.js` |
| **Brute Force / Spam** | Rate-limiting mock (sliding window, localStorage) | `src/lib/rateLimiter.js` |
| **Clickjacking** | `X-Frame-Options: SAMEORIGIN` + CSP `frame-ancestors` | `vite.config.js` |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` | `vite.config.js` |
| **Protocol Downgrade** | `Strict-Transport-Security` (HSTS) | `vite.config.js` |
| **Data Leak via Referrer** | `Referrer-Policy: strict-origin-when-cross-origin` | `vite.config.js` |
| **Inline Script Injection** | Content-Security-Policy | `vite.config.js` + `index.html` |

### ⚠️ PENTING: Keamanan Database di Produksi

Connection string Neon yang ditaruh di `VITE_*` env **terekspos di browser**
dan dapat dibaca siapa saja. Untuk produksi:

1. **JANGAN** simpan kredensial database di client-side bundle.
2. Gunakan **API proxy** — contoh Vercel Serverless Function:

```js
// api/air-quality.js (Vercel)
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL) // secret, tidak terekspos

export default async function handler(req, res) {
  const data = await sql`SELECT * FROM stasiun_sako`
  res.setHeader('Cache-Control', 's-maxage=60')
  return res.status(200).json(data)
}
```

3. Set `VITE_API_BASE_URL` di `.env` agar app memakai endpoint API tersebut.
4. Tambahkan Row Level Security (RLS) di Neon untuk membatasi akses per user.
5. Aktifkan rate-limiting di edge middleware (Upstash Redis / Vercel).

---

## 📦 Build & Deploy

```bash
npm run build      # Build produksi → folder dist/
npm run preview    # Preview hasil build di http://localhost:4173
```

### Deploy ke Netlify

1. Push repository ke GitHub
2. Connect repository di [Netlify](https://netlify.com)
3. Build command: `npm run build` • Publish directory: `dist`
4. Tambahkan env variables di Site settings → Environment
5. Secure headers otomatis terbaca dari `public/_headers`

### Deploy ke Vercel

1. Push repository ke GitHub
2. Import di [Vercel](https://vercel.com)
3. Framework preset: **Vite**
4. Tambahkan env variables di Project settings → Environment Variables

### Deploy ke GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

---

## ❓ FAQ

<details>
<summary><b>Bagaimana cara mengganti logo?</b></summary>

Letakkan file logo di `public/logo.svg`, lalu set `APP_CONFIG.logoUrl = '/logo.svg'`
di `src/lib/constants.js`. Atau ganti langsung markup SVG di `src/components/Header.jsx`.
</details>

<details>
<summary><b>Apakah QRIS di modal bisa dipakai membayar?</b></summary>

Belum — QRIS yang ditampilkan adalah **placeholder demo**. Untuk donasi nyata,
ganti `buildQrisPayload()` di `FloatingWidget.jsx` dengan QRIS statis merchant
Anda, atau integrasikan payment processor (Tripay/Midtrans/Trakteer API) untuk
QRIS dinamis per transaksi.
</details>

<details>
<summary><b>Bagaimana jika database Neon belum disiapkan?</b></summary>

Aplikasi otomatis berjalan dalam **Mode Demo** dengan data contoh yang
realistis. Semua fitur tetap berfungsi; hanya saja data tidak tersimpan
permanen.
</details>

<details>
<summary><b>Seberapa sering data diperbarui?</b></summary>

Auto-refresh setiap 60 detik (default). Ubah via `VITE_REFRESH_INTERVAL` di
`.env` (satuan milidetik). Refresh manual juga tersedia via tombol "Perbarui".
</details>

---

## 📄 Lisensi

Open Source — bebas digunakan, dimodifikasi, dan disebarluaskan.

---

## 🙏 Dukung

**Web app ini gratis & bebas iklan. Kopi kecil, server tetap jalan** ☕

Klik tombol mengambang di kanan bawah untuk donasi mulai **Rp6.000**.

---

**Open Source oleh MZF - 2026**
