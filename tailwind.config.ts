import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A5F",
        accent: "#A8D5BA",
        background: "#FFFFFF",
        lightBackground: "#F7F9FC",
        text: "#1F2937"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(30, 58, 95, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;
