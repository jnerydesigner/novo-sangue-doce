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
        navy: "#1A3868",
        azure: "#2E80C2",
        spark: "#18C0E4",
        energy: "#F07418",
        white: "#FFFFFF",
        ink: "#0D1E32",
        inkSoft: "#2B4966",
        muted: "#5C7A96",
        line: "#C2D6EA",
        lineStrong: "#9FBFDC",
        bg: "#EBF3FA",
        surface: "#FFFFFF",
        subtle: "#DCE9F5",
        navy10: "#EBF0F8",
        azure10: "#E6F2FB",
        energy10: "#FEF0E4",
        spark10: "#E4F8FC",
        paper: "#EBF3FA",
        paper2: "#DCE9F5",
        card: "#FFFFFF",
        green: "#2E80C2",
        greenDeep: "#1A3868",
        tomato: "#F07418",
        blue: "#2E80C2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
        serif: ["var(--font-sans)", "Arial", "sans-serif"],
      },
      boxShadow: {
        editorial: "0 14px 28px -24px rgba(13, 30, 50, 0.55)",
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
