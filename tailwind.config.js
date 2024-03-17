/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
      extend: {
        fontFamily: {
          archivo: ['Archivo', 'sans'],
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
            "primary": "#63A375", //main button color and outlines
            "primary-content": "#fefbf6", //Button text, contrasts primary
            "neutral-content": "#fefbf6",
            "secondary": "#F7DB5C", //Underlines some text, different color option to primary
            "secondary-content": "#232322",
            "accent": "#D95D39",  //Some buttons
            "neutral": "#180042",
            "base-content": "#232322", //Base texts
            "base-100": "#DEE3E7", //Background base website colour
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
            "neutral": "#180042",
            "neutral-content": "#fefbf6",
            "base-100": "#1f2937", // Dark gray background
            "base-200": "#374151", // Slightly lighter dark gray
            "base-300": "#4b5563", // Even lighter dark gray
            "base-content": "#F7DB5C", // Light gray text color
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
    },
  };


    //BABDBB Silver, Lighter DEE3E7
    //F7DB5C Yellow
    //232322 Black
    //B09D45 Green/Gold
    //63A375 Chill green
    //D95D39 Cinebar