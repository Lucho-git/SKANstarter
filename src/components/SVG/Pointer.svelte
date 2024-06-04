<!-- Pointer.svelte -->
<script>
  export let color = "red"
  export let size = "60px"
</script>

<svg
  class="vehicle-icon"
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill={color}
  style="position: relative; z-index: 1; transform-origin: center; transition: transform 0.2s ease-in-out;"
  stroke="white"
  stroke-width=".2"
>
  <path
    d="M20 20a.94.94 0 0 1-.55-.17l-6.9-4.56a1 1 0 0 0-1.1 0l-6.9 4.56a1 1 0 0 1-1.44-1.28l8-16a1 1 0 0 1 1.78 0l8 16a1 1 0 0 1-.23 1.2A1 1 0 0 1 20 20z"
  />
</svg>
