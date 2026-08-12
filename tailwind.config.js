/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#b8860b',
        'on-primary': '#faf6ef',
        surface: '#faf6ef',
        'on-surface': '#1c1208',
        'on-surface-variant': '#4a3728',
        background: '#faf6ef',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Noto Serif', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        script: ['Dancing Script', 'cursive'],
        handwritten: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
