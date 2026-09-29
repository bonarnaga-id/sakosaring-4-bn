import React from 'react'
import { APP_CONFIG } from '../lib/constants.js'

/**
 * DownloadSection.jsx — CTA unduh source code + dokumentasi.
 */
export default function DownloadSection() {
  return (
    <section
      id="download"
      className="container-app py-10 sm:py-14"
      aria-labelledby="download-title"
    >
      <div className="card relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-6 text-white shadow-xl sm:p-10">
        {/* Dekorasi */}
        <div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="badge bg-white/15 text-white ring-1 ring-white/25">
              📦 Open Source
            </span>
            <h2
              id="download-title"
              className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl"
            >
              Download Source Code SakoSaring + Dokumentasi Lengkap
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-100">
              Dapatkan kode sumber lengkap (React + Vite + Tailwind + Neon
              PostgreSQL), skema database{' '}
              <code className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-xs">
                schema.sql
              </code>
              , dan panduan instalasi langkah demi langkah. Gratis, bebas
              iklan, siap di-deploy.
            </p>

            <ul className="mt-4 grid gap-1.5 text-sm text-brand-100">
              <li>✅ Frontend React.js + Vite + Tailwind CSS</li>
              <li>✅ Integrasi Neon PostgreSQL + skema siap pakai</li>
              <li>✅ Dokumentasi instalasi &amp; keamanan (README.md)</li>
              <li>✅ Lisensi open source — bebas modifikasi &amp; sebar</li>
            </ul>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
            <a
              href={APP_CONFIG.downloadUrl}
              className="btn w-full bg-white px-6 py-3.5 text-base text-brand-800 shadow-lg transition-transform hover:scale-[1.02] active:scale-95 sm:w-64"
              download
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              Download Source Code
            </a>
            <a
              href={APP_CONFIG.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full border border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur transition-colors hover:bg-white/20 sm:w-64"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.1 4.7 18.1 5 18.1 5c.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
              </svg>
              Lihat di GitHub
            </a>
            <p className="text-center text-[11px] text-brand-200">
              ~2 MB • ZIP • v1.0.0
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
