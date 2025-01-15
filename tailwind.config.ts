import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
    darkMode: ["class"],
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1500",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border) / <alpha-value>)",
                input: "hsl(var(--input) / <alpha-value>)",
                ring: "hsl(var(--ring) / <alpha-value>)",
                background: "var(--base-100)",
                foreground: "var(--base-content)",
                primary: {
                    DEFAULT: "#63A375",
                    foreground: "#fefbf6",
                },
                secondary: {
                    DEFAULT: "#F7DB5C",
                    foreground: "#232322",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "#D95D39",
                    foreground: "#fefbf6",

                },
                muted: {
                    DEFAULT: "hsl(var(--muted) / <alpha-value>)",
                    foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
                },
                popover: {
                    DEFAULT: "#D95D39",
                    foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
                },
                card: {
                    DEFAULT: "hsl(var(--card) / <alpha-value>)",
                    foreground: "hsl(var(--card-foreground) / <alpha-value>)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["Inter", ...fontFamily.sans],
                archivo: ['Roboto', 'Archivo', 'sans'],
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
                'image-glow': 'image-glow 4100ms 600ms ease-out forwards',
                'fade-in': 'fade-in 1000ms var(--animation-delay, 0ms) ease forwards',
                'fade-up': 'fade-up 1000ms var(--animation-delay, 0ms) ease forwards',
                shimmer: "shimmer 8s infinite",
                marquee: 'marquee var(--duration) infinite linear',
                'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
                "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
                magicslide: "magicslide var(--speed) ease-in-out infinite alternate",
                "gradient": "gradient 8s linear infinite",
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'border-beam': {
                    '100%': {
                        'offset-distance': '100%'
                    }
                },
                'image-glow': {
                    '0%': {
                        opacity: '0',
                        'animation-timing-function': 'cubic-bezier(0.74, 0.25, 0.76, 1)'
                    },
                    '10%': {
                        opacity: '0.7',
                        'animation-timing-function': 'cubic-bezier(0.12, 0.01, 0.08, 0.99)'
                    },
                    '100%': {
                        opacity: '0.4'
                    }
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(-10px)' },
                    to: { opacity: '1', transform: 'none' }
                },
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'none' }
                },
                shimmer: {
                    "0%, 90%, 100%": {
                        "background-position": "calc(-100% - var(--shimmer-width)) 0",
                    },
                    "30%, 60%": {
                        "background-position": "calc(100% + var(--shimmer-width)) 0",
                    },
                },
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(calc(-100% - var(--gap)))' }
                },
                'marquee-vertical': {
                    from: { transform: 'translateY(0)' },
                    to: { transform: 'translateY(calc(-100% - var(--gap)))' }
                },
                "shine-pulse": {
                    "0%": {
                        "background-position": "0% 0%",
                    },
                    "50%": {
                        "background-position": "100% 100%",
                    },
                    to: {
                        "background-position": "0% 0%",
                    },
                },

                "spin-around": {
                    "0%": {
                        transform: "translateZ(0) rotate(0)",
                    },
                    "15%, 35%": {
                        transform: "translateZ(0) rotate(90deg)",
                    },
                    "65%, 85%": {
                        transform: "translateZ(0) rotate(270deg)",
                    },
                    "100%": {
                        transform: "translateZ(0) rotate(360deg)",
                    },
                },
                magicslide: {
                    to: {
                        transform: "translate(calc(100cqw - 100%), 0)",
                    },
                },
                gradient: {
                    to: {
                        "background-position": "200% center",
                    },
                },
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('tailwindcss-animate'),
        require("daisyui")
    ],
    daisyui: {
        themes: [
            {
                skantheme: {
                    "primary": "#63A375",
                    "primary-content": "#fefbf6",
                    "secondary": "#F7DB5C",
                    "secondary-content": "#232322",
                    "accent": "#fde68a",
                    "accent-content": "#fefbf6",
                    "neutral": "#102030",
                    "neutral-content": "#fefbf6",

                    "base-100": "#ffffff",
                    "base-200": "#f8fafc", // Lighter, more subtle gray
                    "base-300": "#f1f5f9", // Slightly darker but still subtle
                    "base-content": "#232322",

                    // Add gradient colors
                    "--gradient-start": "var(--base-200)", // Uses your existing base-200 color
                    "--gradient-end": "var(--base-100)",   // Uses your existing base-100 color

                    "focus": "#FF00FF",
                    "focus-content": "#FFFFFF",
                },
            },
            {
                skanthemedark: {
                    "primary": "#63A375",
                    "primary-content": "#fefbf6",
                    "secondary": "#F7DB5C",
                    "secondary-content": "#232322",
                    "accent": "#D95D39",
                    "accent-content": "#fefbf6",
                    "neutral": "#f9e58a",
                    "neutral-content": "#232322",
                    "base-100": "#1f2937",
                    "base-200": "#374151",
                    "base-300": "#4b5563",
                    "base-content": "#F7DB5C",
                    "info": "#93c5fd",
                    "success": "#a7f3d0",
                    "warning": "#fde68a",
                    "error": "#fca5a5",
                },
            },
            "autumn",
            "light",
            "dark",
            "cupcake",
            "bumblebee",
            "emerald",
            "corporate",
            "synthwave",
            "cyberpunk",
            "valentine",
            "halloween",
            "garden",
            "forest",
            "aqua",
            "lofi",
            "pastel",
            "fantasy",
            "wireframe",
            "black",
            "luxury",
            "dracula",
            "cmyk",
            "business",
            "acid",
            "lemonade",
            "night",
            "coffee",
            "winter",
        ],
        darkTheme: "skanthemedark",
    },
};

export default config;
