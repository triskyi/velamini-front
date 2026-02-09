/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F1A",        // Dark background
        neonBlue: "#00FFFF",
        neonPurple: "#A020F0",
        neonGreen: "#7CFC00",
        neonPink: "#FF00FF",
        textPrimary: "#E0E0E0",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      boxShadow: {
        neon: "0 0 10px #00FFFF, 0 0 20px #00FFFF",
      },
    },
  },
  plugins: [],
};
