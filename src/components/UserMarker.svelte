<!-- src/components/UserMarker.svelte -->
<script>
  import { userVehicleStore } from "../stores/mapStore"

  export let pulseColor = "rgba(172, 172, 230, 0.8)"
  export let pulseSize = "40px"
  export let vehicleSize = "60px"
  export let userVehicle = "harvester"

  userVehicleStore.subscribe((value) => {
    userVehicle = value
  })

  const vehicleImages = {
    harvester: "/images/HarvestorUp.png",
    chaserbin: "/images/ChaserBinUp.png",
  }

  $: vehicleImage = vehicleImages[userVehicle] || "/images/HarvestorUp.png"
</script>

<div class="user-marker" style="position: relative; display: inline-block;">
  <div
    class="vehicle-icon"
    style="
        background-image: url('{vehicleImage}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        width: {vehicleSize};
        height: {vehicleSize};
        position: relative;
        z-index: 1;
        transform-origin: center;
      "
  ></div>
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
      "
  ></div>
</div>
