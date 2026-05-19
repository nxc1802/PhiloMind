/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-color)',
        foreground: 'var(--text-color)',
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        accent: {
          purple: 'var(--accent-purple)',
        },
        node: {
          complete: 'var(--node-complete)',
          locked: 'var(--node-locked)',
        },
        surface: {
          lowest: 'var(--surface-container-lowest)',
          container: 'var(--surface-container)',
          high: 'var(--surface-container-high)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
