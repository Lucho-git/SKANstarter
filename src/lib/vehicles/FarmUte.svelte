<script>
  export let bodyColor = "gray"
  export let outlineColor = "white"
  export let wheelColor = "black"
  export let loadColor = "green"
  export let size = "60px"
</script>

<svg
  class="vehicle-svg7"
  version="1.1"
  id="Layer_1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width={size}
  height={size}
  viewBox="0 0 17.645 23.559"
  style="--body-color: {bodyColor}; --outline-color: {outlineColor}; --wheel-color: {wheelColor}; --load-color: {loadColor}; position: relative; z-index: 1; transform-origin: center; transition: transform 0.2s ease-in-out;"
  xml:space="preserve"
>
  <g id="Layer_x0020_1">
    <g id="_562584448">
      <path
        class="customOutline"
        d="M2.77,6.847L3.649,0.98l0.028-0.255l0.085-0.51h0.51h0.227h8.617h0.227h0.51l0.085,0.51l0.028,0.255
			l0.879,5.868v0.028v0.057v0.028l2.013,1.701l0.454,0.369l-0.369,0.454l-0.369,0.454l-0.369,0.454l-0.454-0.397l-0.907-0.737v0.822
			v0.567v3.742v8.079v0.283v0.595H14.25h-0.283H3.649H3.365H2.77V22.75v-0.283v-8.079v-3.742v-0.567V9.257L1.863,9.994l-0.454,0.397
			L1.041,9.937L0.672,9.483L0.304,9.03l0.454-0.369L2.77,6.961V6.932V6.876V6.847z M4.782,1.405L3.96,7.017v0.227v0.283v0.454l0,0
			v2.098v0.567v3.742v7.767h9.694v-7.767v-3.742v-0.567V7.981l0,0V7.528V7.244V7.017l-0.822-5.613H4.782z"
      />
      <path
        d="M3.365,22.466V6.989V6.961V6.932l0.879-5.868l0.028-0.255h0.227h8.617h0.227l0.028,0.255l0.879,5.868v0.028v0.028v15.477
			v0.283h-0.283H3.649H3.365V22.466z M3.932,7.017v15.165h9.751V7.017l-0.822-5.641H4.754L3.932,7.017z"
      />
      <path
        d="M3.365,14.104v-3.742v-0.283h0.283h10.318h0.283v0.283v3.742v0.283h-0.283H3.649H3.365V14.104z M3.932,10.646v3.175h9.751
			v-3.175H3.932z"
      />
      <path
        d="M3.365,10.362V8.265V7.981h0.283h10.318h0.283v0.283v2.098v0.283h-0.283H3.649H3.365V10.362z M3.932,8.548v1.531h9.751
			V8.548H3.932z"
      />
      <polygon points="1.126,9.115 3.479,7.159 3.819,7.584 1.494,9.54 		" />
      <polygon points="16.121,9.54 13.797,7.584 14.137,7.159 16.49,9.115 		" />
      <polygon points="7.957,3.191 7.135,6.45 6.568,6.309 7.419,3.049 		" />
      <polygon points="10.338,3.049 11.189,6.309 10.622,6.45 9.8,3.191 		" />
      <polygon
        class="customBody"
        points="3.932,22.183 13.683,22.183 13.683,14.387 3.932,14.387 		"
      />
      <polygon
        class="customBody"
        points="3.932,13.82 13.683,13.82 13.683,10.646 3.932,10.646 		"
      />
      <path
        class="customBody"
        d="M6.568,6.309l0.85-3.26l0.539,0.142L7.135,6.45L6.568,6.309z M3.932,7.981h9.751V7.017l-0.822-5.641H4.754
			L3.932,7.017V7.981z M10.622,6.45L9.8,3.191l0.539-0.142l0.85,3.26L10.622,6.45z"
      />

      <polygon
        class="customWindow"
        points="13.683,8.548 3.932,8.548 3.932,10.079 13.683,10.079 		"
      />
    </g>
  </g>
</svg>

<style>
  .vehicle-svg7 :global(.customOutline) {
    fill: var(--outline-color);
  }
  .vehicle-svg7 :global(.customBody) {
    fill: var(--body-color);
  }
  .vehicle-svg7 :global(.customWheel) {
    fill: var(--wheel-color);
  }
  .vehicle-svg7 :global(.customLoad) {
    fill: var(--load-color);
  }

  .vehicle-svg7 :global(.customWindow) {
    fill: #cccccc;
  }
</style>
