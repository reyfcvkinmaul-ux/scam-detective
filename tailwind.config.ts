import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cyber detective palette
        bg: {
          base: "#06070d",
          panel: "#0c0e18",
          elev: "#11142099",
          line: "#1c2030",
        },
        neon: {
          blue: "#22d3ee",
          cyan: "#06b6d4",
          purple: "#a855f7",
          violet: "#7c3aed",
        },
        warn: {
          DEFAULT: "#ef4444",
          soft: "#fb7185",
          amber: "#f59e0b",
        },
        ok: {
          DEFAULT: "#10b981",
        },
        ink: {
          hi: "#e6edf3",
          mid: "#9aa4b2",
          low: "#5b6478",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(34, 211, 238, 0.25), 0 0 60px rgba(168, 85, 247, 0.15)",
        glowRed: "0 0 24px rgba(239, 68, 68, 0.35)",
        panel: "0 1px 0 rgba(255,255,255,0.03) inset, 0 0 0 1px rgba(34, 211, 238, 0.08)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)",
        scan: "repeating-linear-gradient(0deg, rgba(168,85,247,0.04) 0 1px, transparent 1px 3px)",
        radialGlow:
          "radial-gradient(1200px 600px at 50% -10%, rgba(124,58,237,0.18), transparent 60%), radial-gradient(800px 400px at 90% 10%, rgba(34,211,238,0.12), transparent 60%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        flicker: "flicker 2.5s linear infinite",
      },
      keyframes: {
        flicker: {
          "0%,19%,21%,23%,25%,54%,56%,100%": { opacity: "1" },
          "20%,24%,55%": { opacity: "0.65" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
