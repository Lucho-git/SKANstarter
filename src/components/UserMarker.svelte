<!-- src/components/UserMarker.svelte -->
<script>
  import { userVehicleStore } from "../stores/vehicleStore"
  import SVGComponents from "../components/SVG/index.js"

  export let pulseColor = "rgba(172, 172, 230, 0.8)"
  export let pulseSize = "40px"
  export let vehicleSize = "60px"
  export let userVehicle = "tractor"
  export let vehicleColor = "red"
  export let showPulse = true

  $: vehicle = SVGComponents[userVehicle] || SVGComponents.tractor
</script>

<div class="user-marker" style="position: relative; display: inline-block;">
  <svelte:component this={vehicle} color={vehicleColor} size={vehicleSize} />
  {#if showPulse}
    <div
      class="pulse-circle animate-pulse"
      style="
          width: {pulseSize};
          height: {pulseSize};
          border-radius: 50%;
          background-color: {pulseColor};
          box-shadow: 0 0 0 10px {pulseColor};
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
        "
    ></div>
  {/if}
</div>
