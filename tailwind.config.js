/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
          fontFamily: {
            archivo: ['Archivo', 'cursive'],
          },
        },
      },
    plugins: [
      require('@tailwindcss/typography'),
      require("daisyui")
    ],
    daisyui: {
      themes: [
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
        {
          skantheme: {
            "primary": "#63A375", //main button color and outlines
            "primary-content": "#fefbf6", //Button text, contrasts primary
            "neutral-content": "#fefbf6",
            "secondary": "#F7DB5C", //Underlines some text, different color option to primary
            "accent": "#D95D39",  //Some buttons
            "neutral": "#180042",
            "base-content": "#232322", //Base texts
            "base-100": "#DEE3E7", //Background base website colour
            
            "--skan-font": "Archivo, sans-serif", // Add Archivo font for SKAN title
          },
        },
      ],
    },
  };


    //BABDBB Silver, Lighter DEE3E7
    //F7DB5C Yellow
    //232322 Black
    //B09D45 Green/Gold
    //63A375 Chill green
    //D95D39 Cinebar