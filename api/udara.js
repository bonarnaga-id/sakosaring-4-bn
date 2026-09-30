/**
 * api/udara.js — Vercel Serverless Function
 * ------------------------------------------------------------------
 * SakoSaring — Sumber data kualitas udara REAL untuk Kecamatan Sako,
 * Kota Palembang, Sumatera Selatan.
 *
 * STRATEGI MULTI-SUMBER (jujur & dapat dipertanggungjawabkan):
 *
 *  1. POLUTAN (PM2.5, PM10, CO, SO2, NO2, O3)
 *     -> CAMS (Copernicus Atmosphere Monitoring Service) via Open-Meteo.
 *        Satu-satunya sumber data polutan gratis tanpa API key.
 *     -> CATATAN PENTING: resolusi grid CAMS ~45 km, sehingga SELURUH
 *        kelurahan di Sako jatuh pada SATU sel grid yang sama. Aplikasi
 *        TIDAK memalsukan nilai polutan berbeda per kelurahan. Nilai
 *        polutan ditampilkan satu kali untuk seluruh kecamatan dan
 *        dilabeli sebagai data model (bukan pengukuran stasiun lokal).
 *
 *  2. CUACA per-kelurahan (suhu, kelembapan, deskripsi, angin)
 *     -> BMKG (api.bmkg.go.id), data resmi per kelurahan (kode adm4).
 *        Ini benar-benar berbeda antar kelurahan.
 *
 *  3. PEMBANDING suhu & kelembapan
 *     -> Open-Meteo Forecast (model terpisah) sebagai pembanding BMKG,
 *        sesuai permintaan agar tidak bergantung pada satu sumber.
 *
 * Tidak ada stasiun ISPU fisik di Kecamatan Sako. Data polutan adalah
 * data model atmosfer (CAMS), bukan pengukuran langsung di Sako.
 * ------------------------------------------------------------------
 */

// 4 kelurahan resmi Kecamatan Sako (Kode Kemendagri 16.71.08).
// Koordinat diambil dari API BMKG (data resmi Kemendagri/BMKG).
const KELURAHAN_SAKO = [
  {
    id: 'sako',
    kelurahan: 'Sako',
    adm4: '16.71.08.1002',
    lat: -2.9196040124,
    lng: 104.7975917325
  },
  {
    id: 'sako-baru',
    kelurahan: 'Sako Baru',
    adm4: '16.71.08.1007',
    lat: -2.9137608458,
    lng: 104.7818141856
  },
  {
    id: 'sialang',
    kelurahan: 'Sialang',
    adm4: '16.71.08.1006',
    lat: -2.9321729153,
    lng: 104.7817484934
  },
  {
    id: 'sukamaju',
    kelurahan: 'Sukamaju',
    adm4: '16.71.08.1001',
    lat: -2.9217335958,
    lng: 104.7639304718
  }
]

// Pusat kecamatan (centroid) untuk query grid CAMS.
const CENTROID = { lat: -2.92919536, lng: 104.78056115 }

const OPEN_METEO_AQ_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const OPEN_METEO_FC_URL = 'https://api.open-meteo.com/v1/forecast'
const BMKG_URL = 'https://api.bmkg.go.id/publik/prakiraan-cuaca'

// ------------------------------------------------------------------
// Util
// ------------------------------------------------------------------

const round1 = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 10) / 10 : null)
const round2 = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 100) / 100 : null)

async function fetchJson(url, { timeoutMs = 8000 } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

// ------------------------------------------------------------------
// ISPU (KLHK) — versi ringkas untuk pengisian field `status`.
// Perhitungan ISPU lengkap ada di src/lib/ispu.js (dipakai UI).
// ------------------------------------------------------------------

const ISPU_BP = {
  pm25: [
    [0, 15.5, 0, 50],
    [15.5, 55.4, 51, 100],
    [55.4, 150.4, 101, 199],
    [150.4, 250.4, 200, 299],
    [250.4, 500, 300, 500]
  ],
  pm10: [
    [0, 50, 0, 50],
    [50, 150, 51, 100],
    [150, 350, 101, 199],
    [350, 420, 200, 299],
    [420, 600, 300, 500]
  ],
  so2: [
    [0, 52, 0, 50],
    [52, 130, 51, 100],
    [130, 550, 101, 199],
    [550, 800, 200, 299],
    [800, 1600, 300, 500]
  ],
  co: [
    [0, 4000, 0, 50],
    [4000, 10000, 51, 100],
    [10000, 17000, 101, 199],
    [17000, 34000, 200, 299],
    [34000, 50000, 300, 500]
  ]
}

function subIndex(c, pollutant) {
  if (typeof c !== 'number' || !Number.isFinite(c)) return null
  for (const [cLow, cHigh, iLow, iHigh] of ISPU_BP[pollutant] || []) {
    if (c >= cLow && c <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow)
    }
  }
  return null
}

