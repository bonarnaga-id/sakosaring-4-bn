/**
 * lib/format.js — Utilitas format Indonesia (locale id-ID).
 */

/**
 * Format angka biasa (mis. 42 → "42", 1234 → "1.234").
 */
export function formatNumber(value, decimals = 0) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(n)
}

/**
 * Format rupiah (mis. 6000 → "Rp6.000").
 */
export function formatRupiah(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 'Rp0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n)
}

/**
 * Format waktu relatif (mis. "2 menit yang lalu").
 */
export function formatRelativeTime(isoDate) {
  if (!isoDate) return 'baru saja'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'baru saja'

  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)

  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute')
  if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, 'hour')
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format tanggal & waktu lengka (id-ID).
 */
export function formatDateTime(isoDate) {
  if (!isoDate) return '-'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  })
}

/**
 * Format jam saja (untuk label grafik).
 */
export function formatHour(isoDate) {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  })
}

export default { formatNumber, formatRupiah, formatRelativeTime, formatDateTime, formatHour }
