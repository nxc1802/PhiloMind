/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bright academic teal-blue accent. Sáng hơn hẳn bản cũ (#0C506C) để
        // chữ/nút/nền không còn tối. Dùng cho controls, states, accents; nền
        // trang giữ trung tính hoặc phớt xanh nhẹ.
        primary: {
              50:  '#EAFBFF',
              100: '#C9F2FB',
              200: '#98E4F4',
              300: '#5DCFEA',
              400: '#22B4D8',
              500: '#0F97BE', // màu chính — teal-blue sáng
              600: '#0C7EA2',
              650: '#0B7597', // 650/750/850: các bước trung gian được dùng ở
              700: '#0B6C8E', // hàng trăm chỗ trong code (PageHero, cards, ...)
              750: '#0D607F', // nhưng trước đây CHƯA định nghĩa -> class rỗng ->
              800: '#0F5470', // vỡ giao diện light mode. Bổ sung để chúng hoạt
              850: '#114C64', // động đúng như thiết kế gốc.
              900: '#134457',
              950: '#0A2A38',
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
