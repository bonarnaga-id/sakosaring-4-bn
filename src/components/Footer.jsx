import React from 'react'
import { APP_CONFIG } from '../lib/constants.js'

/**
 * Footer.jsx — Footer SakoSaring.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      id="footer"
      className="border-t border-slate-200 bg-white pb-safe"
    >
      <div className="container-app py-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-900">
              <svg viewBox="0 0 100 100" className="h-5 w-5" aria-hidden="true">
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
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                {APP_CONFIG.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {APP_CONFIG.region.kecamatan}, {APP_CONFIG.region.kota},{' '}
                {APP_CONFIG.region.provinsi}
              </p>
            </div>
          </div>

          {/* Tautan cepat */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
            <a href="#dashboard" className="transition-colors hover:text-brand-700">
              Dashboard
            </a>
            <a href="#dokumentasi" className="transition-colors hover:text-brand-700">
              Dokumentasi
            </a>
            <a href="#download" className="transition-colors hover:text-brand-700">
              Download
            </a>
            <a
              href={APP_CONFIG.trakteerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-orange-600"
            >
              Donasi
            </a>
          </nav>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          <p className="text-xs text-slate-500">
            Open Source oleh {APP_CONFIG.author} - {year}
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Data bersifat indikatif. Konsultasikan kondisi kesehatan dengan
            tenaga medis profesional.
          </p>
        </div>
      </div>
    </footer>
  )
}
