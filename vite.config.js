import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // --- Secure header configuration (dev server) ---
    // Protects against basic web threats: clickjacking, MIME-type sniffing,
    // cross-site scripting via inline scripts, and protocol downgrade.
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://air-quality-api.open-meteo.com https://api.open-meteo.com https://api.bmkg.go.id",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    }
  },
  preview: {
    port: 4173,
    host: true,
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Fast-loading: split vendor chunks & enforce size warnings
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          qrcode: ['qrcode']
        }
      }
    },
    chunkSizeWarningLimit: 700
  }
})
