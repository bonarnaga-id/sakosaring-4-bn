import React from 'react'
import { POLLUTANTS } from '../lib/constants.js'
import { calculateSubIndex, getIspuCategory } from '../lib/ispu.js'
import { formatNumber } from '../lib/format.js'

/**
 * PollutantCard.jsx — Kartu satu polutan (PM2.5, PM10, CO, SO₂).
 *
 * Color-coded: hijau (baik) / kuning (sedang) / oranye-merah (tidak sehat).
 */
export default function PollutantCard({ pollutantKey, value, loading = false }) {
  const meta = POLLUTANTS.find((p) => p.key === pollutantKey)
  if (!meta) return null

  // Loading skeleton
  if (loading) {
    return (
      <div className="card p-4">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton mt-3 h-8 w-20" />
        <div className="skeleton mt-3 h-3 w-full" />
      </div>
    )
  }

  const subIndex = calculateSubIndex(value, pollutantKey)
  const cat = getIspuCategory(subIndex)

  return (
    <div
      className={`card card-hover relative overflow-hidden p-4 ring-1 ${cat.ring}`}
      title={meta.description}
    >
      {/* Bar warna di tepi atas */}
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: cat.color }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-900">{meta.name}</p>
          <p className="text-[11px] text-slate-500">{meta.fullName}</p>
        </div>
        <span
          className="badge shrink-0 text-white"
          style={{ backgroundColor: cat.color }}
        >
          {cat.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-extrabold tabular-nums text-slate-900">
          {formatNumber(value, value < 100 ? 1 : 0)}
        </span>
        <span className="text-xs font-medium text-slate-500">{meta.unit}</span>
      </div>

      {/* Progress bar sub-indeks (0-500) */}
      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (subIndex / 500) * 100)}%`,
              backgroundColor: cat.color
            }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Sub-indeks ISPU: <span className="font-semibold">{subIndex}</span>
        </p>
      </div>
    </div>
  )
}
