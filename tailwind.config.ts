// tailwind.config.js
import { nextui } from "@nextui-org/react";
import typography from "@tailwindcss/typography";
import { colors } from "./src/styles/colors";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ["var(--font-sora)"], // for title
        inter: ["var(--font-inter)"], // for body
      },
    },
  },
  darkMode: "class",
  plugins: [
    typography,
    nextui({
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            background: colors["neutral-800"],
            // foreground: colors.white,
          },
        },
      },
    }),
  ],
};

export default config;
