import type { Config } from "tailwindcss";

const fontStack = [
  "Trade Republic Sans Display",
  "TradeRepublic Sans Display",
  "Aptos Display",
  "Aptos",
  "Bahnschrift",
  "Segoe UI Variable Display",
  "Segoe UI Variable Text",
  "Segoe UI",
  "sans-serif",
];

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: fontStack,
      },
      boxShadow: {
        hero: "0 32px 100px rgba(30, 39, 46, 0.16), 0 8px 26px rgba(30, 39, 46, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
