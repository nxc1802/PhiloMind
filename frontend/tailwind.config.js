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
          50:  '#EFF6FF',
          100: '#DBEAFE',
          150: '#C8DDFF',
          200: '#BFDBFE',
          250: '#A8CBFD',
          300: '#93C5FD',
          350: '#7DB4FB',
          400: '#60A5FA',
          450: '#4A95F8',
          500: '#3B82F6',
          600: '#2563EB',
          650: '#1D5BD8',
          700: '#1D4ED8',
          750: '#1E45C2',
          800: '#1E40AF',
          850: '#1E3A8A',
          900: '#172554',
          950: '#0B1738',
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
