import React, { useState } from 'react'
import { DOC_SECTIONS } from '../lib/docs.js'

/**
 * Documentation.jsx — Dokumentasi ringkas dalam app (Bahasa Indonesia).
 * Akordion mobile-first, satu bagian terbuka pada satu waktu.
 */
export default function Documentation() {
  const [openId, setOpenId] = useState(DOC_SECTIONS[0]?.id)

  return (
    <section
      id="dokumentasi"
      className="container-app py-10 sm:py-14"
      aria-labelledby="docs-title"
    >
      <div className="mb-6 text-center">
        <span className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-200">
          📚 Dokumentasi
        </span>
        <h2
          id="docs-title"
          className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl"
        >
          Cara Pakai &amp; Panduan Lengkap
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
          Semua yang perlu Anda ketahui tentang SakoSaring — dari memahami ISPU
          hingga instalasi mandiri.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {DOC_SECTIONS.map((section) => {
          const isOpen = openId === section.id
          return (
            <div key={section.id} className="card overflow-hidden">
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : section.id)}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${section.id}`}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="text-lg" aria-hidden="true">
                    {section.icon}
                  </span>
                  <span className="flex-1 text-sm font-bold text-slate-900">
                    {section.title}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </h3>

              {isOpen && (
                <div
                  id={`panel-${section.id}`}
                  className="border-t border-slate-100 px-5 py-4 animate-fade-in"
                >
                  {/* Paragraf */}
                  {section.body?.map((p, i) => (
                    <p
                      key={i}
                      className="mb-3 text-sm leading-relaxed text-slate-600 last:mb-0"
                    >
                      {p}
                    </p>
                  ))}

                  {/* Langkah-langkah */}
                  {section.steps && (
                    <ol className="space-y-2.5">
                      {section.steps.map((step, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm leading-relaxed text-slate-600"
                        >
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Blok kode */}
                  {section.code && (
                    <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-[12px] leading-relaxed text-slate-100">
                      <code>{section.code}</code>
                    </pre>
                  )}

                  {/* Daftar file */}
                  {section.files && (
                    <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                      {section.files.map(([file, desc]) => (
                        <li
                          key={file}
                          className="flex flex-col gap-0.5 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:gap-3"
                        >
                          <code className="shrink-0 rounded bg-brand-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-700 sm:w-56">
                            {file}
                          </code>
                          <span className="text-xs text-slate-600">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* FAQ */}
                  {section.faqs && (
                    <div className="space-y-3">
                      {section.faqs.map(([q, a], i) => (
                        <div key={i}>
                          <p className="text-sm font-bold text-slate-900">
                            {q}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {a}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
