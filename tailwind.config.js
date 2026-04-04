/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        f1red:   "#E8002D",
        f1red2:  "#FF1801",
        amber:   "#FFF200",
        drs:     "#00D2FF",
        f1white: "#F0EDE8",
        void:    "#030303",
        carbon:  "#0D0D0D",
        surface: "#141414",
        dim:     "#222222",
        muted:   "#3a3a3a",
        ghost:   "#555555",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        mono:    ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        "f1-pulse": {
          "0%,100%": { opacity: "1" },
          "50%":     { opacity: "0.15" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(28px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%,19%,21%,23%,25%,54%,56%,100%": { opacity: "1" },
          "20%,22%,24%,55%": { opacity: "0.4" },
        },
      },
      animation: {
        "f1-pulse": "f1-pulse 1s ease-in-out infinite",
        marquee:    "marquee 28s linear infinite",
        "slide-up": "slide-up 0.7s ease forwards",
        flicker:    "flicker 4s linear infinite",
      },
    },
  },
  plugins: [],
};