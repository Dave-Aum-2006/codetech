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
        saas: {
          dark: '#0b0f19',
          darkSecondary: '#111827',
          light: '#f9fafb',
          lightSecondary: '#ffffff',
          brand: '#4f46e5', // Indigo-600
        }
      }
    },
  },
  plugins: [],
}
