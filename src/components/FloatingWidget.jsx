import React, { useState, useEffect, useCallback, useRef } from 'react'
import { DONATION_PRESETS, DONATION_LABELS, APP_CONFIG } from '../lib/constants.js'
import { formatRupiah } from '../lib/format.js'
import { sanitizeInput, sanitizeMessage, sanitizeLive } from '../lib/security.js'
import { donationLimiter } from '../lib/rateLimiter.js'
import { saveDonation } from '../lib/neonClient.js'
import QRCode from 'qrcode'

/**
 * FloatingWidget.jsx — Tombol mengambang & modal donasi Trakteer.
 * ------------------------------------------------------------------
 *  - Fixed di kanan bawah.
 *  - Klik → membuka OVERLAY MODAL (tidak navigasi/redirect).
 *  - Preset donasi mulai Rp6.000 + kelipatannya.
 *  - Container QR/QRIS berubah dinamis sesuai nominal terpilih.
 *  - Tombol close yang halus (animasi slide-up + fade).
 * ------------------------------------------------------------------
 */

export default function FloatingWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(DONATION_PRESETS[0])
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const [donorName, setDonorName] = useState('')
  const [donorMessage, setDonorMessage] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)
  const openButtonRef = useRef(null)

  // --- Generate QR code dinamis setiap nominal berubah ---
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setQrLoading(true)

    // Payload QRIS-ish (demo). Produksi: generate QRIS dari processor
    // pembayaran Anda (mis. Tripay/Midtrans/Trakteer API) lalu set ke state.
    const payload = buildQrisPayload(amount, APP_CONFIG.name)

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' }
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url)
          setStatus({ type: 'idle', message: '' })
        }
      })
      .catch(() => {
        if (!cancelled) setStatus({ type: 'error', message: 'Gagal membuat QR. Coba lagi.' })
      })
      .finally(() => {
        if (!cancelled) setQrLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, amount])

  // --- Aksesibilitas: trap focus + Esc + lock scroll body ---
  useEffect(() => {
    if (!isOpen) return

    const prevActive = document.activeElement
    document.body.style.overflow = 'hidden'

    // Fokus ke tombol close saat modal terbuka
    closeButtonRef.current?.focus()

    const handleKeyDown = (e) => {
      // Esc → tutup
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }

      // Tab → trap di dalam modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      // Kembalikan fokus ke pemicu (a11y)
      prevActive?.focus?.()
    }
  }, [isOpen])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setStatus({ type: 'idle', message: '' })
  }, [])

  // --- Submit donasi (dengan rate-limit & sanitasi) ---
  const handleDonate = useCallback(
    async (e) => {
      e.preventDefault()

      // 1. Rate-limiting mock
      const rl = donationLimiter.tryConsume()
      if (!rl.allowed) {
        setStatus({
          type: 'error',
          message: `Terlalu banyak percobaan. Coba lagi dalam ${rl.retryIn} detik.`
        })
        return
      }

      // 2. Sanitasi input (XSS prevention)
      const cleanName = sanitizeInput(donorName, 60)
      if (!cleanName) {
        setStatus({ type: 'error', message: 'Isi nama Anda dulu ya 😊' })
        return
      }

      setIsSubmitting(true)
      setStatus({ type: 'idle', message: '' })

      try {
        // 3. Simpan ke Neon (atau demo)
        await saveDonation({
          nama: cleanName,
          jumlah: amount,
          pesan: sanitizeMessage(donorMessage, 160)
        })

        setStatus({
          type: 'success',
          message: `Terima kasih ${cleanName.split(' ')[0]}! Donasi ${formatRupiah(
            amount
          )} kamu sangat membantu server tetap jalan. 🙏`
        })
        setDonorMessage('')
      } catch (err) {
        setStatus({
          type: 'error',
          message: err?.message || 'Gagal memproses donasi. Silakan coba lagi.'
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [amount, donorName, donorMessage]
  )

  return (
    <>
      {/* ====================================================
          TOMBOL MENGAMBANG (fixed, kanan bawah)
          ==================================================== */}
      <div className="fixed bottom-4 right-4 z-40 pb-safe sm:bottom-6 sm:right-6">
        <button
          ref={openButtonRef}
          type="button"
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="trakteer-modal"
          className="group flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-left text-white shadow-xl shadow-orange-600/30 ring-1 ring-white/20 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl active:scale-95"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20 text-base">
            ☕
          </span>
          <span className="text-sm font-bold leading-tight">
            Web app ini gratis &amp; bebas iklan.
            <span className="block text-[11px] font-medium opacity-90">
              Kopi kecil, server tetap jalan
            </span>
          </span>
        </button>
      </div>

      {/* ====================================================
          OVERLAY MODAL (in-app, tanpa redirect)
          ==================================================== */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
          onClick={handleClose} // klik backdrop → tutup
          role="presentation"
        >
          <div
            id="trakteer-modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trakteer-title"
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up sm:rounded-3xl"
          >
            {/* === Header === */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4 text-white">
              <span className="text-2xl" aria-hidden="true">
                ☕
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="trakteer-title"
                  className="truncate text-base font-extrabold"
                >
                  Dukung SakoSaring
                </h2>
                <p className="truncate text-[11px] opacity-90">
                  Web app ini gratis &amp; bebas iklan
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                aria-label="Tutup modal donasi"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* === Body (scrollable) === */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Pilihan nominal */}
              <fieldset>
                <legend className="mb-2 text-sm font-bold text-slate-900">
                  Pilih nominal donasi
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DONATION_PRESETS.map((preset) => {
                    const isActive = preset === amount
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        aria-pressed={isActive}
                        className={`rounded-xl border px-2 py-2.5 text-center transition-all duration-150 active:scale-95 ${
                          isActive
                            ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                            : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
                        }`}
                      >
                        <span
                          className={`block text-sm font-extrabold tabular-nums ${
                            isActive ? 'text-orange-700' : 'text-slate-900'
                          }`}
                        >
                          {formatRupiah(preset)}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-slate-500">
                          {DONATION_LABELS[preset]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              {/* Container QR / QRIS dinamis */}
              <div className="mt-5">
                <p className="mb-2 text-sm font-bold text-slate-900">
                  Scan QRIS untuk donasi{' '}
                  <span className="text-orange-600">{formatRupiah(amount)}</span>
                </p>
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="relative grid h-56 w-56 place-items-center overflow-hidden rounded-xl bg-white p-2 shadow-inner">
                    {qrLoading ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" />
                        <span className="text-[11px]">Membuat QR…</span>
                      </div>
                    ) : (
                      <img
                        src={qrDataUrl}
                        alt={`QRIS donasi ${formatRupiah(amount)} untuk SakoSaring`}
                        className="h-full w-full object-contain"
                        width={224}
                        height={224}
                        loading="eager"
                      />
                    )}
                  </div>
                  <p className="text-center text-[11px] leading-relaxed text-slate-500">
                    Scan dengan aplikasi e-wallet apa pun (GoPay, OVO, DANA,
                    ShopeePay) atau mobile banking.
                  </p>
                </div>
              </div>

              {/* Form donatur */}
              <form onSubmit={handleDonate} className="mt-5 space-y-3">
                <div>
                  <label
                    htmlFor="donor-name"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Nama <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="donor-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={donorName}
                    onChange={(e) => setDonorName(sanitizeLive(e.target.value, 60))}
                    maxLength={60}
                    placeholder="Nama kamu"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="donor-message"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Pesan <span className="font-normal text-slate-400">(opsional)</span>
                  </label>
                  <textarea
                    id="donor-message"
                    name="message"
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(sanitizeLive(e.target.value, 160))}
                    maxLength={160}
                    rows={2}
                    placeholder="Semangat untuk SakoSaring!"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || qrLoading}
                  className="btn w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/25 hover:from-amber-600 hover:to-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Memproses…
                    </>
                  ) : (
                    <>☕ Donasi {formatRupiah(amount)}</>
                  )}
                </button>
              </form>

              {/* Status feedback */}
              {status.message && (
                <div
                  role="status"
                  className={`mt-3 rounded-xl px-4 py-3 text-sm font-medium animate-bounce-in ${
                    status.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                  }`}
                >
                  {status.message}
                </div>
              )}
            </div>

            {/* === Footer modal === */}
            <div className="border-t border-slate-100 bg-white px-5 py-3">
              <p className="text-center text-[11px] leading-relaxed text-slate-400">
                Donasi 100% sukarela untuk biaya server &amp; pengembangan.
                <br />
                Terima kasih sudah menjaga udara Sako tetap terpantau. 🌿
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Membangun payload QRIS (versi demo/statis).
 *
 * !!! CATATAN PRODUKSI !!!
 * Ini BUKAN QRIS resmi yang bisa dibayar. Untuk donasi nyata, gunakan:
 *  1. Trakteer API / link pembayaran, ATAU
 *  2. Payment processor (Tripay, Midtrans, Xendit) untuk generate
 *     QRIS dynamic per transaksi, ATAU
 *  3. QRIS statis merchant Anda (cukup ganti string di bawah).
 */
function buildQrisPayload(amount, merchantName) {
  // Contoh format QRIS static (ganti dengan QRIS merchant Anda di produksi)
  const staticQris =
    '00020101021226' +
    'BP17...SAKOSARING...' + // placeholder merchant
    '5204599953033605802ID5911SAKOSARING6007JAKARTA61051234062270523' +
    String(amount).padStart(8, '0') +
    '6304'

  return staticQris
}
