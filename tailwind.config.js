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
        brand: '#ee4c2b',
        brand_50: '#ee4c2b80',
        brand_20: '#ee4c2b33',
        dark: '#09090b',       // Zinc-950 style
        dark_50: '#18181b',    // Zinc-900 style
        dark_40: '#27272a',    // Zinc-800 style
        light_50: '#f4f4f5',   // Zinc-100 style
      },
      fontFamily: {
        primary: ['Titillium Web', 'system-ui', '-apple-system', 'sans-serif'],
        amaranth: ['Amaranth', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