function hitungISPU({ pm25, pm10, so2, co }) {
  const subs = [
    subIndex(pm25, 'pm25'),
    subIndex(pm10, 'pm10'),
    subIndex(so2, 'so2'),
    subIndex(co, 'co')
  ].filter((v) => v !== null)
  return subs.length ? Math.max(...subs) : null
}

function statusDariISPU(ispu) {
  if (ispu === null) return null
  if (ispu <= 50) return 'Baik'
  if (ispu <= 100) return 'Sedang'
  if (ispu <= 199) return 'Tidak Sehat'
  if (ispu <= 299) return 'Sangat Tidak Sehat'
  return 'Berbahaya'
}

// ------------------------------------------------------------------
// Sumber 1: CAMS via Open-Meteo (polutan)
// ------------------------------------------------------------------

async function fetchPolutan() {
  const url =
    `${OPEN_METEO_AQ_URL}?latitude=${CENTROID.lat}&longitude=${CENTROID.lng}` +
    `&current=pm10,pm2_5,carbon_monoxide,sulphur_dioxide,nitrogen_dioxide,ozone` +
    `&timezone=Asia%2FJakarta`
  const json = await fetchJson(url)
  const c = json?.current
  if (!c) throw new Error('Respons Open-Meteo tidak berisi data `current`')

  return {
    pm25: round1(c.pm2_5),
    pm10: round1(c.pm10),
    co: round1(c.carbon_monoxide),
    so2: round1(c.sulphur_dioxide),
    no2: round1(c.nitrogen_dioxide),
    o3: round1(c.ozone),
    waktuModel: c.time ?? null,
    grid: {
      latitude: json.latitude,
      longitude: json.longitude,
      elevasi: json.elevation ?? null
    }
  }
}

// ------------------------------------------------------------------
// Sumber 2: BMKG (cuaca per-kelurahan, resmi)
// ------------------------------------------------------------------

async function fetchCuacaBMKG(adm4) {
  const json = await fetchJson(`${BMKG_URL}?adm4=${adm4}`)
  // Struktur: data[0].cuaca = [ [entry_hari_ini, ...], [besok, ...], ... ]
  const hari = json?.data?.[0]?.cuaca?.[0]
  if (!Array.isArray(hari) || !hari.length) throw new Error('Struktur BMKG tidak terduga')

  // Ambil entry terkini yang masih relevan (local_datetime <= sekarang),
  // fallback ke entry pertama.
  const sekarang = Date.now()
  const entry =
    hari
      .filter((e) => e?.local_datetime && new Date(e.local_datetime.replace(' ', 'T')).getTime() <= sekarang)
      .pop() ?? hari[0]

  return {
    temperature: entry.t != null ? Number(entry.t) : null,
    humidity: entry.hu != null ? Number(entry.hu) : null,
    cuaca: entry.weather_desc ?? null,
    cuacaKode: entry.weather_code ?? null,
    anginKecepatan: entry.ws != null ? Number(entry.ws) : null,
    anginArah: entry.wd ?? null,
    waktuLokal: entry.local_datetime ?? null
  }
}

// ------------------------------------------------------------------
// Sumber 3 (pembanding): Open-Meteo Forecast (model)
// ------------------------------------------------------------------

async function fetchPembanding() {
  const url =
    `${OPEN_METEO_FC_URL}?latitude=${CENTROID.lat}&longitude=${CENTROID.lng}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code` +
    `&timezone=Asia%2FJakarta`
  const json = await fetchJson(url)
  const c = json?.current
  if (!c) throw new Error('Respons Open-Meteo Forecast tidak berisi data `current`')

  return {
    temperature: c.temperature_2m != null ? round1(c.temperature_2m) : null,
    humidity: c.relative_humidity_2m != null ? round1(c.relative_humidity_2m) : null,
    anginKecepatan: c.wind_speed_10m != null ? round1(c.wind_speed_10m) : null,
    anginArah: c.wind_direction_10m != null ? round1(c.wind_direction_10m) : null,
    waktuModel: c.time ?? null
  }
}

// ------------------------------------------------------------------
// Handler utama
// ------------------------------------------------------------------

