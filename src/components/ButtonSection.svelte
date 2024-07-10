<!-- src/components/ButtonSection.svelte -->
<script>
  import { createEventDispatcher, beforeUpdate, afterUpdate } from "svelte"
  import { mapStore } from "../stores/mapStore"
  import { userVehicleStore, userVehicleTrailing } from "../stores/vehicleStore"
  import { antLineConfigStore } from "../stores/trailDataStore"
  import { controlStore } from "../stores/controlStore"

  import { browser } from "$app/environment"
  import { onMount } from "svelte"
  import VehicleSelectionMenu from "./VehicleSelectionMenu.svelte"
  import SVGComponents from "../components/SVG/index.js"
  import GridColorPicker from "../components/GridColorPicker.svelte"
  let showGridPicker = false
  let gridSelectedColor = "#FF0000"

  function toggleGridColorPicker() {
    showGridPicker = !showGridPicker
    console.log("showGridPicker:", showGridPicker)
  }

  function handleColorSelected(event) {
    gridSelectedColor = event.detail
    // Removed: showGridPicker = false;
  }

  let LottiePlayer

  onMount(async () => {
    if (browser) {
      const module = await import("@lottiefiles/svelte-lottie-player")
      LottiePlayer = module.LottiePlayer
    }
  })

  export let isSatelliteView = true
  let isVehicleMenuOpen = false
  let VehicleIcon

  $: {
    if (
      $userVehicleStore.vehicle_marker &&
      $userVehicleStore.vehicle_marker.type
    ) {
      VehicleIcon =
        SVGComponents[$userVehicleStore.vehicle_marker.type] ||
        SVGComponents.simpleTractor
    }
  }

  const dispatch = createEventDispatcher()

  const DEFAULT_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"
  const DEFAULT_OUTDOORS_STYLE = "mapbox://styles/mapbox/outdoors-v12"

  function toggleTrailing() {
    userVehicleTrailing.update((value) => {
      const newValue = !value
      console.log("Toggling isTrailing:", newValue)
      return newValue
    })
  }

  function toggleMapStyle() {
    isSatelliteView = !isSatelliteView
    mapStore.update((map) => {
      map.setStyle(
        isSatelliteView ? DEFAULT_SATELLITE_STYLE : DEFAULT_OUTDOORS_STYLE,
      )
      return map
    })
    dispatch("toggleMapStyleDispatcher", isSatelliteView)
  }

  function toggleVehicleMenu() {
    isVehicleMenuOpen = !isVehicleMenuOpen
    console.log("Set vehicleMenuVisibility to", isVehicleMenuOpen)
    controlStore.update((store) => {
      const updatedStore = {
        ...store,
        showVehicleMenu: isVehicleMenuOpen,
      }
      console.log("Updated controlStore:", updatedStore)
      return updatedStore
    })
  }

  // Add this reactive statement to keep isVehicleMenuOpen in sync with the store
  $: isVehicleMenuOpen = $controlStore.showVehicleMenu

  function handleBackToDashboard() {
    dispatch("backToDashboard")
  }

  const vehicleTypes = [
    "simpleTractor",
    "combine",
    "pointer",
    "CombineHarvester",
    "excavator",
    "tractor",
    "WheelLoader",
    "WorkCar",
    "Airplane",
  ]
  let currentVehicleIndex = 0

  const colorSizeOptions = [
    { color: "red", size: "25px" },
    { color: "blue", size: "35px" },
    { color: "green", size: "45px" },
    { color: "yellow", size: "60px" },
  ]
  let currentColorSizeIndex = 0

  function cycleVehicleType() {
    currentVehicleIndex = (currentVehicleIndex + 1) % vehicleTypes.length
    userVehicleStore.update((vehicle) => ({
      ...vehicle,
      vehicle_marker: {
        ...vehicle.vehicle_marker,
        type: vehicleTypes[currentVehicleIndex],
      },
    }))
  }

  function cycleColorSize() {
    currentColorSizeIndex =
      (currentColorSizeIndex + 1) % colorSizeOptions.length
    userVehicleStore.update((vehicle) => ({
      ...vehicle,
      vehicle_marker: {
        ...vehicle.vehicle_marker,
        color: colorSizeOptions[currentColorSizeIndex].color,
        size: colorSizeOptions[currentColorSizeIndex].size,
      },
    }))
  }

  //Cycles between 3 animation styles of the trailtracker
  const antLineConfigModes = [
    "noTrails",
    "allTrails",
    "latestTrail",
    "userLatestTrail",
  ]
  let currentAntLineConfigIndex = 0

  function cycleAntLineConfig() {
    currentAntLineConfigIndex =
      (currentAntLineConfigIndex + 1) % antLineConfigModes.length
    const currentMode = antLineConfigModes[currentAntLineConfigIndex]

    antLineConfigStore.update((config) => {
      // Reset all modes to false
      config.noTrails = false
      config.allTrails = false
      config.latestTrail = false
      config.userLatestTrail = false

      // Set the current mode to true
      config[currentMode] = true

      return config
    })
  }
