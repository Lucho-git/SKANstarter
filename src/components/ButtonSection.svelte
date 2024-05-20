<!-- src/components/ButtonSection.svelte -->
<script>
  import { createEventDispatcher } from "svelte"
  import {
    mapStore,
    userVehicleStore,
    vehicleColorSizeStore,
  } from "../stores/mapStore"

  export let isSatelliteView = true
  export let showMarkerMenu = false
  export let markerIcons = []

  const dispatch = createEventDispatcher()

  const DEFAULT_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"
  const DEFAULT_OUTDOORS_STYLE = "mapbox://styles/mapbox/outdoors-v12"

  function handleConfirmMarker() {
    dispatch("confirmMarker")
  }

  function handleRemoveMarker() {
    dispatch("removeMarker")
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

  const vehicleTypes = [
    "harvester",
    "chaserbin",
    "tractor",
    "combine",
    "loader",
    "phone",
    "pointer",
  ]
  let currentVehicleIndex = 0

  const colorSizeOptions = [
    { color: "red", size: "60px" },
    { color: "blue", size: "80px" },
    { color: "green", size: "100px" },
    { color: "yellow", size: "120px" },
  ]
  let currentColorSizeIndex = 0

  function cycleVehicleType() {
    currentVehicleIndex = (currentVehicleIndex + 1) % vehicleTypes.length
    userVehicleStore.set(vehicleTypes[currentVehicleIndex])
  }

  function cycleColorSize() {
    currentColorSizeIndex =
      (currentColorSizeIndex + 1) % colorSizeOptions.length
    vehicleColorSizeStore.set(colorSizeOptions[currentColorSizeIndex])
  }

  function handleIconClick(icon) {
    console.log("Clicked icon:", icon)
    console.log("iconid:", icon.id)
    dispatch("iconSelected", icon.id)
  }
</script>

<div>
  <!-- Map Controls -->

  <!-- Marker Menu Pulls up from bottom-->
  {#if showMarkerMenu}
    <div class="fixed bottom-0 left-0 right-0 flex justify-center mb-8 z-10">
      <div
        class="bg-white bg-opacity-90 rounded-lg shadow-lg w-11/12 sm:w-1/2 overflow-hidden border-2 border-gray-300"
      >
        <div class="grid grid-cols-2 bg-gray-200">
          <button
            class="p-4 hover:bg-green-300 transition duration-200 flex justify-center items-center border-r border-gray-300"
            on:click={handleConfirmMarker}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
          <button
            class="p-4 hover:bg-red-300 transition duration-200 flex justify-center items-center"
            on:click={handleRemoveMarker}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 12H4"
              />
            </svg>
          </button>
        </div>
        <div class="p-4 overflow-auto max-h-64">
          <div class="grid grid-auto-flow grid-auto-columns gap-2">
            {#each markerIcons as icon}
              <button
                class="marker-icon focus:outline-none"
                on:click={() => handleIconClick(icon)}
              >
                <div
                  class="bg-gray-200 hover:bg-gray-300 rounded-lg p-3 transition duration-200 transform hover:scale-125"
                >
                  <i class={`${icon.class} text-4xl text-gray-700`}></i>
                </div>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

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
</div>

<style>
  .marker-icon {
    margin: 0 5px;
    cursor: pointer;
  }

  .grid-auto-flow {
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
</style>
