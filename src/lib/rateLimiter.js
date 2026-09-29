/**
 * lib/rateLimiter.js
 * ------------------------------------------------------------------
 * SakoSaring — Rate-limiting mock (client-side).
 *
 * Membatasi frekuensi aksi sensitif (simpan donasi, refresh data)
 * untuk mencegah penyalahgunaan/spam. Ini adalah lapisan UX +
 * defense-in-depth; di produksi WAJIB didampingi rate-limit server
 * (mis. Upstash Redis, Vercel Edge Middleware, atau Neon RLS).
 * ------------------------------------------------------------------
 */

/**
 * Sliding-window rate limiter berbasis localStorage.
 */
export class RateLimiter {
  /**
   * @param {Object} opts
   * @param {string} opts.key - nama unik aksi (mis. 'donation')
   * @param {number} opts.max - jumlah maksimum
   * @param {number} opts.windowMs - jendela waktu (ms)
   */
  constructor({ key, max = 5, windowMs = 60_000 }) {
    this.key = `sakosaring:rl:${key}`
    this.max = max
    this.windowMs = windowMs
  }

  /** Membaca timestamps tersimpan (tangani error parsing). */
  _read() {
    try {
      const raw = localStorage.getItem(this.key)
      const arr = raw ? JSON.parse(raw) : []
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }

  /** Menulis timestamps. */
  _write(stamps) {
    try {
      localStorage.setItem(this.key, JSON.stringify(stamps))
    } catch {
      /* storage penuh / diblokir → abaikan */
    }
  }

  /**
   * Mencoba satu aksi. Melempar Error jika melebihi batas.
   * @returns {{ allowed: boolean, remaining: number, retryIn: number }}
   */
  tryConsume() {
    const now = Date.now()
    const cutoff = now - this.windowMs
    const recent = this._read().filter((t) => t > cutoff)

    if (recent.length >= this.max) {
      const oldest = Math.min(...recent)
      return {
        allowed: false,
        remaining: 0,
        retryIn: Math.ceil((oldest + this.windowMs - now) / 1000)
      }
    }

    recent.push(now)
    this._write(recent)
    return { allowed: true, remaining: this.max - recent.length, retryIn: 0 }
  }

  /** Reset counter (mis. setelah berhasil submit). */
  reset() {
    this._write([])
  }
}

// Limiter siap pakai
export const donationLimiter = new RateLimiter({
  key: 'donation',
  max: 5,
  windowMs: 60_000 // maks 5 donasi / menit
})

export const refreshLimiter = new RateLimiter({
  key: 'refresh',
  max: 12,
  windowMs: 60_000 // maks 12 refresh manual / menit
})

export default RateLimiter
