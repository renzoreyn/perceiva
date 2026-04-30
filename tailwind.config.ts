import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
      colors: {
        bg: { DEFAULT: "#08080f", deep: "#050508" },
        glass: "rgba(255,255,255,0.042)",
        primary: {
          DEFAULT: "#6b8fd4",
          hover: "#7da0de",
          muted: "rgba(107,143,212,0.15)",
        },
        violet: { DEFAULT: "#9b7fe8", muted: "rgba(155,127,232,0.13)" },
        success: "#3db87a",
        danger: "#e05c5c",
        gold: "#c9aa71",
      },
      borderRadius: { xl: "16px", "2xl": "20px" },
      animation: {
        "scale-in": "scale-in 0.22s cubic-bezier(0.34, 1.2, 0.64, 1) forwards",
        "fade-up": "fade-up 0.5s ease forwards",
      },
      keyframes: {
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
