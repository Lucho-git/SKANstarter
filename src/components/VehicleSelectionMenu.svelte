<script>
  import { createEventDispatcher } from "svelte"
  import { controlStore } from "../stores/controlStore"
  import SVGComponents from "../components/SVG/index.js"
  import { onMount } from "svelte"

  const dispatch = createEventDispatcher()

  export let showMenu = false
  export let currentVehicleType

  const vehicles = [
    { type: "simpleTractor", color: "red", size: "25px" },
    { type: "pointer", color: "green", size: "45px" },
    { type: "CombineHarvester", color: "yellow", size: "60px" },
    { type: "excavator", color: "orange", size: "50px" },
    { type: "tractor", color: "green", size: "55px" },
    { type: "WheelLoader", color: "yellow", size: "50px" },
    { type: "WorkCar", color: "red", size: "45px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
    { type: "Airplane", color: "blue", size: "60px" },
  ]

  $: initialVehicle =
    vehicles.find((v) => v.type === currentVehicleType) || vehicles[0]
  $: selectedVehicle = initialVehicle

  let isMobile = false

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 640 // Adjust this breakpoint as needed
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  })

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
  class="fixed left-0 right-0 bottom-0 bg-white shadow-lg rounded-t-lg p-4 sm:p-6 z-20 transform transition-transform duration-300 overflow-y-auto"
  class:translate-y-full={!showMenu}
  class:translate-y-0={showMenu}
  style={isMobile ? "height: 100%;" : "max-height: 45vh;"}
>
  <h2 class="text-2xl font-bold mb-4 text-center sm:hidden">Select Vehicle</h2>
  <div class="flex flex-col sm:flex-row h-full">
    <!-- Vehicle selection (scrollable) -->
    <div class="w-full sm:w-1/2 sm:pr-3 mb-4 sm:mb-0 flex-grow sm:flex-grow-0">
      <div
        class="border-2 border-gray-300 rounded-lg p-4 h-full flex flex-col"
        style="max-height: 30vh;"
      >
        <div class="overflow-y-auto flex-grow">
          <div
            class="grid grid-cols-3 gap-4 justify-items-center content-start"
          >
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
      </div>
    </div>

    <!-- Select Vehicle text at the top and wireframe box -->
    <div class="w-full sm:w-1/2 sm:pl-3 flex flex-col">
      <h2 class="text-2xl font-bold mb-4 text-center hidden sm:block">
        Select Vehicle
      </h2>
      <div
        class="flex-grow border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center"
      >
        <svelte:component
          this={SVGComponents[selectedVehicle.type]}
          color={selectedVehicle.color}
          size={isMobile ? "60px" : "80px"}
        />
        <p class="mt-2 sm:mt-4 text-center font-semibold">
          {selectedVehicle.type}
        </p>
        <p class="text-center text-xs sm:text-sm text-gray-500">
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

  @media (max-width: 640px) {
    .btn-circle {
      width: 3rem;
      height: 3rem;
    }
  }
</style>
