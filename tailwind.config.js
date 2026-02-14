/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'agentaria': {
          bg: '#070A0A',
          surface: '#0D1211',
          primary: '#0E3B2E',
          accent: '#38F28D',
          text: '#F2F5F4',
          'text-secondary': '#A7B0AD',
          border: '#1A2321'
        }
      }
    },
  },
  plugins: [],
}
