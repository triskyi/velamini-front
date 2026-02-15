/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "neon-cyan": "#00F3FF",
        "neon-blue": "#0066FF",
        "neon-purple": "#9D00FF",
        "neon-pink": "#FF00FF",
        "neon-green": "#39FF14",
      },
      boxShadow: {
        "neon-cyan": "0 0 20px #00F3FF",
        "neon-purple": "0 0 20px #9D00FF",
        "neon-green": "0 0 20px #39FF14",
        "neon-pink": "0 0 20px #FF00FF",
      },
      dropShadow: {
        "neon-cyan": "0 0 10px #00F3FF",
        "neon-purple": "0 0 10px #9D00FF",
        "neon-green": "0 0 10px #39FF14",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
}
