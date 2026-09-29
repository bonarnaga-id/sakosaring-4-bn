import React, { useMemo } from 'react'
import Hero from './Hero.jsx'
import StationSelector from './StationSelector.jsx'
import PollutantCard from './PollutantCard.jsx'
import ComfortCard from './ComfortCard.jsx'
import HealthRecommendation from './HealthRecommendation.jsx'
import { calculateISPU } from '../lib/ispu.js'

/**
 * Dashboard.jsx — Bagian utama: pemantauan ISPU real-time Sako.
 *
 * Props:
 *  - stations: array data stasiun dari neonClient.fetchAirQuality()
 *  - activeStationId, onSelectStation
 *  - loading, lastUpdated, onRefresh
 */
export default function Dashboard({
  stations = [],
  activeStationId,
  onSelectStation,
  loading = false,
  lastUpdated = null,
  onRefresh
}) {
  // Stasiun aktif (fallback ke stasiun pertama)
  const station = useMemo(
    () =>
      stations.find((s) => s.id === activeStationId) ?? stations[0] ?? null,
    [stations, activeStationId]
  )

  // ISPU gabungan dari sub-indeks tertinggi
  const ispu = useMemo(
    () =>
      station
        ? calculateISPU({
            pm25: station.pm25,
            pm10: station.pm10,
            so2: station.so2,
            co: station.co
          })
        : 0,
    [station]
  )

  return (
    <main id="dashboard" className="container-app py-6 sm:py-8">
      {/* Pemilih stasiun */}
      <StationSelector
        stations={stations}
        activeId={station?.id}
        onSelect={onSelectStation}
        lastUpdated={lastUpdated}
      />

      {/* Hero ISPU */}
      <div className="mt-5">
        <Hero station={station} ispu={ispu} loading={loading} onRefresh={onRefresh} />
      </div>

      {/* Grid: rekomendasi (kiri/utama) + kartu parameter */}
      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <HealthRecommendation ispu={ispu} loading={loading} />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Parameter Pencemar Udara
            </h2>
            <span className="text-[11px] text-slate-500">Real-time</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <PollutantCard pollutantKey="pm25" value={station?.pm25} loading={loading} />
            <PollutantCard pollutantKey="pm10" value={station?.pm10} loading={loading} />
            <PollutantCard pollutantKey="co" value={station?.co} loading={loading} />
            <PollutantCard pollutantKey="so2" value={station?.so2} loading={loading} />
            <div className="col-span-2">
              <ComfortCard
                temperature={station?.temperature}
                humidity={station?.humidity}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
