/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        pitch: {
          950: "#052e16",
          900: "#064e3b",
          800: "#065f46",
        },
        alert: "#f43f5e",
        safe: "#22c55e",
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 197, 94, 0.25)",
        glowRed: "0 0 40px rgba(244, 63, 94, 0.35)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
