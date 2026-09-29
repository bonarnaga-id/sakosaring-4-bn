import React, { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import DownloadSection from './components/DownloadSection.jsx'
import Documentation from './components/Documentation.jsx'
import Footer from './components/Footer.jsx'
import FloatingWidget from './components/FloatingWidget.jsx'
import { fetchAirQuality, IS_DEMO_MODE } from './lib/neonClient.js'
import { refreshLimiter } from './lib/rateLimiter.js'
import { APP_CONFIG } from './lib/constants.js'

/**
 * App.jsx — Root SakoSaring.
 *
 * Tanggung jawab:
 *  - Mengambil data kualitas udara dari Neon (via lib/neonClient.js)
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
  const [isLive, setIsLive] = useState(!IS_DEMO_MODE)

  const intervalRef = useRef(null)

  // -----------------------------------------------------
  // Mengambil data dari Neon
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
      if (data?.length) {
        setStations(data)
        setLastUpdated(new Date().toISOString())
        // Pertahankan pilihan user, atau pilih stasiun pertama
        setActiveStationId((prev) => prev ?? data[0].id)
      }
    } catch (err) {
      console.error('[SakoSaring] Gagal memuat data:', err)
      setError(
        'Gagal memuat data kualitas udara. Periksa koneksi database Neon Anda.'
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

      {IS_DEMO_MODE && !error && (
        <div className="container-app mt-4">
          <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <span className="text-base" aria-hidden="true">
              💡
            </span>
            <div>
              <p className="font-bold">Mode Demo</p>
              <p className="mt-0.5 text-xs">
                Koneksi Neon belum dikonfigurasi. Menampilkan data contoh.
                Set <code className="font-mono">VITE_NEON_CONNECTION_STRING</code> di{' '}
                <code className="font-mono">.env</code> untuk data nyata.
              </p>
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
