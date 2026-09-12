import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: "#0c2340",
          dark: "#061428",
          mid: "#163a66",
          light: "#1e4d85",
        },
        charcoal: {
          DEFAULT: "#1a1a1a",
          mid: "#2a2a2a",
          light: "#3d3d3d",
          soft: "#4a4a4a",
        },
        cream: {
          DEFAULT: "#f5e6c8",
          muted: "#d4c4a8",
          dim: "#a89878",
        },
        gold: {
          DEFAULT: "#d4af37",
          bright: "#f0d060",
          dark: "#a88b2a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.45)",
        glow: "0 0 20px rgba(212, 175, 55, 0.25)",
      },
      keyframes: {
        flash: {
          "0%, 100%": { backgroundColor: "rgb(12, 35, 64)" },
          "50%": { backgroundColor: "rgb(212, 175, 55)" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        flash: "flash 0.6s ease-in-out 3",
        "pulse-gold": "pulseGold 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
