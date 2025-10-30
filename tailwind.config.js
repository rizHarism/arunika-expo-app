/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./buku-tamu/**/*.{html,js}",
    "./pdf/**/*.html",
    "./video/**/*.html",
    "./assets/js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["League Spartan", "sans-serif"],
      },
    },
  },
  plugins: [],
};
