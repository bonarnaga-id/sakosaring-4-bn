# 🌿 SakoSaring

**Sistem Pemantauan & Analisis Kualitas Udara Sako**
Kecamatan Sako, Kota Palembang, Sumatera Selatan, Indonesia

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=neon&logoColor=white)](https://neon.tech)

> Web app gratis & bebas iklan untuk memantau Indeks Standar Pencemar Udara
> (ISPU) di Kecamatan Sako, Palembang. Dibangun dengan React + Vite + Tailwind
> CSS, di atas Vercel Serverless Functions, dengan data real dari CAMS
> (Copernicus) & BMKG.

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
- **🌍 Data real multi-sumber** — polutan CAMS via Open-Meteo + cuaca per-kelurahan BMKG + pembanding Open-Meteo Forecast
- **☕ Widget Trakteer mengambang** — modal in-app dengan QRIS dinamis (Rp6.000 + kelipatan)
- **🗄️ Database Neon PostgreSQL** — penyimpanan donasi (`riwayat_trakteer`)
- **🔒 Keamanan dasar** — XSS prevention, sanitasi input, rate-limiting mock, secure headers, tanpa kredensial di client
- **📱 Mobile-first** — responsif, cepat, zero-friction
- **♿ Aksesibel** — keyboard navigation, focus trap, ARIA labels, reduced-motion

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React.js 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Serverless API | Vercel Serverless Functions (`api/udara.js`, `api/donasi.js`) |
| Data polutan | CAMS (Copernicus) via Open-Meteo |
| Data cuaca | BMKG (`api.bmkg.go.id`) |
| Database (donasi) | Neon PostgreSQL (serverless, opsional) |
| Driver DB | `@neondatabase/serverless` (HTTP fetch, server-side) |
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
├── vercel.json                 # Config Vercel: framework, rewrites, headers
├── schema.sql                  # Skema Neon: riwayat_trakteer
├── .env.example                # Template environment variables
├── api/
│   ├── udara.js                # Serverless: CAMS polutan + BMKG cuaca + pembanding
│   └── donasi.js               # Serverless: simpan donasi ke Neon
├── public/
│   └── _headers                # Secure headers untuk Netlify
├── src/
│   ├── main.jsx                # Entry point React
│   ├── App.jsx                 # Root: layout, state, auto-refresh
│   ├── index.css               # Tailwind + komponen kustom
│   ├── components/
│   │   ├── Header.jsx          # Header & branding (logo/domain placeholder)
│   │   ├── Dashboard.jsx       # Dashboard ISPU utama + label sumber data
│   │   ├── Hero.jsx            # Kartu ISPU besar + status
│   │   ├── StationSelector.jsx # Pemilih kelurahan (chips)
│ │   ├── PollutantCard.jsx    # Kartu PM2.5/PM10/CO/SO₂
│   │   ├── ComfortCard.jsx     # Indeks kenyamanan
│   │   ├── HealthRecommendation.jsx  # Saran kesehatan dinamis
│ │   ├── FloatingWidget.jsx   # Tombol + modal Trakteer (QRIS)
│   │   ├── DownloadSection.jsx # CTA download source code
│   │   ├── Documentation.jsx   # Dokumentasi dalam app
│   │   └── Footer.jsx         # Footer
│   └── lib/
│       ├── apiClient.js        # Client API /api/udara (+ fallback langsung)
│       ├── neonClient.js       # Connector Neon (server-only, opsional)
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

# 3. Jalankan development server
npm run dev
```

Buka **http://localhost:5173** 🎉

Data kualitas udara langsung tersedia tanpa konfigurasi — aplikasi
mengambilnya dari CAMS (Open-Meteo) & BMKG. Jika endpoint `/api/udara`
tidak tersedia (mis. saat `npm run dev` tanpa server Vercel), client
memanggil sumber publik tersebut secara langsung sebagai fallback.

---

## 🌍 Sumber Data & Keterbatasan

| Data | Sumber | Sifat |
|---|---|---|
| PM2.5, PM10, CO, SO₂, NO₂, O₃ | CAMS (Copernicus Atmosphere Monitoring Service) via Open-Meteo | Model atmosfer, grid ~45 km |
| Suhu, kelembapan, kondisi cuaca, angin | BMKG (`api.bmkg.go.id`) | Resmi, **per-kelurahan** |
| Pembanding suhu & kelembapan | Open-Meteo Forecast | Model terpisah |

**Keterbatasan penting (jujur dibeberkan di dalam app):**

- **Tidak ada stasiun ISPU fisik di Kecamatan Sako.** Nilai polutan adalah
  data model atmosfer CAMS, bukan pengukuran langsung di lokasi.
- Karena resolusi grid CAMS ~45 km, **seluruh kelurahan Sako berada dalam
  satu sel grid**, sehingga nilai polutan ditampilkan sama untuk seluruh
  kecamatan. Aplikasi **tidak memalsukan** nilai berbeda per kelurahan.
- Yang membedakan antar kelurahan adalah **data cuaca BMKG**, yang memang
  bersifat per-kelurahan (kode Kemendagri `adm4`).

### Cakupan wilayah

Kecamatan Sako (Kode Kemendagri `16.71.08`), Kota Palembang — 4 kelurahan:
**Sako** (`16.71.08.1002`), **Sako Baru** (`16.71.08.1007`),
**Sialang** (`16.71.08.1006`), **Sukamaju** (`16.71.08.1001`).

---

## 🗄️ Setup Database Neon (opsional — hanya untuk donasi)

Database hanya dipakai untuk mencatat donasi. Data kualitas udara **tidak**
disimpan di database.

1. **Buat project Neon** gratis di [neon.tech](https://neon.tech)
2. Buka tab **SQL Editor** di dashboard Neon
3. **Copy-paste seluruh isi `schema.sql`** lalu klik **Run**. Ini akan membuat:
   - Tabel `riwayat_trakteer` — catatan donasi
4. Salin **connection string** dari dashboard Neon (menu "Connection Details")
5. Set sebagai environment variable **di Vercel** (bukan `.env` client):
   - Nama: `DATABASE_URL`
   - Nilai: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - Tipe: **Config** (bukan Secret — Vercel memblokir prefix `VITE_` bertipe Secret)

### API yang dipakai

```js
// Data kualitas udara (client -> serverless -> CAMS + BMKG)
import { fetchAirQuality } from './lib/apiClient.js'
const { stations, meta, perbandingan } = await fetchAirQuality()

// Donasi (client -> serverless -> Neon)
await fetch('/api/donasi', {
  method: 'POST',
  body: JSON.stringify({ nama: 'Budi', jumlah: 6000, pesan: 'Semangat!' })
})
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
| **XSS** | Sanitasi input (strip HTML tags, event handler, `javascript:`), React auto-escape output | `src/lib/security.js`, `api/donasi.js` |
| **SQL Injection** | Parameterized query via `@neondatabase/serverless` | `api/donasi.js` |
| **Brute Force / Spam** | Rate-limiting mock (sliding window, localStorage) | `src/lib/rateLimiter.js` |
| **Clickjacking** | `X-Frame-Options: SAMEORIGIN` + CSP `frame-ancestors` | `vite.config.js` |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` | `vite.config.js` |
| **Protocol Downgrade** | `Strict-Transport-Security` (HSTS) | `vite.config.js` |
| **Data Leak via Referrer** | `Referrer-Policy: strict-origin-when-cross-origin` | `vite.config.js` |
| **Inline Script Injection** | Content-Security-Policy | `vite.config.js` + `index.html` |
| **Kredensial DB terekspos** | Koneksi Neon hanya di server (`process.env.DATABASE_URL`), tidak pernah di client bundle | `api/donasi.js` |

### ⚠️ PENTING: Keamanan Database di Produksi

Connection string Neon yang ditaruh di `VITE_*` env **terekspos di browser**
dan dapat dibaca siapa saja. Aplikasi ini **sudah tidak memakai pendekatan
tersebut** — semua akses database dilakukan melalui Vercel Serverless
Functions di mana kredensial dibaca dari `process.env` di sisi server:

```js
// api/donasi.js (Vercel Serverless — kredensial TIDAK terekspos ke browser)
const { neon } = await import('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL) // hanya bisa dibaca di server

export default async function handler(req, res) {
  const [row] = await sql`INSERT INTO riwayat_trakteer ...`
  return res.status(200).json(row)
}
```

Langkah tambahan yang disarankan:

1. **JANGAN** simpan kredensial database di client-side bundle (prefix `VITE_`).
2. Tambahkan Row Level Security (RLS) di Neon untuk membatasi akses per user.
3. Aktifkan rate-limiting di edge middleware (Upstash Redis / Vercel).
4. Reset password Neon segera jika pernah tidak sengaja dibagikan.

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
3. Framework preset: **Vite** (sudah dikonfigurasi di `vercel.json`)
4. Folder `api/` otomatis menjadi Serverless Functions:
   - `GET /api/udara` → data kualitas udara (CAMS + BMKG)
   - `POST /api/donasi` → simpan donasi
5. Tambahkan env variable di Project settings → Environment Variables:
   - `DATABASE_URL` (opsional, hanya untuk donasi) — tipe **Config**

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

Data kualitas udara **tetap tampil** karena bersumber dari CAMS & BMKG, bukan
database. Database hanya dipakai untuk mencatat donasi — jika belum disiapkan,
`api/donasi.js` akan menerima donasi tanpa menyimpannya (no-op).
</details>

<details>
<summary><b>Seberapa sering data diperbarui?</b></summary>

Auto-refresh setiap 60 detik (default). Ubah via `VITE_REFRESH_INTERVAL` di
`.env` (satuan milidetik). Refresh manual juga tersedia via tombol "Perbarui".
Data CAMS & BMKG sendiri diperbarui per jam; respons API di-cache 5 menit di
CDN (`Cache-Control: max-age=300`).
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
