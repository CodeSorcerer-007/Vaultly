import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2430",
        paper: "#EDEAE3",
        "paper-dim": "#E2DDD3",
        brass: "#B08D57",
        "brass-dark": "#8F6D3F",
        slate: "#5B6472",
        rust: "#C1502E",
        line: "#D4CEC1",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "dotted-line":
          "linear-gradient(to right, #D4CEC1 40%, transparent 0%)",
      },
    },
  },
  plugins: [],
};

export default config;
