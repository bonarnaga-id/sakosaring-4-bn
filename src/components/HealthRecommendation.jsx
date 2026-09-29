import React from 'react'
import { getHealthRecommendation } from '../lib/ispu.js'

/**
 * HealthRecommendation.jsx — Saran kesehatan cerdas, bahasa awam & langsung.
 *
 * Berubah otomatis sesuai kategori ISPU: hijau → kuning → merah.
 */
export default function HealthRecommendation({ ispu, loading = false }) {
  if (loading) {
    return (
      <div
        className="card overflow-hidden"
        role="region"
        aria-label="Rekomendasi kesehatan"
      >
        <div className="h-2 w-full bg-slate-200" />
        <div className="p-5">
          <div className="skeleton h-5 w-48" />
          <div className="mt-4 space-y-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-11/12" />
            <div className="skeleton h-3 w-4/5" />
          </div>
        </div>
      </div>
    )
  }

  const rec = getHealthRecommendation(ispu)
  const cat = rec.category

  return (
    <div
      className="card overflow-hidden ring-1 ring-inset"
      style={{ '--tw-ring-color': cat.color + '33' }}
      role="region"
      aria-label="Rekomendasi kesehatan"
    >
      {/* Header berwarna sesuai status */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 text-white"
        style={{ backgroundColor: cat.color }}
      >
        <span className="text-xl" aria-hidden="true">
          {cat.key === 'good'
            ? '😊'
            : cat.key === 'moderate'
            ? '🙂'
            : cat.key === 'unhealthy'
            ? '😷'
            : cat.key === 'veryUnhealthy'
            ? '🤒'
            : '🚨'}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide opacity-90">
            Rekomendasi Kesehatan
          </p>
          <h3 className="truncate text-base font-extrabold">{rec.title}</h3>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
          ISPU {Math.round(ispu)}
        </span>
      </div>

      {/* Daftar saran */}
      <div className="p-5">
        <p className="mb-3 text-xs text-slate-500">{rec.base}</p>
        <ul className="space-y-2.5">
          {rec.advice.map((tip, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-sm leading-relaxed text-slate-700"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
                aria-hidden="true"
              />
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 border-t border-dashed border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-400">
          ℹ️ Saran bersifat umum. Jika Anda memiliki kondisi kesehatan
          (asma, ISPA, jantung), konsultasikan dengan dokter. Sumber acuan:
          Kementerian Kesehatan &amp; KLHK.
        </p>
      </div>
    </div>
  )
}
