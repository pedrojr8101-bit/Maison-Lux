import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Maison Lux"
        offwhite: "#FAF7F2",
        sand: "#F1E9DD",
        beige: "#E4D6C1",
        gold: {
          DEFAULT: "#B08D57", // bege dourado / ouro velho
          light: "#C9AD80",
          dark: "#8C6D3F",
        },
        charcoal: "#1A1A1A", // tipografia escura
        brown: {
          DEFAULT: "#3E2C22", // marrom escuro
          light: "#5C4432",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Didot", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.12em",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(26,26,26,0.06)",
        card: "0 2px 12px rgba(26,26,26,0.08)",
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
