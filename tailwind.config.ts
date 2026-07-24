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
        primary: {
          DEFAULT: "#0077BC",
          dark: "#4DA8E8",
        },
        secondary: {
          DEFAULT: "#009866",
          dark: "#34D399",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#111111",
        },
        text: {
          light: "#111827",
          dark: "#F9FAFB",
          muted: {
            light: "#6B7280",
            dark: "#9CA3AF",
          },
        },
        border: {
          light: "#E5E7EB",
          dark: "#374151",
        },
        danger: {
          DEFAULT: "#DC2626",
          dark: "#EF4444",
        },
        warning: {
          DEFAULT: "#D97706",
          dark: "#FBBF24",
        },
        success: {
          DEFAULT: "#16A34A",
          dark: "#22C55E",
        },
        male: {
          DEFAULT: "#3B82F6",
          dark: "#60A5FA",
        },
        female: {
          DEFAULT: "#EC4899",
          dark: "#F472B6",
        },
      },
      fontFamily: {
        display: ["Archivo Black", "sans-serif"],
        arabic: ["IBM Plex Sans Arabic", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "900" }],
        "display-lg": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "800" }],
        "display-md": ["1.5rem", { lineHeight: "1.3", letterSpacing: "0", fontWeight: "700" }],
        "display-sm": ["1.25rem", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "700" }],
        "heading-lg": ["1.125rem", { lineHeight: "1.4", fontWeight: "700" }],
        "heading-md": ["1rem", { lineHeight: "1.5", fontWeight: "700" }],
        "heading-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "700" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }],
      },
      spacing: {
        "0": "0",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },
      borderRadius: {
        "sm": "4px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
        "full": "9999px",
      },
      boxShadow: {
        "sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        "glow": "0 0 40px rgba(0, 119, 188, 0.15)",
        "glow-dark": "0 0 40px rgba(77, 168, 232, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;