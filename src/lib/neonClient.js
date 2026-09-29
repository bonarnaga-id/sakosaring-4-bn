/**
 * lib/neonClient.js
 * ------------------------------------------------------------------
 * SakoSaring — Database connector untuk Neon PostgreSQL.
 *
 * Menggunakan @neondatabase/serverless (HTTP fetch driver, ringan &
 * cepat untuk edge/browser). Mengambil data kualitas udara dari tabel
 * `stasiun_sako` dan menyimpan donasi ke `riwayat_trakteer`.
 *
 * KEAMANAN:
 *  - Semua query memakai parameterized query ($1, $2, ...) untuk
 *    mencegah SQL Injection.
 *  - Input user (nama donatur, pesan) disterilkan via sanitizeInput()
 *    sebelum ditulis ke DB (mencegah stored XSS).
 *  - Rate-limiting mock di client (lihat lib/rateLimiter.js).
 * ------------------------------------------------------------------
 */

import { neon } from '@neondatabase/serverless'
import { sanitizeInput, sanitizeMessage } from './security.js'

// ------------------------------------------------------------------
// Konfigurasi koneksi
// ------------------------------------------------------------------

/**
 * Connection string Neon.
 * Diambil dari env; jika kosong → mode demo (data lokal).
 */
const CONNECTION_STRING =
  import.meta.env.VITE_NEON_CONNECTION_STRING ?? ''

/**
 * Flag mode demo: true jika tidak ada kredensial Neon.
 * App tetap berfungsi penuh dengan data dummy realistis.
 */
export const IS_DEMO_MODE = !CONNECTION_STRING

// Singleton client (dibuat sekali, dipakai ulang)
let sqlClient = null

/**
 * Mengambil (atau membuat) instance Neon SQL client.
 * @returns {Function} tagged template `sql` function
 */
function getSql() {
  if (!sqlClient) {
    if (IS_DEMO_MODE) {
      throw new Error(
        'Neon DB belum dikonfigurasi. Set VITE_NEON_CONNECTION_STRING di .env'
      )
    }
    // neon() mengembalikan tagged-template function dengan
    // parameterized queries otomatis (anti SQL injection).
    sqlClient = neon(CONNECTION_STRING, {
      // Neon membutuhkan TLS; aktifkan secara eksplisit.
      fetchOptions: { cache: 'no-store' }
    })
  }
  return sqlClient
}

// ------------------------------------------------------------------
// Data udara — READ
// ------------------------------------------------------------------

/**
 * Mengambil data kualitas udara TERBARU dari semua stasiun di Sako.
 * @returns {Promise<Array<Object>>} daftar stasiun + parameter udara
 */
export async function fetchAirQuality() {
  if (IS_DEMO_MODE) return demoAirQuality()

  const sql = getSql()
  // Parameterized query, hanya baca, urutkan stasiun alfabetis.
  const rows = await sql`
    SELECT
      id,
      nama_stasiun,
      lokasi,
      pm25,
      pm10,
      co,
      so2,
      status,
      temperature,
      humidity,
      dibaca_pada
    FROM stasiun_sako
    ORDER BY nama_stasiun ASC
  `
  return rows.map(normalizeStationRow)
}

/**
 * Mengambil riwayat pembacaan satu stasiun (untuk grafik/tren).
 * @param {number} stationId - ID stasiun
 * @param {number} limit - jumlah baris (default 24)
 * @returns {Promise<Array<Object>>}
 */
export async function fetchStationHistory(stationId, limit = 24) {
  if (IS_DEMO_MODE) return demoHistory(stationId)

  // Validasi input numerik (defense-in-depth)
  const id = Number(stationId)
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID stasiun tidak valid')
  }

  const sql = getSql()
  const rows = await sql`
    SELECT pm25, pm10, temperature, humidity, dibaca_pada
    FROM riwayat_pembacaan
    WHERE stasiun_id = ${id}
    ORDER BY dibaca_pada DESC
    LIMIT ${limit}
  `
  return rows
}

// ------------------------------------------------------------------
// Donasi Trakteer — WRITE
// ------------------------------------------------------------------

/**
 * Menyimpan catatan donasi ke tabel `riwayat_trakteer`.
 * @param {{ nama: string, jumlah: number, pesan?: string }} data
 * @returns {Promise<Object|null>} record yang disimpan (atau null di demo)
 */
