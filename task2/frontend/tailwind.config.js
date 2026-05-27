/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chat: {
          dark: '#0e1118',
          darkSecondary: '#181f2b',
          darkGlass: 'rgba(24, 31, 43, 0.65)',
          light: '#f3f4f6',
          lightSecondary: '#ffffff',
          lightGlass: 'rgba(255, 255, 255, 0.65)',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
