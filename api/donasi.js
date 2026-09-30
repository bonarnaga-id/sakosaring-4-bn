/**
 * api/donasi.js — Vercel Serverless Function
 * ------------------------------------------------------------------
 * SakoSaring — Menyimpan donasi Trakteer ke Neon PostgreSQL.
 *
 * Dengan memindahkan penulisan donasi ke server, connection string
 * Neon TIDAK lagi diekspos ke browser (sebelumnya dibaca langsung
 * dari import.meta.env.VITE_NEON_CONNECTION_STRING di client).
 *
 * Keamanan:
 *  - Parameterized query ($1, $2, ...) -> anti SQL injection.
 *  - Sanitasi input di sisi server (anti stored XSS).
 *  - Validasi: nama wajib, jumlah kelipatan Rp6.000, minimal Rp6.000.
 *  - Hanya menerima POST.
 * ------------------------------------------------------------------
 */

// Connection string Neon dibaca di SERVER (tidak pernah dikirim ke browser).
const CONNECTION_STRING = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || ''

const MAX_NAMA = 60
const MAX_PESAN = 160

// ------------------------------------------------------------------
// Sanitasi input (versi server, tanpa dependency DOM)
// ------------------------------------------------------------------

function sanitizeInput(str, maxLen) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/[<>"'`]/g, '') // buang karakter berbahaya
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

// ------------------------------------------------------------------
// Handler
// ------------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Metode tidak diizinkan' })
  }

  // Validasi & sanitasi input
  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body
  const nama = sanitizeInput(body?.nama, MAX_NAMA)
  const pesan = sanitizeInput(body?.pesan ?? '', MAX_PESAN)
  const jumlah = Number(body?.jumlah)

  if (!nama) {
    return res.status(400).json({ error: 'Nama donatur wajib diisi' })
  }
  if (!Number.isInteger(jumlah) || jumlah < 6000 || jumlah % 6000 !== 0) {
    return res.status(400).json({ error: 'Jumlah donasi tidak valid (harus kelipatan Rp6.000)' })
  }

  // Jika Neon belum dikonfigurasi di server, terima saja (no-op).
  if (!CONNECTION_STRING) {
    return res.status(200).json({
      id: Date.now(),
      nama,
      jumlah,
      pesan,
      dibuat_pada: new Date().toISOString(),
      tersimpan: false
    })
  }

  try {
    // Import dinamis agar dependency tidak dibundle saat tidak dipakai.
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(CONNECTION_STRING, { fetchOptions: { cache: 'no-store' } })

    const [row] = await sql`
      INSERT INTO riwayat_trakteer (nama_donatur, jumlah, pesan)
      VALUES (${nama}, ${jumlah}, ${pesan})
      RETURNING id, nama_donatur, jumlah, pesan, dibuat_pada
    `

    return res.status(200).json({ ...row, tersimpan: true })
  } catch (err) {
    console.error('[api/donasi] Gagal menyimpan donasi:', err)
    return res.status(500).json({ error: 'Gagal menyimpan donasi ke database' })
  }
}

function safeParse(str) {
  try {
    return JSON.parse(str)
  } catch {
    return {}
  }
}
