/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        "bg-deep": "var(--bg-deep)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-card": "var(--bg-card)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        accent: "#7C3AED",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
    },
  },
  plugins: [],
};