</script>

<div>
  <!-- Map Controls -->

  <!-- Back to Dashboard Button, Top Left -->
  <button
    class="btn btn-circle btn-lg bg-white bg-opacity-50 hover:bg-opacity-100 absolute top-4 left-4 z-10"
    on:click={handleBackToDashboard}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  </button>

  <!-- Toggle Map Style Button, Top Right -->
  <button
    class="btn btn-circle btn-md absolute top-4 right-4 z-10"
    on:click={toggleMapStyle}
  >
    {#if isSatelliteView}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clip-rule="evenodd"
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </button>

  <!-- Toggle Vehicle Type Button, Top Right -->
  <button
    class="btn btn-circle btn-md absolute top-20 right-4 z-10"
    on:click={cycleVehicleType}
  >
    {vehicleTypes[currentVehicleIndex]}

    <!-- <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z"
        clip-rule="evenodd"
      />
    </svg> -->
  </button>

  <button
    class="btn btn-circle btn-md absolute top-20 right-20 z-10"
    on:click={cycleColorSize}
  >
    {colorSizeOptions[currentColorSizeIndex].color}
    {colorSizeOptions[currentColorSizeIndex].size}
  </button>

  <!-- Toggle Trailing Button -->
  <button
    class="btn btn-circle btn-md absolute top-36 right-4 z-10"
    on:click={toggleTrailing}
  >
    {#if $userVehicleTrailing}
      <div class="flex flex-col -mt-7 pb-0">
        {#if browser && LottiePlayer}
          <svelte:component
            this={LottiePlayer}
            src="/animations/PulsingBlueBeacon.json"
            autoplay={true}
            loop={true}
            controls={false}
            controlsLayout={null}
            renderer="svg"
            background="transparent"
            height={80}
            width={80}
          />
        {/if}
      </div>
    {:else}
      <svg
        fill="#000000"
        width="30px"
        height="30px"
        viewBox="0 0 32 32"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>trail</title>
        <path
          d="M30.165 30.887c-1.604 0.076-21.522-0.043-21.522-0.043-12.101-12.151 18.219-16.173-0.521-26.154l-1.311 1.383-1.746-4.582 5.635 0.439-1.128 1.267c23.438 6.83-3.151 19.631 20.594 27.69v0z"
        ></path>
      </svg>
    {/if}
  </button>

  <button
    class="btn btn-circle btn-md absolute top-52 right-4 z-10 text-xs"
    on:click={cycleAntLineConfig}
  >
    {antLineConfigModes[currentAntLineConfigIndex]}
  </button>

  <!-- Vehicle Selection Button -->
  <button
    class="btn btn-circle btn-md absolute top-52 right-20 z-10 text-xs"
    on:click={toggleVehicleMenu}
  >
    <div class="flex items-center justify-center w-full h-full">
      {#if VehicleIcon}
        <svelte:component
          this={VehicleIcon}
          color={$userVehicleStore.vehicle_marker.color}
          size={$userVehicleStore.vehicle_marker.size}
        />
      {:else}
        Loading...
      {/if}
    </div>
  </button>

  {#if isVehicleMenuOpen}
    <VehicleSelectionMenu
      showMenu={$controlStore.showVehicleMenu}
      currentVehicleType={$userVehicleStore.vehicle_marker.type}
      currentVehicleSize={$userVehicleStore.vehicle_marker.size}
      on:closeMenu={() => {
        controlStore.update((store) => ({ ...store, showVehicleMenu: false }))
      }}
      on:vehicleSelected={(event) => {
        userVehicleStore.update((vehicle) => ({
          ...vehicle,
          vehicle_marker: event.detail,
        }))
        controlStore.update((store) => ({ ...store, showVehicleMenu: false }))
      }}
    />
  {/if}

  <!-- New Color Picker Button -->
  <button
    class="btn btn-circle btn-md absolute top-80 right-4 z-10"
    on:click={toggleGridColorPicker}
    style="background-color: {gridSelectedColor};"
  >
    Color
  </button>

  <!-- GridColorPicker component -->
  <GridColorPicker
    bind:showPicker={showGridPicker}
    bind:selectedColor={gridSelectedColor}
    on:colorSelected={handleColorSelected}
    on:close={() => (showGridPicker = false)}
  />
</div>

<style>
</style>
