import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1F3B68",
        accent: "#6FCF97",
        mint: "#EAF8F1",
        background: "#FFFFFF",
        lightBackground: "#F7F9FC",
        text: "#1F2937"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 59, 104, 0.09)",
        lift: "0 22px 55px rgba(31, 59, 104, 0.13)"
      }
    }
  },
  plugins: []
};

export default config;
