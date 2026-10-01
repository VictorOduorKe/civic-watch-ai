/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Open Civic Lab Brand Navy (from logo.jpg)
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#334E68',
          600: '#243B53',
          700: '#1A365D',
          800: '#102A4C',
          900: '#0B2545', // Official Brand Navy
          950: '#061528',
        },
        // Open Civic Lab Brand Ochre Gold (from logo.jpg)
        gold: {
          50: '#FFFDF5',
          100: '#FEF7DA',
          200: '#FCE8AC',
          300: '#FAD77A',
          400: '#E6AF3D',
          500: '#D49B24', // Official Brand Ochre Gold
          600: '#B88218',
          700: '#926310',
          800: '#744E10',
          900: '#5D3E0F',
          950: '#382305',
        },
        // National Republic of Kenya Flag Accents
        kenya: {
          red: '#C8102E',
          green: '#007A3D',
          black: '#111827',
          white: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
};
