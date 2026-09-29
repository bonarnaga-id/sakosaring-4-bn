import React from 'react'
import { getIspuCategory } from '../lib/ispu.js'
import { calculateComfortIndex } from '../lib/ispu.js'
import { formatNumber } from '../lib/format.js'

/**
 * ComfortCard.jsx — Indeks kenyamanan (suhu + kelembapan + thermal).
 */
export default function ComfortCard({ temperature, humidity, loading = false }) {
  if (loading) {
    return (
      <div className="card p-4">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton mt-3 h-8 w-16" />
        <div className="skeleton mt-3 h-3 w-full" />
      </div>
    )
  }

  const comfort = calculateComfortIndex(temperature, humidity)

  return (
    <div className="card card-hover p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-900">Indeks Kenyamanan</p>
          <p className="text-[11px] text-slate-500">Suhu &amp; Kelembapan</p>
        </div>
        <span
          className="badge shrink-0 text-white"
          style={{ backgroundColor: comfort.color }}
        >
          {comfort.label}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-4">
        <div>
          <p className="text-2xl font-extrabold tabular-nums text-slate-900">
            {formatNumber(temperature, 1)}°C
          </p>
          <p className="text-[11px] text-slate-500">
            Kelembapan {formatNumber(humidity, 0)}%
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-500">Terasa seperti</p>
          <p className="text-lg font-bold tabular-nums text-slate-700">
            {formatNumber(comfort.feelsLike, 1)}°C
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${comfort.value}%`,
              backgroundColor: comfort.color
            }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Skor kenyamanan:{' '}
          <span className="font-semibold">{comfort.value}/100</span>
        </p>
      </div>
    </div>
  )
}
