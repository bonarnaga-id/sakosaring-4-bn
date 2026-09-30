/**
 * lib/apiClient.js
 * ------------------------------------------------------------------
 * SakoSaring — Client untuk API serverless (/api/udara).
 *
 * Mengganti koneksi Neon langsung dari browser. Dengan ini:
 *  - Connection string Neon TIDAK lagi diekspos ke browser.
 *  - Data kualitas udara berasal dari sumber real (CAMS + BMKG).
 *
 * Fallback: jika endpoint /api/udara tidak tersedia (mis. saat
 * `npm run dev` tanpa server Vercel), client memanggil sumber
 * publik (Open-Meteo + BMKG) langsung — kedua-duanya mengizinkan CORS.
 * ------------------------------------------------------------------
 */

import { APP_CONFIG } from './constants.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const ENDPOINT = `${API_BASE}/api/udara`

/** Timeout request (ms). */
const TIMEOUT_MS = 10_000

/**
 * Fetch JSON dengan timeout & error yang jelas.
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchJson(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} dari ${url}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Mengambil data kualitas udara terbaru untuk Kecamatan Sako.
 *
 * @returns {Promise<{
 *   stations: Array<Object>,
 *   meta: Object,
 *   perbandingan: Object
 * }>}
 */
export async function fetchAirQuality() {
  try {
    return await fetchJson(ENDPOINT)
  } catch (err) {
    // Fallback: panggil sumber publik langsung (CORS diizinkan).
    return fetchFallback()
  }
}

// ------------------------------------------------------------------
// Fallback langsung (dipakai jika /api/udara tidak tersedia)
// ------------------------------------------------------------------

const KELURAHAN_SAKO = [
  { id: 'sako', kelurahan: 'Sako', adm4: '16.71.08.1002' },
  { id: 'sako-baru', kelurahan: 'Sako Baru', adm4: '16.71.08.1007' },
  { id: 'sialang', kelurahan: 'Sialang', adm4: '16.71.08.1006' },
  { id: 'sukamaju', kelurahan: 'Sukamaju', adm4: '16.71.08.1001' }
]

const CENTROID = { lat: -2.92919536, lng: 104.78056115 }

async function fetchFallback() {
  const aqUrl =
    'https://air-quality-api.open-meteo.com/v1/air-quality' +
    `?latitude=${CENTROID.lat}&longitude=${CENTROID.lng}` +
    '&current=pm10,pm2_5,carbon_monoxide,sulphur_dioxide,nitrogen_dioxide,ozone' +
    '&timezone=Asia%2FJakarta'

  const [aq, ...cuaca] = await Promise.all(
    [fetchJson(aqUrl)].concat(
      KELURAHAN_SAKO.map((k) =>
        fetchJson(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${k.adm4}`)
      )
    )
  )

  const cur = aq?.current
  if (!cur) throw new Error('Data polutan tidak tersedia dari Open-Meteo')

  const stations = KELURAHAN_SAKO.map((k, i) => {
    const hari = cuaca[i]?.data?.[0]?.cuaca?.[0]
    const entry = Array.isArray(hari) ? hari[0] : null

    return {
      id: k.id,
      nama: k.kelurahan,
      kelurahan: k.kelurahan,
      lokasi: `Kelurahan ${k.kelurahan}, Kecamatan Sako, Kota Palembang`,
      adm4: k.adm4,
      pm25: cur.pm2_5 ?? null,
      pm10: cur.pm10 ?? null,
      co: cur.carbon_monoxide ?? null,
      so2: cur.sulphur_dioxide ?? null,
      no2: cur.nitrogen_dioxide ?? null,
      o3: cur.ozone ?? null,
      temperature: entry?.t != null ? Number(entry.t) : null,
      humidity: entry?.hu != null ? Number(entry.hu) : null,
      cuaca: entry?.weather_desc ?? null,
      anginKecepatan: entry?.ws != null ? Number(entry.ws) : null,
      anginArah: entry?.wd ?? null,
      dibacaPada: new Date().toISOString(),
      sumberPolutan: 'CAMS via Open-Meteo',
      sumberCuaca: 'BMKG'
    }
  })

  return {
    stations,
    meta: {
      kecamatan: 'Sako',
      kota: 'Palembang',
      provinsi: 'Sumatera Selatan',
      diambilPada: new Date().toISOString(),
      sumber: {
        polutan: 'CAMS (Copernicus Atmosphere Monitoring Service) via Open-Meteo',
        cuaca: 'BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)'
      },
      catatan:
        'Mode fallback: data diambil langsung dari sumber publik. Tidak ada stasiun ' +
        'ISPU fisik di Kecamatan Sako; nilai polutan adalah data model CAMS (grid ~45 km).'
    },
    perbandingan: null
  }
}

export default { fetchAirQuality }