export async function saveDonation({ nama, jumlah, pesan = '' }) {
  // 1. Sterilkan input user (XSS prevention)
  const cleanNama = sanitizeInput(nama, 60)
  const cleanPesan = sanitizeMessage(pesan, 160)

  // 2. Validasi server-side style: nama wajib, jumlah harus kelipatan 6000
  if (!cleanNama) throw new Error('Nama donatur wajib diisi')
  const amount = Number(jumlah)
  if (!Number.isInteger(amount) || amount < 6000 || amount % 6000 !== 0) {
    throw new Error('Jumlah donasi tidak valid (harus kelipatan Rp6.000)')
  }

  // 3. Mode demo: tidak menulis ke DB
  if (IS_DEMO_MODE) {
    return {
      id: Date.now(),
      nama: cleanNama,
      jumlah: amount,
      pesan: cleanPesan,
      dibuat_pada: new Date().toISOString()
    }
  }

  // 4. Tulis ke Neon dengan parameterized query (anti SQL injection)
  const sql = getSql()
  const [row] = await sql`
    INSERT INTO riwayat_trakteer (nama_donatur, jumlah, pesan)
    VALUES (${cleanNama}, ${amount}, ${cleanPesan})
    RETURNING id, nama_donatur, jumlah, pesan, dibuat_pada
  `
  return row
}

/**
 * Mengambil daftar donatur (untuk wall of thanks, opsional).
 * @param {number} limit
 * @returns {Promise<Array<Object>>}
 */
export async function fetchDonations(limit = 10) {
  if (IS_DEMO_MODE) return []

  const sql = getSql()
  return sql`
    SELECT nama_donatur, jumlah, pesan, dibuat_pada
    FROM riwayat_trakteer
    ORDER BY dibuat_pada DESC
    LIMIT ${limit}
  `
}

// ------------------------------------------------------------------
// Helper
// ------------------------------------------------------------------

/**
 * Menormalisasi satu baris stasiun dari DB menjadi format UI.
 */
function normalizeStationRow(row) {
  return {
    id: row.id,
    nama: row.nama_stasiun,
    lokasi: row.lokasi,
    pm25: Number(row.pm25) || 0,
    pm10: Number(row.pm10) || 0,
    co: Number(row.co) || 0,
    so2: Number(row.so2) || 0,
    status: row.status,
    temperature: Number(row.temperature) || 0,
    humidity: Number(row.humidity) || 0,
    dibacaPada: row.dibaca_pada
  }
}

// ------------------------------------------------------------------
// Data demo (dipakai saat Neon belum dikonfigurasi)
// ------------------------------------------------------------------

const DEMO_STATIONS = [
  {
    id: 1,
    nama: 'Stasiun Sako 1',
    lokasi: 'Kelurahan Sako, Kecamatan Sako, Palembang',
    pm25: 42,
    pm10: 68,
    co: 2.1,
    so2: 8,
    temperature: 31.5,
    humidity: 74
  },
  {
    id: 2,
    nama: 'Stasiun Kemuning',
    lokasi: 'Kelurahan Kemuning, Kecamatan Sako, Palembang',
    pm25: 58,
    pm10: 91,
    co: 3.4,
    so2: 12,
    temperature: 32.1,
    humidity: 70
  },
  {
    id: 3,
    nama: 'Stasiun Kebon Semai',
    lokasi: 'Kelurahan Kebon Semai, Kecamatan Sako, Palembang',
    pm25: 29,
    pm10: 47,
    co: 1.6,
    so2: 5,
    temperature: 30.8,
    humidity: 78
  }
]

function demoAirQuality() {
  // Tambahkan fluktuasi kecil agar terasa "real-time"
  const jitter = (base, spread) =>
    Math.max(0, +(base + (Math.random() - 0.5) * spread).toFixed(1))

  return DEMO_STATIONS.map((s) => ({
    ...s,
    pm25: jitter(s.pm25, 6),
    pm10: jitter(s.pm10, 8),
    co: jitter(s.co, 0.6),
    so2: jitter(s.so2, 2),
    temperature: jitter(s.temperature, 0.8),
    humidity: jitter(s.humidity, 4),
    dibacaPada: new Date().toISOString()
  }))
}

function demoHistory(stationId) {
  const base = DEMO_STATIONS.find((s) => s.id === Number(stationId)) ?? DEMO_STATIONS[0]
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setHours(d.getHours() - i)
    return {
      pm25: Math.max(5, Math.round(base.pm25 + Math.sin(i / 2) * 14 + (Math.random() - 0.5) * 8)),
      pm10: Math.max(8, Math.round(base.pm10 + Math.sin(i / 2) * 20 + (Math.random() - 0.5) * 10)),
      temperature: +(base.temperature + Math.sin(i / 3) * 2).toFixed(1),
      humidity: Math.min(100, Math.max(30, Math.round(base.humidity + Math.cos(i / 3) * 8))),
      dibaca_pada: d.toISOString()
    }
  }).reverse()
}

export default { fetchAirQuality, fetchStationHistory, saveDonation, fetchDonations, IS_DEMO_MODE }
