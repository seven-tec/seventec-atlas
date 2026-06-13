import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1020",
        surface: "#121933",
        border: "#24304f",
        foreground: "#e6ecff",
        muted: "#96a2c7",
        accent: "#9fb4ff",
      },
    },
  },
  plugins: [],
};

export default config;

