module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    fontFamily: {
      display: ["Inter", "sans-serif"],
      body: ["Inter", "sans-serif"],
    },
    extend: {
      fontSize: {
        14: "14px",
      },
      colors: {
        // === DARK THEME - NEW PALETTE ===
        dark: {
          bg: "#0F0F0F", // Main background
          card: "#1A1A1A", // Card background
          "card-hover": "#1E1E1E", // Card hover state
          border: "#2A2A2A", // Subtle borders
          input: "#1E1E1E", // Input backgrounds
        },
        neon: {
          green: "#00FF87", // Primary neon green
          "green-dark": "#00D97E", // Darker green
          "green-glow": "#00FF8750", // Glow effect
        },
        text: {
          primary: "#FFFFFF", // Main text
          secondary: "#A0A0A0", // Secondary text
          muted: "#707070", // Muted text
        },
      },
      backgroundColor: {
        // Keep old values for compatibility
        "main-bg": "#0F0F0F",
        "main-dark-bg": "#0F0F0F",
        "secondary-dark-bg": "#1A1A1A",
        "light-gray": "#2A2A2A",
        "half-transparent": "rgba(0, 0, 0, 0.7)",
      },
      borderWidth: {
        1: "1px",
      },
      borderColor: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      width: {
        400: "400px",
        760: "760px",
        780: "780px",
        800: "800px",
        1000: "1000px",
        1200: "1200px",
        1400: "1400px",
      },
      height: {
        80: "80px",
      },
      minHeight: {
        590: "590px",
      },
      backgroundImage: {
        "hero-pattern": "url('https://i.ibb.co/MkvLDfb/Rectangle-4389.png')",
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        bounce: "bounce 1s infinite",
        glow: "glow 2s ease-in-out infinite",
        "[shimmer_1.5s_infinite]": "shimmer 1.5s infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
          shimmer: {
            "0%": { transform: "translateX(-100%)" },
            "100%": { transform: "translateX(100%)" },
          },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 255, 135, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(0, 255, 135, 0.6)",
          },
        },
      },
    },
  },
  plugins: [],
};
