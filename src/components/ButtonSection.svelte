<!-- src/components/ButtonSection.svelte -->
<script>
  import { createEventDispatcher } from "svelte"
  import { mapStore, userVehicleStore } from "../stores/mapStore"
  import IconSVG from "./IconSVG.svelte"
  import IconFarmingBundle from "./IconFarmingBundle.svelte"

  export let isSatelliteView = true
  export let showMarkerMenu = false
  //   export let markerIcons = []
  const markerIcons = [
    { id: "arrow-up-circle", class: "at-arrow-up-circle" },
    { id: "arrow-down-circle", class: "at-arrow-down-circle" },
    { id: "arrow-left-circle", class: "at-arrow-left-circle" },
    { id: "arrow-right-circle", class: "at-arrow-right-circle" },
    { id: "user", class: "at-user" },
    { id: "users", class: "at-users" },
    { id: "gear", class: "at-gear" },
    { id: "home", class: "at-home" },
    { id: "check-shield", class: "at-check-shield" },
    { id: "trash", class: "at-trash" },
    { id: "exit", class: "at-exit" },
    { id: "xmark-circle", class: "at-xmark-circle" },
    { id: "info-circle", class: "at-info-circle" },
    { id: "pin-destination", class: "at-pin-destination" },
    { id: "lock-keyhole", class: "at-lock-keyhole" },
    { id: "unlock-keyhole", class: "at-unlock-keyhole" },
    { id: "shopping-cart", class: "at-shopping-cart" },
    { id: "crosshairs", class: "at-crosshairs" },
    { id: "dollar-sign", class: "at-dollar-sign" },
    { id: "berries", class: "at-berries" },
    { id: "call", class: "at-call" },
    { id: "call-xmark", class: "at-call-xmark" },
    { id: "signal", class: "at-signal" },
    { id: "wifi", class: "at-wifi" },
    { id: "triangle-exclamation", class: "at-triangle-exclamation" },
    { id: "street-cone", class: "at-street-cone" },
    { id: "construction-truck", class: "at-construction-truck" },
    { id: "electric-battery-charge", class: "at-electric-battery-charge" },
    { id: "electric-car", class: "at-electric-car" },
    { id: "flower", class: "at-flower" },
    { id: "gasoline", class: "at-gasoline" },
    { id: "green-gas", class: "at-green-gas" },
    { id: "green-container", class: "at-green-container" },
    { id: "green-can", class: "at-green-can" },
    { id: "plant-house", class: "at-plant-house" },
    { id: "arrows-recycle", class: "at-arrows-recycle" },
    { id: "water-container", class: "at-water-container" },
    { id: "gewindmillar", class: "at-windmill" },
    { id: "kg-weight", class: "at-kg-weight" },
    { id: "carrot", class: "at-carrot" },
    { id: "hamburger", class: "at-hamburger" },
    { id: "middle-finger", class: "at-middle-finger" },
    { id: "toilet-bathroom", class: "at-toilet-bathroom" },
    { id: "taxi-service", class: "at-taxi-service" },
    { id: "block", class: "at-block" },
    { id: "wheelchair", class: "at-wheelchair" },
    { id: "car-garage", class: "at-car-garage" },
    { id: "electricity-home", class: "at-electricity-home" },
    { id: "house-home", class: "at-house-home" },
    { id: "houses", class: "at-houses" },
    { id: "carrot-turnip-vegetable", class: "at-carrot-turnip-vegetable" },
    { id: "cart", class: "at-cart" },
    { id: "wheat-harvest", class: "at-wheat-harvest" },
    { id: "helicopter-travel", class: "at-helicopter-travel" },
    { id: "airplane", class: "at-airplane" },
    { id: "farming-tractor", class: "at-farming-tractor" },

    { id: "camper-vehicle", class: "at-camper-vehicle" },
    { id: "car-vehicle", class: "at-car-vehicle" },
    { id: "cargo-transport", class: "at-cargo-transport" },
    { id: "bulldozer", class: "at-bulldozer" },
    { id: "construction-transport", class: "at-construction-transport" },
    { id: "crane-truck", class: "at-crane-truck" },
    { id: "delivery-truck", class: "at-delivery-truck" },
    { id: "liquid-transportation", class: "at-liquid-transportation" },
    { id: "transport-truck", class: "at-transport-truck" },
    { id: "ladder-truck", class: "at-ladder-truck" },
    { id: "celcius", class: "at-celcius" },
    { id: "clouds", class: "at-clouds" },
    { id: "crosswinds", class: "at-crosswinds" },
    { id: "rain-storm", class: "at-rain-storm" },
    { id: "rain-drops", class: "at-rain-drops" },
  ]
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

  function togglevehicleType() {
    userVehicleStore.update((currentType) =>
      currentType === "harvester" ? "chaserbin" : "harvester",
    )
  }

  function handleIconClick(icon) {
    dispatch("iconSelected", icon)
    console.log("Clicked icon:", icon)
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
        <div class="p-4 overflow-auto max-h-72">
          <div class="grid grid-auto-flow grid-auto-columns gap-2">
            {#each markerIcons as icon}
              <button
                class="marker-icon focus:outline-none"
                on:click={() => handleIconClick(icon.id)}
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
    on:click={togglevehicleType}
  >
    <svg
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
    </svg>
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
