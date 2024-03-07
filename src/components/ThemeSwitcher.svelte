<!-- src/components/ThemeSwitcher.svelte -->
<script>
  import { onMount } from "svelte"

  let themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
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
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
  ]
  let selectedTheme = "retro"

  function switchTheme(theme) {
    selectedTheme = theme
    document.documentElement.setAttribute("data-theme", theme)
  }

  onMount(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme)
  })
</script>

<div>
  <label for="theme-select">Select Theme:</label>
  <select
    id="theme-select"
    bind:value={selectedTheme}
    on:change={() => switchTheme(selectedTheme)}
  >
    {#each themes as theme}
      <option value={theme}>{theme}</option>
    {/each}
  </select>
</div>
