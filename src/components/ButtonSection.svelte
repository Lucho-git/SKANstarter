<!-- src/components/ButtonSection.svelte -->
<script>
  import { createEventDispatcher, beforeUpdate, afterUpdate } from "svelte"
  import { mapStore } from "../stores/mapStore"
  import { userVehicleStore } from "../stores/vehicleStore"
  import { isTrailingStore } from "../stores/trailingStore"
  import { LottiePlayer } from "@lottiefiles/svelte-lottie-player"

  export let isSatelliteView = true

  const dispatch = createEventDispatcher()

  const DEFAULT_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"
  const DEFAULT_OUTDOORS_STYLE = "mapbox://styles/mapbox/outdoors-v12"

  function toggleTrailing() {
    isTrailingStore.update((value) => {
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

  function handleBackToDashboard() {
    dispatch("backToDashboard")
  }

  const vehicleTypes = ["tractor", "combine", "loader", "pointer", "Harvester"]
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
    <!-- src/components/ButtonSection.svelte -->
    <!-- src/components/ButtonSection.svelte -->
    <!-- src/components/ButtonSection.svelte -->
    <!-- src/components/ButtonSection.svelte -->
    <!-- src/components/ButtonSection.svelte -->

    {colorSizeOptions[currentColorSizeIndex].color}
    {colorSizeOptions[currentColorSizeIndex].size}
  </button>

  <!-- Toggle Trailing Button -->
  <!-- Toggle Trailing Button -->
  <button
    class="btn btn-circle btn-md absolute top-36 right-4 z-10"
    on:click={toggleTrailing}
  >
    {#if $isTrailingStore}
      <div class="flex flex-col -mt-2.5 pb-0">
        <LottiePlayer
          src="/animations/drivingtruckanimation.json"
          autoplay={true}
          loop={true}
          controls={false}
          controlsLayout={null}
          renderer="svg"
          background="transparent"
          height={65}
          width={65}
        />
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
</div>

<style>
</style>
