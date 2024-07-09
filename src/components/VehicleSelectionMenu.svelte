<script>
  import { createEventDispatcher } from "svelte"
  import { controlStore } from "../stores/controlStore"
  import SVGComponents from "../components/SVG/index.js"

  const dispatch = createEventDispatcher()

  export let showMenu = false
  export let currentVehicleType // New prop for the current vehicle type

  const vehicles = [
    { type: "simpleTractor", color: "red", size: "25px" },
    { type: "pointer", color: "green", size: "45px" },
    { type: "CombineHarvester", color: "yellow", size: "60px" },
    { type: "excavator", color: "orange", size: "50px" },
    { type: "tractor", color: "green", size: "55px" },
    { type: "WheelLoader", color: "yellow", size: "50px" },
    { type: "WorkCar", color: "red", size: "45px" },
    { type: "Airplane", color: "blue", size: "60px" },
  ]

  // Find the initial vehicle based on the currentVehicleType
  $: initialVehicle =
    vehicles.find((v) => v.type === currentVehicleType) || vehicles[0]
  $: selectedVehicle = initialVehicle

  function selectVehicle(vehicle) {
    selectedVehicle = vehicle
  }

  function confirmSelection() {
    dispatch("vehicleSelected", selectedVehicle)
    dispatch("closeMenu")
  }

  function cancelSelection() {
    dispatch("closeMenu")
  }

  $: hasChanged = selectedVehicle.type !== initialVehicle.type
</script>

<div
  class="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-6 z-20 transform transition-transform duration-300"
  class:translate-y-full={!showMenu}
  class:translate-y-0={showMenu}
>
  <h2 class="text-2xl font-bold mb-4">Select Vehicle</h2>
  <div class="grid grid-cols-3 gap-4">
    {#each vehicles as vehicle}
      <button
        class="btn btn-circle {selectedVehicle.type === vehicle.type
          ? 'btn-primary'
          : ''}"
        on:click={() => selectVehicle(vehicle)}
      >
        <svelte:component
          this={SVGComponents[vehicle.type]}
          color={vehicle.color}
          size={vehicle.size}
        />
      </button>
    {/each}
  </div>
  <div class="mt-4 flex justify-end space-x-2">
    <button class="btn" on:click={cancelSelection}>Cancel</button>
    <button
      class="btn btn-primary"
      on:click={confirmSelection}
      disabled={!hasChanged}
    >
      Confirm
    </button>
  </div>
</div>
