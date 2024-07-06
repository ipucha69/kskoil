/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primaryColor: "#0A365C",
        secondaryColor: "#39546A",
        thirdColor: "#39546A",
        fourthColor: "#DCF4FE",
        screenBgColor: "#FEFEFE",
        goldishColor: "#FFB636",
      },
    },
  },
  plugins: [require("tailwindcss-animated")],
};
