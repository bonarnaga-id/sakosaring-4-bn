/**
 * lib/ispu.js
 * ------------------------------------------------------------------
 * SakoSaring — Logika Indeks Standar Pencemar Udara (ISPU).
 *
 * ISPU adalah standar Kementerian Lingkungan Hidup & Kehutanan (KLHK)
 * Indonesia, skala 0-500. Kategori:
 *   0-50    : Baik            (hijau)
 *   51-100  : Sedang          (kuning)
 *   101-199 : Tidak Sehat     (oranye/merah)
 *   200-299 : Sangat Tidak Sehat
 *   >=300   : Berbahaya
 * ------------------------------------------------------------------
 */

/**
 * Kategori ISPU beserta warna, label, dan deskripsi.
 */
export const ISPU_CATEGORIES = {
  good: {
    key: 'good',
    label: 'Baik',
    color: '#22c55e',
    bg: 'bg-emerald-500',
    bgSoft: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    border: 'border-emerald-200',
    description: 'Kualitas udara sangat aman untuk semua aktivitas.'
  },
  moderate: {
    key: 'moderate',
    label: 'Sedang',
    color: '#eab308',
    bg: 'bg-yellow-500',
    bgSoft: 'bg-yellow-50',
    text: 'text-yellow-700',
    ring: 'ring-yellow-200',
    border: 'border-yellow-200',
    description: 'Cukup baik, namun waspada bagi kelompok sensitif.'
  },
  unhealthy: {
    key: 'unhealthy',
    label: 'Tidak Sehat',
    color: '#f97316',
    bg: 'bg-orange-500',
    bgSoft: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-200',
    border: 'border-orange-200',
    description: 'Kurangi aktivitas luar ruangan yang berat.'
  },
  veryUnhealthy: {
    key: 'veryUnhealthy',
    label: 'Sangat Tidak Sehat',
    color: '#ef4444',
    bg: 'bg-red-500',
    bgSoft: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-200',
    border: 'border-red-200',
    description: 'Hindari aktivitas di luar ruangan.'
  },
  hazardous: {
    key: 'hazardous',
    label: 'Berbahaya',
    color: '#7f1d1d',
    bg: 'bg-red-900',
    bgSoft: 'bg-red-100',
    text: 'text-red-900',
    ring: 'ring-red-300',
    border: 'border-red-300',
    description: 'Tetap di dalam ruangan. Gunakan purifier udara.'
  }
}

/**
 * Menentukan kategori ISPU dari nilai indeks.
 * @param {number} ispu - nilai ISPU 0-500
 * @returns {Object} kategori
 */
export function getIspuCategory(ispu) {
  const v = Number(ispu) || 0
  if (v <= 50) return ISPU_CATEGORIES.good
  if (v <= 100) return ISPU_CATEGORIES.moderate
  if (v <= 199) return ISPU_CATEGORIES.unhealthy
  if (v <= 299) return ISPU_CATEGORIES.veryUnhealthy
  return ISPU_CATEGORIES.hazardous
}

/**
 * Breakpoints sub-indeks ISPU per polutan (KLHK).
 * Dipakai untuk mengkonversi konsentrasi → indeks.
 */
const ISPU_BREAKPOINTS = {
  pm25: [
    [0, 15.5, 0, 50],
    [15.5, 55.4, 51, 100],
    [55.4, 150.4, 101, 199],
    [150.4, 250.4, 200, 299],
    [250.4, 500, 300, 500]
  ],
  pm10: [
    [0, 50, 0, 50],
    [50, 150, 51, 100],
    [150, 350, 101, 199],
    [350, 420, 200, 299],
    [420, 600, 300, 500]
  ],
  so2: [
    [0, 52, 0, 50],
    [52, 180, 51, 100],
    [180, 400, 101, 199],
    [400, 800, 200, 299],
    [800, 1600, 300, 500]
  ],
  co: [
    [0, 4000, 0, 50],
    [4000, 10000, 51, 100],
    [10000, 17000, 101, 199],
    [17000, 34000, 200, 299],
    [34000, 57000, 300, 500]
  ]
}

/**
 * Mengkonversi konsentrasi polutan menjadi sub-indeks ISPU.
 * @param {number} concentration - nilai konsentrasi (µg/m³ untuk PM, µg/m³ SO2, µg/m³ CO)
 * @param {'pm25'|'pm10'|'so2'|'co'} pollutant
 * @returns {number} sub-indeks ISPU
 */
export function calculateSubIndex(concentration, pollutant) {
  const c = Number(concentration)
  if (!Number.isFinite(c) || c < 0) return 0

  const bp = ISPU_BREAKPOINTS[pollutant]
  if (!bp) return 0

  for (const [cLo, cHi, iLo, iHi] of bp) {
    if (c >= cLo && c <= cHi) {
      // Rumus ISPU: I = (I_hi - I_lo)/(C_hi - C_lo) * (C - C_lo) + I_lo
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (c - cLo) + iLo)
    }
  }
  // Di atas rentang terakhir → maksimum
  return 500
}

/**
 * Menghitung ISPU gabungan dari sebuah stasiun (ambil sub-indeks tertinggi,
 * sesuai praktik KLHK/BMKG).
 * @param {{ pm25?: number, pm10?: number, so2?: number, co?: number }} params
 * @returns {number} ISPU 0-500
 */
