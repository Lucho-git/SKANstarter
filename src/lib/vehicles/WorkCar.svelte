<!-- WorkCar.svelte -->
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
  viewBox="0 0 23.9 56.3"
  fill={bodyColor}
  style="position: relative; z-index: 1; transform-origin: center; transition: transform 0.2s ease-in-out;"
  stroke="black"
  stroke-width=".6"
>
  <path
    d="M16,1.5l3.4,0.8L21,4.2h-0.8L19,2.8l-1.6-0.4l0,0.5l2.3,1.4h1.4l0.4,0.4l0.2,1.5l0.7,1v8.5l-0.3,0.7v2.2
	l0.9,1.3l0.1,1.3l-0.6,0.4l-0.6-0.7l-0.3,32.2l-0.9,1.9h-1.4c0-7.6,0-18.4,0-26c-4.9,0-9.8,0-14.8,0c0,7.6,0,18.4,0,26H3.1l-0.9-1.9
	L1.9,20.8l-0.6,0.7l-0.6-0.4l0.1-1.3l0.9-1.3v-2.2l-0.3-0.7l0-8.5l0.7-1l0.2-1.5l0.4-0.4H4l2.3-1.4l0-0.5L4.7,2.8L3.5,4.2H2.7
	l1.6-1.8l3.4-0.8C10.5,1.5,13.3,1.5,16,1.5L16,1.5z M19.1,54.9H4.6v-1.1l0.7,0l0-24.4h0.6v24.5l0.6,0l0-24.5h0.6v24.5l0.7,0l0-24.5
	h0.6v24.5l0.6,0l0-24.5h0.6v24.5l0.6,0V29.3H11v24.5h0.6V29.3h0.6v24.5h0.7l0-24.5h0.6v24.5l0.6,0V29.3h0.6v24.5h0.7V29.3h0.6v24.5
	l0.6,0V29.3h0.6v24.5H18V29.3h0.6v24.4l0.5,0L19.1,54.9L19.1,54.9z M18.2,19.2l0.9-0.7l0.8-2.6c0,0-0.5-0.5-2.1-0.9
	c-1.9-0.5-9.8-0.5-11.8,0c-1.5,0.4-2.1,0.9-2.1,0.9l0.8,2.6l0.9,0.7C10,19.1,13.7,19.1,18.2,19.2L18.2,19.2z M3.6,26.5v-4
	c0-2.5,0-4.3-0.5-5.5l-0.2,0.9l0,9.1L3.6,26.5z M20.2,26.5l0-4c0-2.5,0-4.3,0.5-5.5l0.2,0.9l0,9.1L20.2,26.5z"
  />
</svg>
