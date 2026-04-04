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
        phosphor: "#39FF14",
        amber:    "#FFB800",
        pitred:   "#FF3B00",
        drs:      "#00E5FF",
        void:     "#050505",
        carbon:   "#111111",
        surface:  "#181818",
        dim:      "#2a2a2a",
        muted:    "#555555",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        mono:    ["'IBM Plex Mono'", "monospace"],
      },
      letterSpacing: {
        widest2: "0.3em",
        widest3: "0.4em",
      },
      backgroundImage: {
        "carbon-fiber":
          "repeating-linear-gradient(45deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 8px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 8px)",
        "checker":
          "repeating-linear-gradient(-45deg,rgba(255,255,255,0.07) 0,rgba(255,255,255,0.07) 5px,transparent 5px,transparent 10px)",
        "grid-lines":
          "linear-gradient(rgba(57,255,20,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,20,0.04) 1px,transparent 1px)",
      },
      backgroundSize: {
        "grid-sm":  "40px 40px",
        "grid-md":  "80px 80px",
      },
      keyframes: {
        "phosphor-pulse": {
          "0%,100%": { opacity: "1" },
          "50%":     { opacity: "0.2" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scan-line": {
          "0%":   { top: "-5%" },
          "100%": { top: "105%" },
        },
        flicker: {
          "0%,19%,21%,23%,25%,54%,56%,100%": { opacity: "1" },
          "20%,22%,24%,55%": { opacity: "0.4" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
      animation: {
        "phosphor-pulse": "phosphor-pulse 1s ease-in-out infinite",
        marquee:          "marquee 30s linear infinite",
        "scan-line":      "scan-line 3s linear infinite",
        flicker:          "flicker 4s linear infinite",
        "fade-up":        "fade-up 0.8s ease forwards",
        "fade-in":        "fade-in 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};