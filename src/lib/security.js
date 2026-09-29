/**
 * lib/security.js
 * ------------------------------------------------------------------
 * SakoSaring — Lapisan keamanan dasar (XSS prevention & sanitasi).
 *
 * Filosofi: "sanitize on input, escape on output".
 * Semua input dari user disterilkan di sini sebelum masuk DB/state,
 * dan React otomatis escape saat render (JSX tidak render string
 * sebagai HTML mentah).
 * ------------------------------------------------------------------
 */

/**
 * Membuang karakter berbahaya & tag HTML dari input user.
 * Mencegah stored-XSS (mis. nama donatur berisi <script>).
 *
 * @param {string} value - input mentah
 * @param {number} maxLength - panjang maksimum (default 100)
 * @returns {string} teks aman
 */
export function sanitizeInput(value, maxLength = 100) {
  if (typeof value !== 'string') return ''

  return (
    value
      // 1. Buang semua tag HTML (bukan escape — benar-benar dibuang)
      .replace(/<[^>]*>/g, '')
      // 2. Netralkan entity berbahaya yang umum dipakai XSS
      .replace(/&(#\d+|#x[0-9a-f]+|lt|gt|amp|quot|apos|script);/gi, '')
      // 3. Buang event handler & javascript: URI
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // 4. Karakter kontrol & null byte
      .replace(/[\u0000-\u001f\u007f]/g, '')
      // 5. Spasi ganda & trim
      .replace(/\s+/g, ' ')
      .trim()
      // 6. Potong sesuai maxLength
      .slice(0, maxLength)
  )
}

/**
 * Sanitasi khusus pesan donatur: memperbolehkan tanda baca umum.
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeMessage(value, maxLength = 200) {
  return sanitizeInput(value, maxLength)
}

/**
 * Sanitasi "live" saat user mengetik (onChange).
 *
 * Berbeda dengan sanitizeInput(): versi ini TIDAK melakukan trim atau
 * collapse spasi, agar user masih bisa mengetik spasi di tengah kata.
 * Hanya membuang pola berbahaya (tag HTML, event handler, javascript: URI,
 * karakter kontrol) sehingga payload XSS tidak pernah masuk ke state React.
 *
 * @param {string} value - input mentah
 * @param {number} maxLength - panjang maksimum
 * @returns {string} teks aman (spasi tetap utuh)
 */
export function sanitizeLive(value, maxLength = 100) {
  if (typeof value !== 'string') return ''

  return (
    value
      .replace(/<[^>]*>/g, '')
      .replace(/&(#\d+|#x[0-9a-f]+|lt|gt|amp|quot|apos|script);/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .slice(0, maxLength)
  )
}

/**
 * Escape HTML entity — dipakai jika ada kebutuhan render string
 * di luar JSX (mis. innerHTML, meski dihindari).
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return ''
  return str.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]
  )
}

/**
 * Validasi angka aman (mencegah NaN, negatif, atau nilai ekstrem).
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @returns {number|null} angka valid atau null
 */
export function safeNumber(value, min = 0, max = Infinity) {
  const n = typeof value === 'number' ? value : parseFloat(value)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return n
}

/**
 * Validasi format email sederhana (untuk newsletter opsional).
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== 'string' || email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export default { sanitizeInput, sanitizeMessage, escapeHtml, safeNumber, isValidEmail }
