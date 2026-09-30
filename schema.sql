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
--    4. Salin connection string ke environment Vercel:
--         DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
--
--  Catatan:
--    - Data kualitas udara TIDAK disimpan di database. Aplikasi
--      mengambilnya langsung dari sumber real di api/udara.js:
--        * Polutan: CAMS (Copernicus) via Open-Meteo
--        * Cuaca per-kelurahan: BMKG
--      Database hanya dipakai untuk mencatat donasi.
--    - Input user disterilkan di aplikasi (lib/security.js) & di
--      server (api/donasi.js) sebelum INSERT.
--    - Gunakan parameterized query (anti SQL injection).
-- ============================================================

-- ============================================================
--  EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  TABEL: riwayat_trakteer
--  Menyimpan catatan donasi Trakteer (wall of thanks).
-- ============================================================

DROP TABLE IF EXISTS riwayat_trakteer CASCADE;

-- ============================================================
--  SELESAI
--  Verifikasi:
--    SELECT * FROM riwayat_trakteer;
-- ============================================================

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
--  SELESAI
--  Verifikasi:
--    SELECT * FROM riwayat_trakteer;
-- ============================================================