export function calculateISPU({ pm25 = 0, pm10 = 0, so2 = 0, co = 0 }) {
  const subs = [
    calculateSubIndex(pm25, 'pm25'),
    calculateSubIndex(pm10, 'pm10'),
    calculateSubIndex(so2, 'so2'),
    calculateSubIndex(co, 'co')
  ]
  return Math.max(...subs)
}

/**
 * Indeks kenyamanan (comfort index) sederhana berbasis suhu & kelembapan.
 * Mengembalikan nilai 0-100 (semakin tinggi = semakin nyaman) + label.
 * @param {number} temperature - °C
 * @param {number} humidity - %
 * @returns {{ value: number, label: string, color: string }}
 */
export function calculateComfortIndex(temperature = 28, humidity = 70) {
  const t = Number(temperature) || 28
  const h = Number(humidity) || 70

  // Heat index sederhana (Rothfusz, disederhanakan)
  const feelsLike =
    t + 0.05 * (h - 40) + (t > 32 ? (t - 32) * 0.35 : 0)

  // Mapping: 22-26°C = nyaman sempurna (100), menjauh dari sana turun
  const distance = Math.abs(feelsLike - 24)
  const value = Math.max(0, Math.min(100, Math.round(100 - distance * 3.2)))

  let label = 'Nyaman'
  let color = '#22c55e'
  if (value < 75) {
    label = 'Cukup Nyaman'
    color = '#84cc16'
  }
  if (value < 55) {
    label = 'Gerah'
    color = '#eab308'
  }
  if (value < 35) {
    label = 'Sangat Gerah'
    color = '#f97316'
  }

  return { value, label, color, feelsLike: +feelsLike.toFixed(1) }
}

/**
 * Rekomendasi kesehatan cerdas — bahasa awam, non-teknis, langsung.
 * @param {number} ispu - nilai ISPU
 * @param {string} [groupName] - kelompok sensitif opsional
 * @returns {{ title: string, advice: string[], level: string }}
 */
export function getHealthRecommendation(ispu, groupName) {
  const cat = getIspuCategory(ispu)
  const base = `Berdasarkan ISPU ${Math.round(ispu)} (${cat.label})`

  const RECS = {
    good: {
      title: 'Aman untuk Semua Aktivitas',
      level: 'Aman',
      advice: [
        '✅ Aman berolahraga & beraktivitas di luar ruangan sepanjang hari.',
        '✅ Tidak perlu memakai masker untuk aktivitas normal.',
        '✅ Amankan jendela & ventilasi rumah tetap terbuka untuk sirkulasi udara.',
        '✅ Waktu yang tepat untuk aktivitas luar: pagi & sore hari.'
      ]
    },
    moderate: {
      title: 'Tetap Aman, Waspada untuk Kelompok Sensitif',
      level: 'Waspada',
      advice: [
        '🟡 Aktivitas luar ruangan masih aman untuk orang sehat.',
        '🟡 Bagi anak, lansia, ibu hamil, & penderita asma/ISPA: batasi aktivitas luar yang berat.',
        '🟡 Disarankan memakai masker saat beraktivitas di jalan raya.',
        '🟡 Perhatikan gejala: batuk, sesak, atau iritasi mata → segera istirahat di dalam ruangan.'
      ]
    },
    unhealthy: {
      title: 'Kurangi Aktivitas di Luar Ruangan',
      level: 'Kurangi Aktivitas',
      advice: [
        '🟠 Kurangi aktivitas fisik berat di luar ruangan (olahraga, bersepeda, jalan kaki jauh).',
        '🟠 Wajib memakai masker (N95/KN95 jika tersedia) saat keluar rumah.',
        '🟠 Tutup jendela & nyalakan AC/purifier udara di dalam ruangan.',
        '🟠 Kelompok sensitif (anak, lansia, ibu hamil, asma) disarankan tetap di dalam rumah.'
      ]
    },
    veryUnhealthy: {
      title: 'Hindari Aktivitas di Luar Ruangan',
      level: 'Hindari Luar Ruangan',
      advice: [
        '🔴 Hindari semua aktivitas di luar ruangan, terutama bagi kelompok sensitif.',
        '🔴 Pakai masker N95/KN95 jika terpaksa keluar rumah.',
        '🔴 Tutup rapat semua jendela, nyalakan purifier udara secara terus-menerus.',
        '🔴 Segera cari fasilitas kesehatan jika muncul sesak napas, batuk hebat, atau nyeri dada.'
      ]
    },
    hazardous: {
      title: 'Keadaan Darurat — Tetap di Dalam Ruangan',
      level: 'Darurat',
      advice: [
        '⛔ SEMUA orang harus tetap berada di dalam ruangan. Jangan keluar kecuali sangat mendesak.',
        '⛔ Pakai masker N95/KN95 + pelindung mata jika terpaksa keluar.',
        '⛔ Matikan ventilasi dari luar, nyalakan purifier, segel celah pintu/jendela.',
        '⛔ Hubungi 119 ( ambulans ) atau fasilitas kesehatan terdekat bila ada gangguan pernapasan.'
      ]
    }
  }

  const rec = RECS[cat.key] || RECS.moderate
  return {
    ...rec,
    title: groupName ? `${rec.title} — ${groupName}` : rec.title,
    base,
    category: cat
  }
}

export default {
  ISPU_CATEGORIES,
  getIspuCategory,
  calculateSubIndex,
  calculateISPU,
  calculateComfortIndex,
  getHealthRecommendation
}
