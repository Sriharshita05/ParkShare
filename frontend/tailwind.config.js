/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f1f5fb',
          100: '#e1e9f6',
          200: '#c3d3ec',
          300: '#97b1dc',
          400: '#6489c6',
          500: '#4068ad',
          600: '#2f5190',
          700: '#274175',
          800: '#1b2d56',
          900: '#0f1d3d',
          950: '#0a1429',
        },
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8ebcff',
          400: '#5996ff',
          500: '#3374f6',
          600: '#1f58e8',
          700: '#1845cc',
          800: '#1a3ba5',
          900: '#1a3782',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#12b886',
          600: '#0a9a70',
          700: '#087a59',
        },
        surface: '#f4f8fe',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,29,61,.04), 0 4px 16px -4px rgba(15,29,61,.08)',
        card: '0 1px 2px rgba(15,29,61,.05), 0 12px 32px -12px rgba(15,29,61,.16)',
        lift: '0 2px 4px rgba(15,29,61,.06), 0 24px 48px -16px rgba(31,88,232,.28)',
        glow: '0 8px 24px -6px rgba(51,116,246,.5)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(.8)', opacity: 0.6 },
          '100%': { transform: 'scale(2.2)', opacity: 0 },
        },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(40px,28px,0) scale(1.08)' },
        },
        dash: {
          to: { strokeDashoffset: '-14' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(.92)', opacity: 0.55 },
          '50%': { transform: 'scale(1.08)', opacity: 1 },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        drift: 'drift 16s ease-in-out infinite',
        'drift-slow': 'drift 24s ease-in-out infinite reverse',
        dash: 'dash 1.2s linear infinite',
        breathe: 'breathe 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
