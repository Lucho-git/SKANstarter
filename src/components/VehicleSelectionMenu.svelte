<script>
  import { createEventDispatcher } from "svelte"
  import { controlStore } from "../stores/controlStore"
  import SVGComponents from "../components/SVG/index.js"

  const dispatch = createEventDispatcher()

  export let showMenu = false
  export let currentVehicleType

  const vehicles = [
    { type: "simpleTractor", color: "red", size: "25px" },
    { type: "pointer", color: "green", size: "45px" },
    { type: "CombineHarvester", color: "yellow", size: "60px" },
    { type: "excavator", color: "orange", size: "50px" },
    { type: "phone", color: "blue", size: "40px" },
    { type: "tractor", color: "green", size: "55px" },
    { type: "WheelLoader", color: "yellow", size: "50px" },
    { type: "WorkCar", color: "red", size: "45px" },
    { type: "Airplane", color: "blue", size: "60px" },
  ]

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
  <div class="flex mb-4" style="height: 30vh;">
    <!-- Left half: Vehicle selection (scrollable) -->
    <div class="w-1/2 pr-2 overflow-y-auto">
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
    </div>

    <!-- Right half: Select Vehicle text at the top and wireframe box -->
    <div class="w-1/2 pl-2 flex flex-col">
      <h2 class="text-2xl font-bold mb-4 text-center">Select Vehicle</h2>
      <div
        class="flex-grow border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center"
      >
        <svelte:component
          this={SVGComponents[selectedVehicle.type]}
          color={selectedVehicle.color}
          size="80px"
        />
        <p class="mt-4 text-center font-semibold">{selectedVehicle.type}</p>
        <p class="text-center text-sm text-gray-500">
          Color: {selectedVehicle.color}
        </p>
      </div>
    </div>
  </div>

  <!-- Underneath section: Cancel and Confirm buttons -->
  <div class="flex mt-4">
    <button class="btn flex-1 mr-2" on:click={cancelSelection}>Cancel</button>
    <button
      class="btn btn-primary flex-1 ml-2"
      on:click={confirmSelection}
      disabled={!hasChanged}
    >
      Confirm
    </button>
  </div>
</div>

<style>
  .btn-circle {
    width: 4rem;
    height: 4rem;
  }
</style>
