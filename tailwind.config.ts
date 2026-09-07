import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      colors: {
        'brand-blue': '#2563EB',
        'brand-indigo': '#4F46E5',
        'brand-sky': '#0EA5E9',
      },
    },
  },
  plugins: [],
};
export default config;
