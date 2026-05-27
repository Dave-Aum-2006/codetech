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
        tracker: {
          dark: '#030712', // slate-950
          darkSecondary: '#0f172a', // slate-900
          light: '#f8fafc', // slate-50
          lightSecondary: '#ffffff',
          brand: '#6366f1', // Indigo
        }
      }
    },
  },
  plugins: [],
}
