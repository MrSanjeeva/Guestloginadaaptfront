// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- ADDITIONS ---
      colors: {
        // A custom color for our paper background
        paper: '#fdfdf6', 
      },
      backgroundImage: {
        // A subtle noise texture to simulate paper grain.
        // This is a base64 encoded SVG.
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      fontFamily: {
        // Ensure you have a serif font configured if you want to customize it
        sans: ['Inter', 'sans-serif'], // Example: keeping your default sans-serif
        serif: ['Georgia', 'serif'],   // Example: using Georgia for serif
      },
    },
  },
  // --- PRESERVED FROM OLD FILE ---
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
  ],
}