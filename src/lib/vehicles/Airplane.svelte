<!-- Airplane.svelte -->
<script>
  export let bodyColor = "gray"
  export let outlineColor = "white"
  export let wheelColor = "black"
  export let loadColor = "green"
  export let size = "60px"
</script>

<svg
  class="vehicle-icon"
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 85.7 91.6"
  fill={bodyColor}
  style="position: relative; z-index: 1; transform-origin: center; transition: transform 0.2s ease-in-out;"
  stroke="black"
  stroke-width="2"
>
  <g>
    <path
      d="M7.3,50.4c-1.3,1-2.9,3-3.4,4.6L1.8,61c-0.5,1.6,0.3,2.4,1.9,1.9l27.8-9c-0.8-5.9-1.5-12.4-2.2-19.5L7.3,50.4L7.3,50.4z"
    />
    <path
      d="M81.5,55c-0.5-1.6-2.1-3.6-3.4-4.6L56.1,34.5c-0.7,7.1-1.4,13.6-2.2,19.5l27.8,9c1.6,0.5,2.4-0.4,1.9-1.9L81.5,55L81.5,55z
		"
    />
    <path
      d="M34.9,76.1l-8.6,6.2c-1.6,1.2-3.1,3.4-3.6,5.3c-0.5,1.6,0.3,2.4,1.9,1.9l12.2-3.9c0,0,0-0.1,0-0.1
		C36.7,85.5,35.9,82.1,34.9,76.1L34.9,76.1z"
    />
    <path
      d="M48.7,85.6l12.2,3.9c1.6,0.5,2.4-0.4,1.9-1.9c-0.5-1.9-2.1-4.1-3.6-5.3l-8.6-6.2C49.4,82.2,48.7,85.4,48.7,85.6L48.7,85.6z
		"
    />
    <path
      d="M45.1,3.5c-1.7-1.4-4.2-1.3-5.8,0.3c-3.1,3.1-8.8,10.8-7.1,29.8c2.8,30.5,7.5,51.3,7.5,51.3c1,3.8,5.1,3.9,6.1,0
		c0,0,4.6-20.8,7.5-51.3C55,13.9,48.5,6.3,45.1,3.5L45.1,3.5z M49.3,15.7c-0.6,0.6-1.5,0.6-2.1,0c-2.8-2.7-5.7-2.7-9.1,0.1
		c-0.6,0.5-1.6,0.4-2.1-0.2c-0.5-0.6-0.4-1.6,0.2-2.1c5.9-4.7,10.4-2.5,13.1,0.1C49.9,14.2,49.9,15.1,49.3,15.7L49.3,15.7z"
    />
  </g>
</svg>
