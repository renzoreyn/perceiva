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
        playfair: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        bg: {
          DEFAULT: "#141416",
          deep: "#0e0e10",
        },
        surface: {
          DEFAULT: "#1c1c20",
          raised: "#222228",
          high: "#2a2a32",
        },
        primary: {
          DEFAULT: "#6b8fd4",
          muted: "rgba(107,143,212,0.15)",
          hover: "#7da0de",
        },
        "text-primary": "#f0f0f4",
        "text-secondary": "#8b8b9a",
        "text-dim": "#555564",
        "text-accent": "#afc3ed",
        success: "#4caf7d",
        danger: "#e06b6b",
        gold: "#c9aa71",
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease",
        "scale-in": "scaleIn 0.25s ease",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
