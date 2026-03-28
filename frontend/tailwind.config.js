/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brandPink: "#ff4ecd",
        brandPurple: "#7c3aed",
        brandBlue: "#60a5fa",
        pinkGlow: "#f72585",
        violetGlow: "#7209b7",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, rgba(255,78,205,0.2), rgba(124,58,237,0.2), rgba(96,165,250,0.2))"
      }
    }
  },
  plugins: []
};