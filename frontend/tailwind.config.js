/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm academic blue accent. Use it for controls, states, and accents,
        // while page backgrounds stay neutral or very lightly blue-tinted.
        primary: {
              50:  '#F2F8FA',
              100: '#DCECF1',
              200: '#BCD8E3',
              300: '#8FBACB',
              400: '#5F95AD',
              500: '#0C506C', // màu chính
              600: '#0A4258',
              700: '#08384A',
              800: '#062B3A',
              900: '#041F2A',
              950: '#02141B',
        },
        // Semantic surface tokens for consistent bg across light/dark
        surface: {
          DEFAULT:          '#F8FBFF',
          secondary:        '#F1F6FD',
          elevated:         '#FFFFFF',
          dark:             '#0F172A',
          'dark-secondary': '#111827',
          'dark-elevated':  '#1E293B',
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
        serif: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
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
