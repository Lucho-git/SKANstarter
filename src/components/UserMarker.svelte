<!-- src/components/UserMarker.svelte -->
<script>
  import { userVehicleStore } from "../stores/vehicleStore"
  export let pulseColor = "rgba(172, 172, 230, 0.8)"
  export let pulseSize = "40px"
  export let vehicleSize = "60px"
  export let userVehicle = "harvester"
  export let vehicleColor = "red"
  export let showPulse = true

  const vehicles = {
    harvester: {
      path: "/images/HarvestorUp.png",
      type: "image",
    },
    chaserbin: {
      path: "/images/ChaserBinUp.png",
      type: "image",
    },
    simpleTractor: {
      path: () => import("../components/SVG/SimpleTractor.svelte"),
      type: "svg",
    },
    pointer: {
      path: () => import("../components/SVG/Pointer.svelte"),
      type: "svg",
    },

    CombineHarvester: {
      path: () => import("../components/SVG/CombineHarvester.svelte"),
      type: "svg",
    },

    excavator: {
      path: () => import("../components/SVG/Excavator.svelte"),
      type: "svg",
    },

    tractor: {
      path: () => import("../components/SVG/Tractor.svelte"),
      type: "svg",
    },

    WheelLoader: {
      path: () => import("../components/SVG/WheelLoader.svelte"),
      type: "svg",
    },
    WorkCar: {
      path: () => import("../components/SVG/WorkCar.svelte"),
      type: "svg",
    },
    Airplane: {
      path: () => import("../components/SVG/Airplane.svelte"),
      type: "svg",
    },
  }

  $: vehicle = vehicles[userVehicle] || vehicles.harvester
</script>

<div class="user-marker" style="position: relative; display: inline-block;">
  {#if vehicle.type === "svg"}
    {#await vehicle.path() then VehicleSVGComponent}
      <svelte:component
        this={VehicleSVGComponent.default}
        color={vehicleColor}
        size={vehicleSize}
      />
    {/await}
  {:else}
    <div
      class="vehicle-icon"
      style="
          background-image: url('{vehicle.path}');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          width: {vehicleSize};
          height: {vehicleSize};
          position: relative;
          z-index: 1;
          transform-origin: center;
          transition: transform 0.2s ease-in-out;
        "
    ></div>
  {/if}
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
