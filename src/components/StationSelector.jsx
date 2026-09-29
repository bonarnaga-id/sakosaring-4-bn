import React from 'react'
import { getIspuCategory } from '../lib/ispu.js'
import { formatRelativeTime } from '../lib/format.js'

/**
 * StationSelector.jsx — Pemilih stasiun pemantauan (mobile-first chips).
 */
export default function StationSelector({
  stations = [],
  activeId,
  onSelect,
  lastUpdated = null
}) {
  if (!stations.length) {
    return (
      <div className="card p-4">
        <div className="skeleton h-4 w-32" />
        <div className="mt-3 flex gap-2 overflow-hidden">
          <div className="skeleton h-9 w-28 shrink-0" />
          <div className="skeleton h-9 w-28 shrink-0" />
          <div className="skeleton h-9 w-28 shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <section aria-label="Pilih stasiun pemantauan">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900">Stasiun Pemantauan</h2>
        {lastUpdated && (
          <p className="text-[11px] text-slate-500">
            Diperbarui {formatRelativeTime(lastUpdated)}
          </p>
        )}
      </div>

      <div
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        role="tablist"
        aria-label="Daftar stasiun"
      >
        {stations.map((s) => {
          const isActive = s.id === activeId
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(s.id)}
              className={`shrink-0 rounded-xl border px-4 py-2.5 text-left transition-all duration-150 active:scale-[0.97] ${
                isActive
                  ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              <span className="block text-sm font-bold">{s.nama}</span>
              <span
                className={`block text-[11px] ${
                  isActive ? 'text-brand-100' : 'text-slate-500'
                }`}
              >
                {s.lokasi?.split(',')[0] || 'Sako, Palembang'}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
