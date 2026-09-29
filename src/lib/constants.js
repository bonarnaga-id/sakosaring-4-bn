/**
 * lib/constants.js — Konfigurasi & placeholder branding SakoSaring.
 *
 * Semua nilai di sini mudah dikustomisasi tanpa menyentuh komponen.
 */

export const APP_CONFIG = {
  // === BRANDING (ganti dengan milik Anda) ===
  name: 'SakoSaring',
  tagline: 'Sistem Pemantauan & Analisis Kualitas Udara Sako',
  // Placeholder logo — ganti path / URL ini dengan logo Anda (SVG/PNG)
  logoUrl: null, // mis. '/logo.svg' atau import logo from '../assets/logo.svg'
  // Placeholder domain — ganti dengan domain produksi Anda
  domain: 'sakosaring.my.id',
  author: 'MZF',
  year: 2026,

  // === LOKASI TARGET ===
  region: {
    kecamatan: 'Sako',
    kota: 'Palembang',
    provinsi: 'Sumatera Selatan',
    negara: 'Indonesia',
    // Koordinat approx Kecamatan Sako, Palembang
    coordinates: { lat: -2.9767, lng: 104.7414 },
    timezone: 'Asia/Jakarta'
  },

  // === DATA ===
  refreshIntervalMs: import.meta.env.VITE_REFRESH_INTERVAL ?? 60_000,

  // === TRAKTEER ===
  // URL tujuan donasi (opsional). Jika diisi, tombol "Donasi via Trakteer"
  // di modal akan membuka link ini di tab baru.
  trakteerUrl: 'https://trakteer.id/sakosaring',

  // === DOWNLOAD ===
  // Ganti dengan link rilis GitHub / Google Drive Anda
  downloadUrl: '#download',

  // === SOSIAL / KONTAK (opsional) ===
  socials: {
    github: 'https://github.com/mzf/sakosaring'
  }
}

/**
 * Daftar polutan yang ditampilkan di dashboard.
 */
export const POLLUTANTS = [
  {
    key: 'pm25',
    name: 'PM2.5',
    fullName: 'Particulate Matter 2.5',
    unit: 'µg/m³',
    description: 'Partikel halus ≤2.5 mikron, paling berbahaya karena masuk ke paru-paru & aliran darah.',
    icon: 'cloud'
  },
  {
    key: 'pm10',
    name: 'PM10',
    fullName: 'Particulate Matter 10',
    unit: 'µg/m³',
    description: 'Partikel kasar ≤10 mikron, menyebabkan iritasi saluran pernapasan.',
    icon: 'cloud'
  },
  {
    key: 'co',
    name: 'CO',
    fullName: 'Karbon Monoksida',
    unit: 'µg/m³',
    description: 'Gas tak berwarna & tak berbau dari pembakaran tidak sempurna kendaraan.',
    icon: 'wind'
  },
  {
    key: 'so2',
    name: 'SO₂',
    fullName: 'Sulfur Dioksida',
    unit: 'µg/m³',
    description: 'Gas dari aktivitas industri & pembakaran bahan bakar fosil.',
    icon: 'wind'
  }
]

/**
 * Preset nominal donasi Trakteer — kelipatan Rp6.000.
 */
export const DONATION_PRESETS = [6000, 12000, 18000, 24000, 60000]

/**
 * Label ramah untuk tiap preset (kopi, nasi, dll).
 */
export const DONATION_LABELS = {
  6000: 'Kopi Kecil ☕',
  12000: 'Kopi Besar 🍵',
  18000: 'Cemilan 🍪',
  24000: 'Nasi Porsi 🍚',
  60000: 'Makan Bareng 🍛'
}

export default APP_CONFIG