export default async function handler(req, res) {
  const diambilPada = new Date().toISOString()

  // Ambil ketiga sumber secara paralel; gagal satu tidak merusak semua.
  const [polutan, pembanding, ...cuacaList] = await Promise.allSettled([
    fetchPolutan(),
    fetchPembanding(),
    ...KELURAHAN_SAKO.map((k) => fetchCuacaBMKG(k.adm4))
  ])

  const polutanOk = polutan.status === 'fulfilled'
  const pembandingOk = pembanding.status === 'fulfilled'
  const polutanVal = polutanOk ? polutan.value : null
  const pembandingVal = pembandingOk ? pembanding.value : null

  const ispu = polutanVal ? hitungISPU(polutanVal) : null

  const stations = KELURAHAN_SAKO.map((k, i) => {
    const r = cuacaList[i]
    const cuaca = r.status === 'fulfilled' ? r.value : null

    return {
      // Identitas (data resmi Kemendagri/BMKG)
      id: k.id,
      nama: k.kelurahan,
      kelurahan: k.kelurahan,
      lokasi: `Kelurahan ${k.kelurahan}, Kecamatan Sako, Kota Palembang`,
      adm4: k.adm4,
      lat: k.lat,
      lng: k.lng,

      // Polutan — SAMA untuk semua kelurahan (satu sel grid CAMS ~45 km).
      // Tidak dipalsukan berbeda; penjelasan ada di meta.catatan.
      pm25: polutanVal?.pm25 ?? null,
      pm10: polutanVal?.pm10 ?? null,
      co: polutanVal?.co ?? null,
      so2: polutanVal?.so2 ?? null,
      no2: polutanVal?.no2 ?? null,
      o3: polutanVal?.o3 ?? null,

      // Cuaca BMKG per-kelurahan (benar-benar berbeda antar kelurahan)
      temperature: cuaca?.temperature ?? null,
      humidity: cuaca?.humidity ?? null,
      cuaca: cuaca?.cuaca ?? null,
      anginKecepatan: cuaca?.anginKecepatan ?? null,
      anginArah: cuaca?.anginArah ?? null,

      // Status & ISPU kecamatan (dari polutan)
      ispu,
      status: statusDariISPU(ispu),

      dibacaPada: cuaca?.waktuLokal
        ? new Date(cuaca.waktuLokal.replace(' ', 'T')).toISOString()
        : diambilPada,

      sumberPolutan: 'CAMS via Open-Meteo',
      sumberCuaca: 'BMKG'
    }
  })

  const meta = {
    kecamatan: 'Sako',
    kota: 'Palembang',
    provinsi: 'Sumatera Selatan',
    diambilPada,
    ispu,
    status: statusDariISPU(ispu),
    sumber: {
      polutan: 'CAMS (Copernicus Atmosphere Monitoring Service) via Open-Meteo',
      cuaca: 'BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)',
      pembanding: 'Open-Meteo Forecast (model)'
    },
    gridCams: polutanVal?.grid ?? null,
    catatan:
      'Tidak ada stasiun ISPU fisik di Kecamatan Sako. Nilai polutan merupakan ' +
      'data model atmosfer CAMS (resolusi grid ~45 km) yang diproses Open-Meteo, ' +
      'bukan pengukuran langsung di lokasi. Karena seluruh kelurahan Sako berada ' +
      'dalam satu sel grid, nilai polutan ditampilkan sama untuk seluruh kecamatan. ' +
      'Suhu, kelembapan, dan kondisi cuaca bersifat per-kelurahan dari BMKG.',
    kesalahan: {
      polutan: polutanOk ? null : String(polutan.reason?.message || polutan.reason),
      pembanding: pembandingOk ? null : String(pembanding.reason?.message || pembanding.reason),
      cuaca: cuacaList.map((r) => (r.status === 'fulfilled' ? null : String(r.reason?.message || r.reason)))
    }
  }

  // Pembanding suhu/kelembapan: BMKG (rata-rata kelurahan) vs Open-Meteo model
  const bmkgSuhu = stations.map((s) => s.temperature).filter((v) => v !== null)
  const bmkgLembab = stations.map((s) => s.humidity).filter((v) => v !== null)
  const avg = (a) => (a.length ? round1(a.reduce((x, y) => x + y, 0) / a.length) : null)

  const perbandingan = {
    suhu: {
      bmkg: avg(bmkgSuhu),
      openMeteo: pembandingVal?.temperature ?? null,
      selisih:
        bmkgSuhu.length && pembandingVal?.temperature != null
          ? round1(avg(bmkgSuhu) - pembandingVal.temperature)
          : null
    },
    kelembapan: {
      bmkg: avg(bmkgLembab),
      openMeteo: pembandingVal?.humidity ?? null,
      selisih:
        bmkgLembab.length && pembandingVal?.humidity != null
          ? round1(avg(bmkgLembab) - pembandingVal.humidity)
          : null
    }
  }

  // Cache 5 menit di CDN (data BMKG/CAMS diperbarui per jam).
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ stations, meta, perbandingan })
}
