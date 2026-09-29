-- ============================================================
--  SakoSaring — Skema Database Neon PostgreSQL
--  Sistem Pemantauan & Analisis Kualitas Udara Sako
--  Kecamatan Sako, Kota Palembang, Sumatera Selatan, Indonesia
-- ============================================================
--
--  Cara pakai:
--    1. Buat project di https://neon.tech (gratis)
--    2. Buka "SQL Editor" di dashboard Neon
--    3. Copy-paste seluruh skrip ini, lalu klik "Run"
--    4. Salin connection string ke file .env aplikasi:
--         VITE_NEON_CONNECTION_STRING=postgresql://user:pass@host/db?sslmode=require
--
--  Catatan keamanan:
--    - Semua kolom teks memakai TEXT dengan batasan panjang di level app.
--    - Input user disterilkan di aplikasi (lib/security.js) sebelum INSERT.
--    - Gunakan parameterized query di neonClient.js (anti SQL injection).
-- ============================================================

-- ============================================================
--  EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  TABEL 1: stasiun_sako
--  Menyimpan data kualitas udara per stasiun pemantauan.
--  Kolom: lokasi, pm25, pm10, status, temperature, humidity
-- ============================================================

DROP TABLE IF EXISTS stasiun_sako CASCADE;

CREATE TABLE stasiun_sako (
    -- Identitas
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_stasiun    TEXT                        NOT NULL,
    lokasi          TEXT                        NOT NULL,

    -- Parameter pencemar udara (konsentrasi)
    pm25            NUMERIC(8,2)                NOT NULL DEFAULT 0,   -- µg/m³
    pm10            NUMERIC(8,2)                NOT NULL DEFAULT 0,   -- µg/m³
    co              NUMERIC(10,2)               NOT NULL DEFAULT 0,   -- µg/m³
    so2             NUMERIC(8,2)                NOT NULL DEFAULT 0,   -- µg/m³

    -- Status kualitas udara (Baik / Sedang / Tidak Sehat / dst.)
    status          TEXT                        NOT NULL DEFAULT 'Baik'
                    CHECK (status IN ('Baik', 'Sedang', 'Tidak Sehat', 'Sangat Tidak Sehat', 'Berbahaya')),

    -- Cuaca & kenyamanan
    temperature     NUMERIC(5,2)                NOT NULL DEFAULT 0,   -- °C
    humidity        NUMERIC(5,2)                NOT NULL DEFAULT 0,   -- %

    -- Audit
    dibaca_pada     TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    dibuat_pada     TIMESTAMPTZ                 NOT NULL DEFAULT NOW()
);

-- Index untuk pencarian & pengurutan
CREATE INDEX idx_stasiun_sako_lokasi   ON stasiun_sako (lokasi);
CREATE INDEX idx_stasiun_sako_dibaca   ON stasiun_sako (dibaca_pada);

COMMENT ON TABLE  stasiun_sako IS 'Data kualitas udara per stasiun pemantauan di Kecamatan Sako, Palembang';
COMMENT ON COLUMN stasiun_sako.pm25 IS 'Konsentrasi PM2.5 dalam µg/m³ (partikel halus ≤2.5 mikron)';
COMMENT ON COLUMN stasiun_sako.pm10 IS 'Konsentrasi PM10 dalam µg/m³ (partikel kasar ≤10 mikron)';
COMMENT ON COLUMN stasiun_sako.co   IS 'Konsentrasi CO (karbon monoksida) dalam µg/m³';
COMMENT ON COLUMN stasiun_sako.so2  IS 'Konsentrasi SO2 (sulfur dioksida) dalam µg/m³';

-- ============================================================
--  TABEL 2: riwayat_trakteer
--  Menyimpan catatan donasi Trakteer.
--  Kolom: donor name, amount, message
-- ============================================================

DROP TABLE IF EXISTS riwayat_trakteer CASCADE;

