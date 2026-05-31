import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-gold': 'var(--gradient-gold)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'gold': 'var(--shadow-gold)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--transition-smooth)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-20px) translateX(10px)" },
        },
        "glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "hop": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
        "gradient-shift": {
          "0%, 100%": { 
            backgroundPosition: "0% 50%",
            backgroundSize: "200% 200%"
          },
          "50%": { 
            backgroundPosition: "100% 50%",
            backgroundSize: "200% 200%"
          },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.5" },
        },
        "blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "float-up": {
          "0%": { 
            transform: "translateY(100vh) rotate(0deg)",
            opacity: "0"
          },
          "10%": {
            opacity: "0.4"
          },
          "90%": {
            opacity: "0.4"
          },
          "100%": { 
            transform: "translateY(-100vh) rotate(360deg)",
            opacity: "0"
          },
        },
        "slide-right": {
          "0%": {
            transform: "translateX(-100%)"
          },
          "100%": {
            transform: "translateX(100%)"
          },
        },
        "slide-left": {
          "0%": {
            transform: "translateX(100%)"
          },
          "100%": {
            transform: "translateX(-100%)"
          },
        },
        "sparkle": {
          "0%, 100%": {
            opacity: "0",
            transform: "scale(0)"
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.5)"
          },
        },
        "hero-kenburns": {
          "0%": { transform: "scale(1.05) translate3d(0,0,0)" },
          "100%": { transform: "scale(1.18) translate3d(-1.5%, -1%, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-up": "float-up 20s linear infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "slide-right": "slide-right 8s linear infinite",
        "slide-left": "slide-left 8s linear infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "float-delayed": "float-delayed 4s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "hop": "hop 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "blink": "blink 1s step-start infinite",
        "hero-kenburns": "hero-kenburns 6s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
