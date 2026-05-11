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
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["SF Mono", "SFMono-Regular", "ui-monospace", "Menlo", "monospace"],
      },
      colors: {
        // Apple Starlight (Light Mode)
        starlight: {
          bg: "#F5F5F7",
          surface: "#FFFFFF",
          surface2: "#F2F2F2",
          border: "#D2D2D7",
          text: "#1D1D1F",
          subtext: "#6E6E73",
          accent: "#0071E3",
        },
        // Apple Space Grey (Dark Mode)
        spacegrey: {
          bg: "#1C1C1E",
          surface: "#2C2C2E",
          surface2: "#3A3A3C",
          border: "#38383A",
          text: "#F5F5F7",
          subtext: "#98989D",
          accent: "#0A84FF",
        },
        // Semantic tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Finance colors
        income: "#30D158",
        expense: "#FF453A",
        warning: "#FF9F0A",
        info: "#0A84FF",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        "apple-sm": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "apple-md": "0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        "apple-lg": "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
        "apple-xl": "0 24px 64px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)",
        "card-dark": "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
        "card-light": "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      },
      backgroundImage: {
        "card-gold": "linear-gradient(135deg, #C8A96E 0%, #E8D5A3 40%, #B8965A 70%, #D4B87A 100%)",
        "card-space": "linear-gradient(135deg, #2C2C2E 0%, #48484A 50%, #1C1C1E 100%)",
        "card-silver": "linear-gradient(135deg, #E8E8ED 0%, #F5F5F7 50%, #D2D2D7 100%)",
        "card-midnight": "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
        "card-product-red": "linear-gradient(135deg, #BF0000 0%, #E31212 50%, #8B0000 100%)",
        "card-alpine-green": "linear-gradient(135deg, #1B4D3E 0%, #2D6A4F 50%, #1B4D3E 100%)",
        "glass-light": "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)",
        "glass-dark": "linear-gradient(135deg, rgba(60,60,67,0.6) 0%, rgba(44,44,46,0.4) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-up": "fadeUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "card-flip": "cardFlip 0.6s ease-in-out",
        "shimmer": "shimmer 2s infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "spotlight": "spotlight 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        cardFlip: {
          "0%": { transform: "perspective(1000px) rotateY(0deg)" },
          "100%": { transform: "perspective(1000px) rotateY(180deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        apple: "20px",
        "apple-lg": "40px",
      },
      transitionTimingFunction: {
        "apple": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "apple-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "apple-spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
