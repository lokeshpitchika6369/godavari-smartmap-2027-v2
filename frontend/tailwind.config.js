/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pushkar: {
          river: '#1e3a8a',
          gold: '#f59e0b',
          saffron: '#ea580c',
          ghat: '#78350f',
        }
      }
    },
  },
  plugins: [],
}
