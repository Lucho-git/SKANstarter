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
  ]

  $: initialVehicle =
    vehicles.find((v) => v.type === currentVehicleType) || vehicles[0]
  $: selectedVehicle = initialVehicle

  let isMobile = false
  let isColorSelectionMode = false

  const colors = ["red", "blue", "green", "yellow", "orange", "purple"]

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 640
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

  function toggleSelectionMode(mode) {
    isColorSelectionMode = mode === "color"
  }

  function selectColor(color) {
    selectedVehicle = { ...selectedVehicle, color }
  }

  $: hasChanged =
    selectedVehicle.type !== initialVehicle.type ||
    selectedVehicle.color !== initialVehicle.color
</script>

<div
  class="fixed left-0 right-0 bottom-0 bg-white shadow-lg rounded-t-lg p-4 sm:p-6 z-20 transform transition-transform duration-300 flex flex-col"
  class:translate-y-full={!showMenu}
  class:translate-y-0={showMenu}
  style={isMobile ? "height: 100%;" : "height: 45vh;"}
>
  <div class="flex flex-col sm:flex-row flex-grow overflow-hidden">
    <!-- Vehicle/Color selection (scrollable) -->
    <div
      class="w-full sm:w-1/2 sm:pr-3 flex-grow overflow-hidden flex flex-col"
    >
      <div
        class="flex w-full border-2 border-b-0 border-gray-300 rounded-t-lg overflow-hidden"
      >
        <a
          role="tab"
          class="flex-1 py-3 text-center transition-colors duration-200 font-semibold text-lg {!isColorSelectionMode
            ? 'bg-white border-b-2 border-transparent'
            : 'bg-green-200 hover:bg-green-300'}"
          on:click={() => toggleSelectionMode("vehicle")}
        >
          Vehicles
        </a>
        <a
          role="tab"
          class="flex-1 py-3 text-center transition-colors duration-200 font-semibold text-lg {isColorSelectionMode
            ? 'bg-white border-b-2 border-transparent'
            : 'bg-green-200 hover:bg-green-300'}"
          on:click={() => toggleSelectionMode("color")}
        >
          Colors
        </a>
      </div>
      <div
        class="border-2 border-t-0 border-gray-300 rounded-b-lg p-4 h-full flex flex-col overflow-hidden flex-grow bg-white"
      >
        <div class="overflow-y-auto flex-grow">
          {#if isColorSelectionMode}
            <div
              class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 justify-items-center content-start"
            >
              {#each colors as color}
                <button
                  class="btn btn-circle border-4 transition-all duration-200"
                  style="background-color: {color}; border-color: {selectedVehicle.color ===
                  color
                    ? 'white'
                    : color};"
                  on:click={() => selectColor(color)}
                ></button>
              {/each}
            </div>
          {:else}
            <div
              class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 justify-items-center content-start"
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
          {/if}
        </div>
      </div>
    </div>

    <!-- Vehicle display box -->
    <div class="w-full sm:w-1/2 sm:pl-3 flex flex-col mt-4 sm:mt-0">
      <h2 class="text-2xl font-bold mb-4 text-center">Selected Vehicle</h2>
      <div
        class="flex-grow border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-300 hover:bg-gray-100 active:bg-gray-200"
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
    width: 5rem;
    height: 5rem;
  }

  @media (max-width: 640px) {
    .btn-circle {
      width: 5rem;
      height: 5rem;
    }
  }
</style>
