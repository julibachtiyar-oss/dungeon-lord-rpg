/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          950: '#07090e',
          900: '#0f141c',
          850: '#151c27',
          800: '#1b2433',
          700: '#28364d',
          600: '#3a4e6e',
          500: '#536e99',
        },
        gold: {
          300: '#fef08a',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        mana: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        blood: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontFamily: {
        fantasy: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.6))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 2px rgba(234, 179, 8, 0.2))' }
        },
        'float-damage': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-35px) scale(1.15)', opacity: '0' }
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-damage': 'float-damage 0.8s ease-out forwards'
      }
    },
  },
  plugins: [],
}
