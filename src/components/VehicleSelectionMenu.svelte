<script>
  import { createEventDispatcher } from "svelte"
  import { controlStore } from "../stores/controlStore"
  import SVGComponents from "$lib/vehicles/index.js"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"

  const dispatch = createEventDispatcher()

  export let showMenu = false
  export let currentVehicleType
  export let currentVehicleSize
  export let currentVehicleColor

  let usedColors = []
  let usedSizes = []

  const sizeMappings = {
    Small: "30px",
    Medium: "45px",
    Large: "60px",
  }

  const reverseSizeMappings = Object.fromEntries(
    Object.entries(sizeMappings).map(([k, v]) => [v, k]),
  )

  $: vehicles = [
    { type: "SimpleTractor", color: "red", size: "small" },
    { type: "Pointer", color: "green", size: "medium" },
    { type: "CombineHarvester", color: "yellow", size: "large" },
    { type: "Excavator", color: "orange", size: "medium" },
    { type: "Tractor", color: "green", size: "large" },
    { type: "WheelLoader", color: "yellow", size: "medium" },
    { type: "WorkCar", color: "red", size: "medium" },
    { type: "Airplane", color: "blue", size: "large" },
    { type: "FourWheelDriveTractor", color: "green", size: "large" },
    { type: "TowBetweenSeeder", color: "red", size: "medium" },
  ]

  $: initialVehicle =
    vehicles.find((v) => v.type === currentVehicleType) || vehicles[0]

  $: selectedVehicle = { ...initialVehicle }

  let isMobile = false
  let isColorSelectionMode = false

  const colors = ["Red", "Blue", "Green", "Yellow", "Orange", "Purple"]
  const sizeOptions = ["Small", "Medium", "Large"]

  $: currentSizeIndex = sizeOptions.indexOf(selectedVehicle.size)

  let startX = 0
  let startY = 0

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 640
    }
    checkMobile()

    window.addEventListener("resize", checkMobile)

    // Randomize vehicle colors and sizes
    vehicles = vehicles.map((vehicle) => {
      if (vehicle.type === currentVehicleType) {
        return {
          ...vehicle,
          size: reverseSizeMappings[currentVehicleSize] || "medium",
          color: currentVehicleColor,
        }
      }
      return {
        ...vehicle,
        color: cycleRandomItems(colors, usedColors),
        size: cycleRandomItems(sizeOptions, usedSizes),
      }
    })

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  })

  function selectVehicle(vehicle) {
    selectedVehicle = { ...vehicle }
  }

  function confirmSelection() {
    toast.success(
      `Selected Vehicle: [${selectedVehicle.color} ${selectedVehicle.type}]`,
    )

    dispatch("vehicleSelected", {
      ...selectedVehicle,
      size: sizeMappings[selectedVehicle.size],
    })

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

  function cycleSize(direction = 1) {
    currentSizeIndex =
      (currentSizeIndex + direction + sizeOptions.length) % sizeOptions.length
    selectedVehicle = {
      ...selectedVehicle,
      size: sizeOptions[currentSizeIndex],
    }
  }

  function getSizeInPixels(size) {
    switch (size) {
      case "Small":
        return "60px"
      case "Medium":
        return "80px"
      case "Large":
        return "100px"
    }
  }

  function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  function cycleRandomItems(array, usedItems) {
    const availableItems = array.filter((item) => !usedItems.includes(item))
    if (availableItems.length === 0) {
      usedItems.length = 0
      return getRandomItem(array)
    }
    const selectedItem = getRandomItem(availableItems)
    usedItems.push(selectedItem)
    return selectedItem
  }
  function handleTouchStart(event) {
    startX = event.touches[0].clientX
    startY = event.touches[0].clientY
  }

  function handleTouchEnd(event) {
    const endX = event.changedTouches[0].clientX
    const endY = event.changedTouches[0].clientY
    handleSwipe(startX - endX, startY - endY)
  }

  function handleMouseDown(event) {
    startX = event.clientX
    startY = event.clientY
  }

  function handleMouseUp(event) {
    const endX = event.clientX
    const endY = event.clientY
    handleSwipe(startX - endX, startY - endY)
  }

  function handleSwipe(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 50) {
        cycleSize(1) // Swipe left
      } else if (deltaX < -50) {
        cycleSize(-1) // Swipe right
      }
    }
  }

  $: hasChanged =
    selectedVehicle.type !== initialVehicle.type ||
    selectedVehicle.color !== initialVehicle.color ||
    selectedVehicle.size !== initialVehicle.size
