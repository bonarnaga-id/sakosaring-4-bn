import React from 'react'
import { calculateISPU, getIspuCategory } from '../lib/ispu.js'
import { formatNumber, formatRelativeTime } from '../lib/format.js'
import { APP_CONFIG } from '../lib/constants.js'

/**
 * Hero.jsx — Bagian utama: ISPU besar + status + info lokasi.
 */
export default function Hero({ station, ispu, loading = false, onRefresh }) {
  if (loading || !station) {
    return (
      <section className="card overflow-hidden">
        <div className="skeleton h-2 w-full rounded-none" />
        <div className="p-6">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton mt-4 h-16 w-32" />
          <div className="skeleton mt-4 h-6 w-56" />
          <div className="mt-6 flex gap-3">
            <div className="skeleton h-10 w-32" />
            <div className="skeleton h-10 w-32" />
          </div>
        </div>
      </section>
    )
  }

  const cat = getIspuCategory(ispu)

  return (
    <section
      className="card relative overflow-hidden ring-1"
      style={{ '--tw-ring-color': cat.color + '26' }}
      aria-label="Indeks kualitas udara utama"
    >
      {/* Gradient background sesuai kategori */}
      <div
        className="absolute inset-0 opacity-[0.07] transition-colors duration-500"
        style={{
          background: `radial-gradient(120% 120% at 85% 0%, ${cat.color} 0%, transparent 60%)`
        }}
        aria-hidden="true"
      />

      <div className="relative p-6 sm:p-8">
        {/* Lokasi */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {APP_CONFIG.region.kecamatan}, {APP_CONFIG.region.kota}
          </span>
          <span className="text-slate-300">•</span>
          <span>{station.nama}</span>
        </div>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          {/* Angka ISPU utama */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Indeks Standar Pencemar Udara (ISPU)
            </p>
            <div className="mt-1 flex items-end gap-3">
              <span
                className="text-6xl font-extrabold leading-none tabular-nums sm:text-7xl"
                style={{ color: cat.color }}
              >
                {formatNumber(ispu, 0)}
              </span>
              <span
                className="badge mb-2 self-end text-white"
                style={{ backgroundColor: cat.color }}
              >
                {cat.label}
              </span>
            </div>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              {cat.description}
            </p>
          </div>

          {/* Aksi cepat */}
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="btn-ghost"
              aria-label="Perbarui data kualitas udara"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <path d="M21 3v6h-6" />
              </svg>
              Perbarui
            </button>
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <Meta label="Suhu" value={`${formatNumber(station.temperature, 1)}°C`} />
          <Meta label="Kelembapan" value={`${formatNumber(station.humidity, 0)}%`} />
          <Meta
            label="Status Udara"
            value={station.status || cat.label}
          />
          <Meta
            label="Terakhir Dibaca"
            value={formatRelativeTime(station.dibacaPada)}
          />
        </div>
      </div>
    </section>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900">{value}</p>
    </div>
  )
}
