<script>
  export let bodyColor = "gray"
  export let outlineColor = "white"
  export let wheelColor = "black"
  export let loadColor = "green"
  export let size = "60px"
</script>

<svg
  class="vehicle-svg23"
  version="1.1"
  id="Layer_1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width={size}
  height={size}
  viewBox="0 0 34.461 26.873"
  style="--body-color: {bodyColor}; --outline-color: {outlineColor}; --wheel-color: {wheelColor}; --load-color: {loadColor}; position: relative; z-index: 1; transform-origin: center; transition: transform 0.2s ease-in-out;"
  xml:space="preserve"
>
  <style type="text/css">
    .customOutline {
      fill: blue;
    }
    .customWheel {
      fill-rule: evenodd;
      clip-rule: evenodd;
    }
    .customBody {
      fill-rule: evenodd;
      clip-rule: evenodd;
      fill: yellow;
    }
  </style>
  <g id="Layer_x0020_1">
    <g id="_562573744">
      <path
        class="customOutline"
        d="M10.209,15.506h2.268h0.34v-1.843h-0.34h-2.268H9.614v-0.595V4.989V4.394h0.595h0.68V3.345V3.062V2.466h0.624
			h0.283h2.381V2.07H0.883H0.288V1.474V0.907V0.312h0.595h13.89h4.819h13.89h0.595v0.595v0.567V2.07h-0.595H20.187v0.397h2.409
			h0.283h0.595v0.595v0.283v1.049h0.68h0.595v0.595v8.079v0.595h-0.595h-2.268h-0.34v1.843h0.34h2.268h0.595v0.624v8.079v0.595
			h-0.595h-2.268h-0.595v-0.595v-3.175h-0.34v4.649v0.283v0.595h-0.595h-0.283h-5.783h-0.283h-0.595v-0.595v-0.283v-4.649h-0.34
			v3.175v0.595h-0.595h-2.268H9.614v-0.595v-8.079v-0.624H10.209z M18.996,3.685H18.94h-0.227h-3.061h-0.227h-0.057h-0.539h-0.057
			h-2.665v1.304v0.624h-0.595h-0.68v6.86h1.049v-0.425v-0.595h0.595h0.935h0.595v0.595v7.795h0.624v0.595v4.932h5.102v-4.932v-0.595
			h0.624v-7.795v-0.595h0.595h0.935h0.595v0.595v0.425h1.049v-6.86H22.88h-0.624V4.989V3.685h-2.665h-0.057H18.996z M16.048,2.07
			v0.397h2.268V2.07H16.048z M11.881,16.725h-1.049v6.86h1.049v-3.118v-0.028v-0.567v-0.028V16.725z M22.483,19.871v0.567v0.028
			v3.118h1.049v-6.86h-1.049v3.118V19.871z"
      />
      <rect
        x="10.209"
        y="4.991"
        class="customWheel"
        width="2.251"
        height="8.076"
      />
      <rect
        x="21.888"
        y="4.991"
        class="customWheel"
        width="2.251"
        height="8.076"
      />
      <rect
        x="11.796"
        y="3.373"
        class="customBody"
        width="10.8"
        height="8.391"
      />
      <path
        d="M11.513,11.764V3.345V3.062h0.283h10.8h0.283v0.283v8.419v0.283h-0.283h-10.8h-0.283V11.764z M12.08,3.629v7.852h10.233
			V3.629H12.08z"
      />
      <rect
        x="10.209"
        y="16.132"
        class="customWheel"
        width="2.251"
        height="8.076"
      />
      <rect
        x="21.888"
        y="16.132"
        class="customWheel"
        width="2.251"
        height="8.076"
      />
      <rect
        x="13.696"
        y="11.764"
        class="customBody"
        width="6.973"
        height="8.391"
      />
      <path
        d="M13.412,20.155v-8.391v-0.283h0.283h6.973h0.283v0.283v8.391v0.283h-0.283h-6.973h-0.283V20.155z M13.979,12.047v7.824
			h6.406v-7.824H13.979z"
      />
      <rect
        x="14.291"
        y="20.155"
        class="customBody"
        width="5.754"
        height="5.528"
      />
      <path
        d="M14.007,25.682v-5.528v-0.283h0.283h5.783h0.283v0.283v5.528v0.283h-0.283h-5.783h-0.283V25.682z M14.574,20.438v4.961
			h5.216v-4.961H14.574z"
      />
      <path
        d="M14.773,3.345V1.191V0.907h0.283h4.252h0.283v0.283v2.154v0.283h-0.283h-4.252h-0.283V3.345z M15.34,1.474v1.587h3.685
			V1.474H15.34z"
      />
      <polygon points="0.883,0.907 33.481,0.907 33.481,1.474 0.883,1.474 		" />
      <circle class="customWheel" cx="17.182" cy="4.989" r="0.539" />
      <polygon
        points="12.477,19.871 21.888,19.871 21.888,20.438 12.477,20.438 		"
      />
    </g>
  </g>
</svg>

<style>
  .vehicle-svg23 :global(.customOutline) {
    fill: var(--outline-color);
  }
  .vehicle-svg23 :global(.customBody) {
    fill: var(--body-color);
  }
  .vehicle-svg23 :global(.customWheel) {
    fill: var(--wheel-color);
  }
  .vehicle-svg23 :global(.customLoad) {
    fill: var(--load-color);
  }
</style>
