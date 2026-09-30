import React from 'react'
import { APP_CONFIG } from '../lib/constants.js'

/**
 * Header.jsx — Header & branding SakoSaring.
 *
 * Logo & domain adalah PLACEHOLDER yang mudah diganti:
 *  - Logo   : APP_CONFIG.logoUrl (lib/constants.js) atau ganti markup SVG di bawah
 *  - Domain : APP_CONFIG.domain  (lib/constants.js)
 */
export default function Header({ isLive = false, lastUpdated = null }) {
  const year = new Date().getFullYear()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-lg pt-safe">
      <div className="container-app flex h-16 items-center justify-between gap-3">
        {/* === Brand === */}
        <a href="#top" className="flex items-center gap-3 group" aria-label="SakoSaring beranda">
          {/* Logo placeholder — ganti dengan <img src={APP_CONFIG.logoUrl} /> saat siap */}
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 shadow-md shadow-brand-600/20 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 100 100"
              className="h-6 w-6"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M28 64c0-13 10-23 22-23s22 10 22 23"
                stroke="#93cffd"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="50" cy="32" r="10" fill="#22c55e" />
            </svg>
          </span>

          <span className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              {APP_CONFIG.name}
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-slate-500 sm:block">
              Kualitas Udara {APP_CONFIG.region.kecamatan}, {APP_CONFIG.region.kota}
            </span>
          </span>
        </a>

        {/* === Status & Domain === */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Domain placeholder — ganti APP_CONFIG.domain */}
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 md:inline-block">
            {APP_CONFIG.domain}
          </span>

          {/* Indikator live */}
          <span
            className={`badge ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
            title={isLive ? 'Data real-time dari CAMS (Open-Meteo) & BMKG' : 'Mode demo'}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? 'animate-pulse-soft bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            {isLive ? 'Live' : 'Demo'}
          </span>
        </div>
      </div>
    </header>
  )
}
