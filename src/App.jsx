import React, { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import DownloadSection from './components/DownloadSection.jsx'
import Documentation from './components/Documentation.jsx'
import Footer from './components/Footer.jsx'
import FloatingWidget from './components/FloatingWidget.jsx'
import { fetchAirQuality } from './lib/apiClient.js'
import { refreshLimiter } from './lib/rateLimiter.js'
import { APP_CONFIG } from './lib/constants.js'

/**
 * App.jsx — Root SakoSaring.
 *
 * Tanggung jawab:
 *  - Mengambil data kualitas udara dari API serverless /api/udara
 *    (sumber real: CAMS via Open-Meteo + BMKG)
 *  - Auto-refresh berkala
 *  - State global: daftar stasiun & stasiun aktif
 *  - Menyusun layout: Header → Dashboard → Download → Dokumentasi → Footer
 *    + FloatingWidget (Trakteer) di kanan bawah.
 */
export default function App() {
  const [stations, setStations] = useState([])
  const [activeStationId, setActiveStationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [meta, setMeta] = useState(null)
  const [isLive, setIsLive] = useState(true)

  const intervalRef = useRef(null)

  // -----------------------------------------------------
  // Mengambil data dari API serverless
  // -----------------------------------------------------
  const loadData = useCallback(async (isManual = false) => {
    // Rate-limiting mock untuk refresh manual
    if (isManual) {
      const rl = refreshLimiter.tryConsume()
      if (!rl.allowed) {
        setError(`Refresh terlalu sering. Coba lagi dalam ${rl.retryIn} detik.`)
        return
      }
    }

    try {
      setError(null)
      const data = await fetchAirQuality()
      if (data?.stations?.length) {
        setStations(data.stations)
        setMeta(data.meta ?? null)
        setLastUpdated(new Date().toISOString())
        // Pertahankan pilihan user, atau pilih stasiun pertama
        setActiveStationId((prev) => prev ?? data.stations[0].id)
      } else {
        throw new Error('Respons API tidak berisi data stasiun')
      }
    } catch (err) {
      console.error('[SakoSaring] Gagal memuat data:', err)
      setError(
        'Gagal memuat data kualitas udara. Layanan CAMS (Open-Meteo) atau ' +
          'BMKG sedang tidak dapat dijangkau. Coba lagi beberapa saat.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // -----------------------------------------------------
  // Initial load + auto-refresh
  // -----------------------------------------------------
  useEffect(() => {
    loadData()

    intervalRef.current = setInterval(() => {
      loadData()
    }, APP_CONFIG.refreshIntervalMs)

    return () => clearInterval(intervalRef.current)
  }, [loadData])

  // -----------------------------------------------------
  // Handler: ganti stasiun
  // -----------------------------------------------------
  const handleSelectStation = useCallback((id) => {
    setActiveStationId(id)
  }, [])

  // -----------------------------------------------------
  // Handler: refresh manual
  // -----------------------------------------------------
  const handleRefresh = useCallback(() => {
    loadData(true)
  }, [loadData])

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header isLive={isLive} lastUpdated={lastUpdated} />

      {/* Banner status (error / mode demo) */}
      {error && (
        <div
          role="alert"
          className="container-app mt-4"
        >
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="text-base" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <p className="font-bold">Data sementara tidak tersedia</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}

      {meta?.catatan && !error && (
        <div className="container-app mt-4">
          <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            <span className="text-base" aria-hidden="true">
              ℹ️
            </span>
            <div>
              <p className="font-bold">Sumber & keterbatasan data</p>
              <p className="mt-0.5 text-xs leading-relaxed">{meta.catatan}</p>
              {meta.sumber && (
                <p className="mt-1.5 text-xs">
                  Polutan: <strong>{meta.sumber.polutan}</strong> • Cuaca:{' '}
                  <strong>{meta.sumber.cuaca}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === Dashboard utama === */}
      <Dashboard
        stations={stations}
        activeStationId={activeStationId}
        onSelectStation={handleSelectStation}
        loading={loading}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        meta={meta}
      />

      {/* === Download source code === */}
      <DownloadSection />

      {/* === Dokumentasi === */}
      <Documentation />

      {/* === Footer === */}
      <Footer />

      {/* === Widget Trakteer mengambang === */}
      <FloatingWidget />
    </div>
  )
}
