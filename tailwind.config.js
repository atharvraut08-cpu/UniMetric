/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          charcoal: '#191919',
          cream: '#F4F2EC',
          paper: '#FFFFFF',
          yellow: '#F5C451',
          purple: '#C7B7F2',
          blue: '#AEE1F5',
          coral: '#F4633E',
        },
      },
      borderRadius: {
        '3xl': '2rem',   // 32px
        '4xl': '2.5rem', // 40px
      },
      boxShadow: {
        soft: '0 2px 10px rgba(25, 25, 25, 0.06)',
      },
    },
  },
  plugins: [],
};