CREATE TABLE riwayat_trakteer (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Data donatur (disterilkan di aplikasi sebelum disimpan)
    nama_donatur    TEXT                        NOT NULL,
    jumlah          BIGINT                      NOT NULL CHECK (jumlah >= 6000 AND jumlah % 6000 = 0),
    pesan           TEXT                        NOT NULL DEFAULT '',

    -- Audit
    dibuat_pada     TIMESTAMPTZ                 NOT NULL DEFAULT NOW()
);

-- Index untuk menampilkan daftar donatur terbaru
CREATE INDEX idx_riwayat_trakteer_dibuat ON riwayat_trakteer (dibuat_pada DESC);

COMMENT ON TABLE  riwayat_trakteer IS 'Catatan donasi Trakteer untuk mendukung server SakoSaring';
COMMENT ON COLUMN riwayat_trakteer.jumlah IS 'Jumlah donasi dalam Rupiah, harus kelipatan Rp6.000';

-- ============================================================
--  TABEL 3 (opsional): riwayat_pembacaan
--  Menyimpan riwayat pembacaan untuk grafik/tren.
--  Dipakai oleh neonClient.fetchStationHistory()
-- ============================================================

DROP TABLE IF EXISTS riwayat_pembacaan CASCADE;

CREATE TABLE riwayat_pembacaan (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stasiun_id      BIGINT                      NOT NULL REFERENCES stasiun_sako(id) ON DELETE CASCADE,
    pm25            NUMERIC(8,2)                NOT NULL DEFAULT 0,
    pm10            NUMERIC(8,2)                NOT NULL DEFAULT 0,
    temperature     NUMERIC(5,2)                NOT NULL DEFAULT 0,
    humidity        NUMERIC(5,2)                NOT NULL DEFAULT 0,
    dibaca_pada     TIMESTAMPTZ                 NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_riwayat_pembacaan_stasiun ON riwayat_pembacaan (stasiun_id, dibaca_pada DESC);

COMMENT ON TABLE riwayat_pembacaan IS 'Riwayat pembacaan kualitas udara untuk grafik tren per stasiun';

-- ============================================================
--  DATA AWAL (seed) — 3 stasiun contoh di Kecamatan Sako
-- ============================================================

INSERT INTO stasiun_sako (nama_stasiun, lokasi, pm25, pm10, co, so2, status, temperature, humidity, dibaca_pada) VALUES
(
    'Stasiun Sako 1',
    'Kelurahan Sako, Kecamatan Sako, Kota Palembang, Sumatera Selatan',
    42.0, 68.0, 2100.0, 8.0, 'Sedang', 31.5, 74.0, NOW()
),
(
    'Stasiun Kemuning',
    'Kelurahan Kemuning, Kecamatan Sako, Kota Palembang, Sumatera Selatan',
    58.0, 91.0, 3400.0, 12.0, 'Sedang', 32.1, 70.0, NOW()
),
(
    'Stasiun Kebon Semai',
    'Kelurahan Kebon Semai, Kecamatan Sako, Kota Palembang, Sumatera Selatan',
    29.0, 47.0, 1600.0, 5.0, 'Baik', 30.8, 78.0, NOW()
);

-- Riwayat contoh untuk stasiun pertama (24 jam terakhir)
INSERT INTO riwayat_pembacaan (stasiun_id, pm25, pm10, temperature, humidity, dibaca_pada)
SELECT
    1,
    (40 + (random() * 18))::NUMERIC(8,2),
    (65 + (random() * 25))::NUMERIC(8,2),
    (29 + (random() * 3))::NUMERIC(5,2),
    (68 + (random() * 12))::NUMERIC(5,2),
    NOW() - (generate_series || ' hour')::INTERVAL
FROM generate_series(0, 23);

-- ============================================================
--  SELESAI
--  Verifikasi:
--    SELECT * FROM stasiun_sako;
--    SELECT * FROM riwayat_trakteer;
-- ============================================================
