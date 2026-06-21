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
        paper: "#faf6ee",
        paper2: "#f3ede1",
        card: "#fffdf8",
        ink: "#211d18",
        inkSoft: "#4a443b",
        muted: "#79705f",
        line: "#e4dccc",
        lineStrong: "#d4c9b3",
        green: "#3f7a4f",
        greenDeep: "#2f5d3c",
        tomato: "#c5563f",
        blue: "#3a6da0",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "Times New Roman", "serif"],
        sans: ["Hanken Grotesk", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        editorial: "0 22px 40px -26px rgba(40, 30, 18, 0.4)",
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
