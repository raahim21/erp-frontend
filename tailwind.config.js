/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens:{
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "1100": "1100px", // your custom breakpoint
    },
    extend: {
      colors: {
        "primary-bg": "#F5F5F5", // Soft off-white for page background
        "secondary-bg": "#E5E7EB", // Light gray for cards/tables
        "accent-dark": "#1F4E79", // Deep teal for headers/navbars
        "accent-light": "#22D3EE", // Bright cyan for buttons/links
        "text-dark": "#1F2937", // Darker charcoal for text
        "text-light": "#F9FAFB", // Off-white for text on dark backgrounds
        error: "#F87171", // Soft red for errors
        success: "#34D399", // Green for success (future-proof)
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
