/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',
          card: 'rgba(17, 24, 39, 0.7)',
          accent: '#6366F1',
          accentGlow: 'rgba(99, 102, 241, 0.15)',
        }
      }
    },
  },
  plugins: [],
}
