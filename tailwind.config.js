/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ISPU status palette (Indonesian KLHK / BMKG standard)
        ispu: {
          good: '#22c55e', // Baik (0-50)
          moderate: '#eab308', // Sedang (51-100)
          unhealthy: '#f97316', // Tidak Sehat (101-199)
          veryUnhealthy: '#ef4444', // Sangat Tidak Sehat (200-299)
          hazardous: '#7f1d1d' // Berbahaya (>=300)
        },
        brand: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfe2fe',
          300: '#93cffd',
          400: '#60b3fa',
          500: '#3b95f6',
          600: '#2576eb',
          700: '#1d5fd8',
          800: '#1e4daf',
          900: '#1e418a',
          950: '#172a57'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' }
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '60%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
}
