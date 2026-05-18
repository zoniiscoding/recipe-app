/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF7F0",
        strawberry: "#FF4D6D",
        strawberryLight: "#FF8FA3",
        creamBorder: "#FFE5D9"
      }
    },
  },
  plugins: [],
}
