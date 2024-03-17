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
    "skantheme",
    "skanthemedark",
  ]
  let selectedTheme = "skantheme"

  function switchTheme(theme) {
    console.log
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
