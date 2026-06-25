/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Muted academic teal accent. Use it for controls, states, and accents,
        // while page backgrounds stay neutral.
        primary: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          150: '#B7F3EA',
          200: '#99F6E4',
          250: '#78EBDD',
          300: '#5EEAD4',
          350: '#3FD6C8',
          400: '#2DD4BF',
          450: '#22BFB0',
          500: '#14B8A6',
          600: '#0F766E',
          650: '#0E6B63',
          700: '#0F5F59',
          750: '#0D5550',
          800: '#115E59',
          850: '#134E4A',
          900: '#123D3A',
          950: '#0B2826',
        },
        // Semantic surface tokens for consistent bg across light/dark
        surface: {
          DEFAULT:        '#FFFFFF',
          secondary:      '#F8FAFC',
          elevated:       '#FFFFFF',
          dark:           '#0D1117',
          'dark-secondary': '#161B22',
          'dark-elevated':  '#1C2230',
        },
        slate: {
          150: '#F1F5F9',
          205: '#DDE5EE',
          250: '#CBD5E1',
          350: '#94A3B8',
          450: '#64748B',
          650: '#334155',
          905: '#0B1220',
        },
        gray: {
          55: '#FAFAFA',
          150: '#E5E7EB',
          250: '#D1D5DB',
          350: '#9CA3AF',
          450: '#6B7280',
          650: '#374151',
          655: '#354052',
          750: '#1F2937',
          855: '#111827',
        },
        amber: {
          55: '#FFFBEB',
        },
        emerald: {
          55: '#ECFDF5',
        },
        red: {
          650: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Libre Caslon Text"', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
