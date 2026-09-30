/**
 * lib/neonClient.js
 * ------------------------------------------------------------------
 * SakoSaring — Connector Neon PostgreSQL (KHUSUS SERVER).
 *
 * PERINGATAN: Modul ini TIDAK boleh diimpor dari kode client (browser)
 * karena membaca kredensial dari environment. Penulisan donasi sudah
 * dipindahkan ke api/donasi.js (serverless function).
 *
 * Data kualitas udara sekarang berasal dari api/udara.js (sumber real:
 * CAMS via Open-Meteo + BMKG), bukan dari tabel stasiun_sako.
 *
 * Modul ini disediakan untuk pemakaian server-side opsional:
 *  - fetchDonations(): wall of thanks dari tabel riwayat_trakteer.
 * ------------------------------------------------------------------
 */

const CONNECTION_STRING =
  process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || ''

/** Flag: Neon terkonfigurasi di server? */
export const IS_DEMO_MODE = !CONNECTION_STRING

let sqlClient = null

function getSql() {
  if (!sqlClient) {
    if (IS_DEMO_MODE) {
      throw new Error('Neon DB belum dikonfigurasi di server')
    }
    const { neon } = require('@neondatabase/serverless')
    sqlClient = neon(CONNECTION_STRING, { fetchOptions: { cache: 'no-store' } })
  }
  return sqlClient
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

export default { fetchDonations, IS_DEMO_MODE }