</script>

<div
  class="fixed bottom-0 left-0 right-0 z-20 flex transform flex-col rounded-t-lg bg-white p-4 shadow-lg transition-transform duration-300 sm:p-6"
  class:translate-y-full={!showMenu}
  class:translate-y-0={showMenu}
  style={isMobile ? "height: 100%;" : "height: 45vh;"}
>
  <div class="flex flex-grow flex-col overflow-hidden sm:flex-row">
    <!-- Vehicle/Color selection (scrollable) -->
    <div
      class="flex w-full flex-grow flex-col overflow-hidden sm:w-1/2 sm:pr-3"
    >
      <div
        class="flex w-full overflow-hidden rounded-t-lg border-2 border-b-0 border-gray-300"
      >
        <a
          role="tab"
          class="flex-1 py-3 text-center text-lg font-semibold transition-colors duration-200 {!isColorSelectionMode
            ? 'border-b-2 border-transparent bg-white'
            : 'bg-blue-200 hover:bg-blue-300'}"
          on:click={() => toggleSelectionMode("vehicle")}
        >
          Vehicles
        </a>
        <a
          role="tab"
          class="flex-1 py-3 text-center text-lg font-semibold transition-colors duration-200 {isColorSelectionMode
            ? 'border-b-2 border-transparent bg-white'
            : 'bg-blue-200 hover:bg-blue-300'}"
          on:click={() => toggleSelectionMode("color")}
        >
          Colors
        </a>
      </div>
      <div
        class="flex h-full flex-grow flex-col overflow-hidden rounded-b-lg border-2 border-t-0 border-gray-300 bg-white p-4"
      >
        <div class="flex-grow overflow-y-auto">
          {#if isColorSelectionMode}
            <div
              class="grid grid-cols-4 content-start justify-items-center gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6"
            >
              {#each colors as color}
                <button
                  class="btn btn-circle border-8 transition-all duration-200"
                  style="background-color: {color}; border-color: {selectedVehicle.color ===
                  color
                    ? 'black'
                    : color};"
                  on:click={() => selectColor(color)}
                ></button>
              {/each}
            </div>
          {:else}
            <div
              class="grid grid-cols-3 content-start justify-items-center gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6"
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
                    size={sizeMappings[vehicle.size]}
                  />
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Vehicle display box -->
    <div class="mt-4 flex w-full flex-col sm:mt-0 sm:w-1/2 sm:pl-3">
      <h2 class="mb-4 text-center text-2xl font-bold">Selected Vehicle</h2>
      <button
        class="flex flex-grow flex-col items-center justify-center rounded-lg border-2 border-gray-300 p-4 transition-all duration-300 hover:bg-gray-100 active:bg-gray-200"
        on:click={() => cycleSize(1)}
        on:touchstart={handleTouchStart}
        on:touchend={handleTouchEnd}
        on:mousedown={handleMouseDown}
        on:mouseup={handleMouseUp}
      >
        <svelte:component
          this={SVGComponents[selectedVehicle.type]}
          color={selectedVehicle.color}
          size={getSizeInPixels(selectedVehicle.size)}
        />
        <p class="mt-2 text-center font-semibold sm:mt-4">
          {selectedVehicle.type}
        </p>
        <p class="text-center text-xs text-gray-500 sm:text-sm">
          Color: {selectedVehicle.color}
        </p>
        <p class="text-center text-xs text-gray-500 sm:text-sm">
          Size: {selectedVehicle.size}
        </p>
        <div class="mt-2 flex items-center space-x-3">
          {#each sizeOptions as size, index}
            <div
              class="rounded-full border-2 transition-all duration-200"
              class:bg-blue-500={index === currentSizeIndex}
              class:border-blue-500={index === currentSizeIndex}
              class:bg-gray-300={index !== currentSizeIndex}
              class:border-gray-300={index !== currentSizeIndex}
              style="width: {8 + index * 4}px; height: {8 + index * 4}px;"
            ></div>
          {/each}
        </div>
      </button>
    </div>
  </div>

  <!-- Underneath section: Cancel and Confirm buttons -->
  <div class="mt-4 flex">
    <button class="btn mr-2 flex-1" on:click={cancelSelection}>Cancel</button>
    <button
      class="btn btn-primary ml-2 flex-1"
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
