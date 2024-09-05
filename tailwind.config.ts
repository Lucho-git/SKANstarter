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
                "2xl": "1400px",
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
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
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

                    "base-content": "#232322",
                    "base-100": "#DEE3E7",

                    "focus": "#FF00FF", // Bright magenta
                    "focus-content": "#FFFFFF", // White text for contrast

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
