/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E0F7FF',
          100: '#4CD6FF',
          200: '#00BAE3',
          300: '#009DC1',
          400: '#00829F',
          500: '#00677F',
          600: '#004E60',
          700: '#003543',
          800: '#001F28',
          900: '#000000',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Libre Caslon Text"', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}