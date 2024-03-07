/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("daisyui")
  ],
  daisyui: {
    themes:  ["autumn","light", "dark","cupcake","bumblebee","emerald","corporate","synthwave","retro","cyberpunk","valentine","halloween","garden","forest","aqua","lofi","pastel","fantasy","wireframe","black","luxury","dracula","cmyk","business","acid","lemonade","night","coffee","winter"],
  }
}


// {
//     saasstartertheme: {
//       "primary": "#180042",
//       "primary-content": "#fefbf6",
//       "neutral-content": "#fefbf6",
//       "secondary": "#c7b9f8",
//       "accent": "#db2777",
//       "neutral": "#180042",
//       "base-content": "#180042",
//       "base-100": "#fefbf6",
//     },
//   }