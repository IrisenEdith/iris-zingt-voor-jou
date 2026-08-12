/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        "primary": "#b8860b",
        "on-primary": "#fff8ee",
        "primary-container": "#c9960f",
        "secondary": "#c9960f",
        "background": "#faf6ef",
        "surface": "#faf6ef",
        "surface-container-lowest": "#f5efe3",
        "surface-container-low": "#ede5d8",
        "surface-container": "#e8dfd0",
        "surface-container-high": "#dfd5c4",
        "surface-container-highest": "#d4c9b6",
        "surface-variant": "#e8dfd0",
        "surface-bright": "#ffffff",
        "on-surface": "#1c1208",
        "on-surface-variant": "#5a4a38",
        "outline": "#9c8e80",
        "outline-variant": "#c9b89a",
      },
      fontFamily: {
        "serif": ["Cormorant Garamond", "Noto Serif", "serif"],
        "sans": ["Manrope", "system-ui", "sans-serif"],
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
