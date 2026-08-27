import type { Config } from "tailwindcss";

/**
 * Design tokens for the creator tool.
 *
 * Direction: digital editorial + personal scrapbook.
 * Paper ground, ink type, hairline rules, generous whitespace.
 * No glassmorphism, no purple gradients, no rounded-card soup.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F0E7",
        "paper-deep": "#EAE4D6",
        ink: "#1B1815",
        "ink-soft": "#4A453D",
        "ink-faint": "#8B8578",
        line: "#D8D1C2",
        ember: "#B4502A",
        moss: "#5A6B4D",
        night: "#14131A",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Space Grotesk", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["IBM Plex Mono", "Courier New", "monospace"],
        didone: ["Bodoni Moda", "Georgia", "serif"],
        cond: ["Anton", "Arial Narrow", "sans-serif"],
        hand: ["Caveat", "Comic Sans MS", "cursive"],
      },
      letterSpacing: {
        widest2: "0.22em",
        tightest: "-0.03em",
      },
      maxWidth: {
        editorial: "72rem",
      },
      transitionDuration: {
        350: "350ms",
        600: "600ms",
      },
    },
  },
  plugins: [],
};

export default config;
