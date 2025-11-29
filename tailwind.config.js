/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f9ff",
          100: "#e0f2fe",
          500: "#2563eb",
          600: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
}
