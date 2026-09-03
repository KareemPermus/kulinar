/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf8f4',
        warm: {
          50: '#f4ede2',
          100: '#eae5db',
          200: '#e2ddd4',
          300: '#a89f90',
          400: '#6b6357',
          500: '#2b2620',
        },
        accent: '#c65d3b',
        'accent-hover': '#b04f31',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};