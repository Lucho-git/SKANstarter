<!-- src/components/ButtonSection.svelte -->
<script>
  import { createEventDispatcher, beforeUpdate, afterUpdate } from "svelte"
  import { mapStore, locationMarkerStore, syncStore } from "../stores/mapStore"
  import { userVehicleStore, userVehicleTrailing } from "../stores/vehicleStore"
  import { antLineConfigStore } from "../stores/trailDataStore"
  import { controlStore } from "../stores/controlStore"
  import { toast } from "svelte-sonner"

  import { browser } from "$app/environment"
  import { onMount } from "svelte"
  import VehicleSelectionMenu from "./VehicleSelectionMenu.svelte"
  import SVGComponents from "../components/SVG/index.js"
  import Icons from "$lib/icons"
  let isCircular = true
  let currentStyle = "skan"

  const styles = [
    "skan",
    "glassmorphism",
    "gradient",
    "outlined",
    "neon",
    "minimal",
    "neumorphism",
    "cyberpunk",
  ]

  onMount(async () => {
    console.log("Mounting ButtonSection")

    setTimeout(() => {
      isExpanded = true
    }, 200) // Adjust the delay as needed
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

      if (newValue) {
        toast.info("Trail recording started")
      } else {
        toast.info("Ended trail recording")
      }

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

      // Show toast notification based on the current mode
      switch (currentMode) {
        case "noTrails":
          toast.info("No trail animation")
          break
        case "allTrails":
          toast.info("Animating all trails")
          break
        case "latestTrail":
          toast.info("Animating only latest trail")
          break
        case "userLatestTrail":
          toast.info("Animating only your latest trail")
          break
      }

      return config
    })
  }

  function handleSync() {
    $syncStore.synchronizeMarkers("Synchronizing with server")
  }

  let isExpanded = false // Set default state to open

  function toggleExpanded() {
    isExpanded = !isExpanded
  }

  function handleLocationClick() {
    const coordinates = $userVehicleStore.coordinates
    if (coordinates) {
      locationMarkerStore.set(coordinates)
    } else {
      toast.error("Unable to get your current location")
    }
  }
</script>

<div>
  <!-- Map Controls -->

  <!-- Back to Dashboard Button, Top Left -->
  <button
    class="top-button {currentStyle} btn {isCircular
      ? 'btn-circle'
      : 'btn-square'} btn-lg bg-white bg-opacity-50 hover:bg-opacity-100 absolute top-4 left-4 z-10"
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
  <!-- <button
    class="btn {isCircular ? 'btn-circle' : 'btn-square'} btn-md absolute top-4 right-4 z-10"
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
  </button> -->

  <!-- Floating button container -->
  <div class="fixed top-4 right-4 z-20 flex flex-col items-end">
    <!-- Toggle expand/collapse button -->
    <button
      class="top-button {currentStyle} btn {isCircular
        ? 'btn-circle'
        : 'btn-square'} btn-lg bg-white hover:bg-opacity-90 mb-3"
      on:click={toggleExpanded}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-8 transition-transform duration-300 {isExpanded
          ? 'rotate-180'
          : ''}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Button list container -->
    <div
      class="flex flex-col space-y-3 transition-all duration-700 ease-in-out origin-top {isExpanded
        ? 'scale-100 opacity-90'
        : 'scale-0 opacity-0 h-50 overflow-hidden'}"
    >
      <!--Sync Button-->
      <button
        class="menu-button {currentStyle} btn {isCircular
          ? 'btn-circle'
          : 'btn-square'} btn-lg bg-white hover:bg-opacity-90"
        on:click={handleSync}
      >
        <svg
          class="w-8 h-8 {$syncStore.spinning ? 'animate-spin' : ''}"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      <!-- <button
        class="menu-button {currentStyle} btn {isCircular
          ? 'btn-circle'
          : 'btn-square'} btn-lg bg-white hover:bg-opacity-90 text-sm"
        on:click={cycleAntLineConfig}
      >
        {antLineConfigModes[currentAntLineConfigIndex]}
      </button> -->

      <!-- InstantLocationMarker Button-->

      <button
        class="menu-button {currentStyle} btn {isCircular
          ? 'btn-circle'
          : 'btn-square'} btn-lg bg-white hover:bg-opacity-90 text-sm"
        on:click={handleLocationClick}
      >
        <Icons.location_drop width="48" height="48" fill="currentColor" />
      </button>

      <!-- Toggle Trailing Button -->
      <button
        class="menu-button {currentStyle} btn {isCircular
          ? 'btn-circle'
          : 'btn-square'} btn-lg bg-white hover:bg-opacity-90"
        on:click={toggleTrailing}
      >
        {#if $userVehicleTrailing}
          <svg
            class={$userVehicleTrailing ? "animate-trail" : ""}
            fill="currentColor"
            width="36px"
            height="36px"
            viewBox="0 0 32 32"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>trail</title>
            <path
              d="M30.165 30.887c-1.604 0.076-21.522-0.043-21.522-0.043-12.101-12.151 18.219-16.173-0.521-26.154l-1.311 1.383-1.746-4.582 5.635 0.439-1.128 1.267c23.438 6.83-3.151 19.631 20.594 27.69v0z"
            ></path>
          </svg>
        {:else}
          <svg
            fill="currentColor"
            width="36px"
            height="36px"
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

      <!-- Vehicle Selection Button -->
      <button
        class="menu-button {currentStyle} btn {isCircular
          ? 'btn-circle'
          : 'btn-square'} btn-lg bg-white hover:bg-opacity-90"
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
    </div>
  </div>

  <!-- End of Floating button container -->

  {#if isVehicleMenuOpen}
    <VehicleSelectionMenu
      showMenu={$controlStore.showVehicleMenu}
      currentVehicleType={$userVehicleStore.vehicle_marker.type}
      currentVehicleSize={$userVehicleStore.vehicle_marker.size}
      currentVehicleColor={$userVehicleStore.vehicle_marker.color}
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
</div>

<style>
  /* Base styles for all menu buttons */
  .menu-button {
    transition: all 0.3s ease;
  }

  /* Glassmorphism effect */
  .menu-button.glassmorphism,
  .top-button.glassmorphism {
    background-color: rgba(255, 255, 255, 0.5);
    color: white;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .menu-button.glassmorphism:hover,
  .top-button.glassmorphism:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }

  /* Gradient background with hover effect */
  .menu-button.gradient,
  .top-button.gradient {
    background: linear-gradient(to right, #60a5fa, #a78bfa);
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .menu-button.gradient:hover,
  .top-button.gradient:hover {
    background: linear-gradient(to right, #3b82f6, #8b5cf6);
  }

  /* Outlined style with hover fill */
  .menu-button.outlined,
  .top-button.outlined {
    background-color: rgb(199, 202, 208);
    border: 2px solid #374151;
    color: #374151;
  }
  .menu-button.outlined:hover,
  .top-button.outlined:hover {
    background-color: #374151;
    color: white;
  }

  /* Neon glow effect */
  .menu-button.neon,
  .top-button.neon {
    background-color: black;
    color: #4ade80;
    border: 2px solid #4ade80;
    box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
  }
  .menu-button.neon:hover,
  .top-button.neon:hover {
    background-color: #4ade80;
    color: black;
  }

  /* Minimal flat design */
  .menu-button.minimal,
  .top-button.minimal {
    background-color: #f3f4f6;
    color: #1f2937;
  }
  .menu-button.minimal:hover,
  .top-button.minimal:hover {
    background-color: #e5e7eb;
  }

  /* Neumorphism effect */
  .menu-button.neumorphism,
  .top-button.neumorphism {
    background-color: #e6e9ee;
    box-shadow:
      inset 3px 3px 6px #c8ccd1,
      inset -3px -3px 6px #ffffff;
    color: #4a5568;
  }
  .menu-button.neumorphism:hover,
  .top-button.neumorphism:hover {
    background-color: #e0e5ec;
    box-shadow:
      3px 3px 6px #c8ccd1,
      -3px -3px 6px #ffffff;
  }

  /* Cyberpunk-inspired */
  .menu-button.cyberpunk,
  .top-button.cyberpunk {
    background-color: #000000;
    border: 2px solid #00ff00;
    color: #00ff00;
    text-shadow: 0 0 5px #00ff00;
    box-shadow: 0 0 10px #00ff00;
  }
  .menu-button.cyberpunk:hover,
  .top-button.cyberpunk:hover {
    background-color: #00ff00;
    color: #000000;
    text-shadow: none;
  }

  /* Skan Theme */
  .menu-button.skan,
  .top-button.skan {
    background-color: #f7db5c;
    border: 2px solid #000000;
    color: #000000;
  }
  .menu-button.skan:hover,
  .top-button.skan:hover {
    background-color: rgb(0, 0, 0, 0.5);
    color: #f7db5c;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
      filter: drop-shadow(0 0 0 white);
    }
    50% {
      transform: scale(1.3);
      opacity: 0.4;
      filter: drop-shadow(2px 2px 6px rgb(255, 0, 0));
    }
    100% {
      transform: scale(1);
      opacity: 1;
      filter: drop-shadow(0 0 0px white);
    }
  }

  @keyframes draw {
    0% {
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes fade {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes fillUnfill {
    0%,
    100% {
      fill-opacity: 0;
    }
    50%,
    51% {
      fill-opacity: 1;
    }
  }
  .animate-trail path {
    stroke: currentColor;
    stroke-width: 1;
    fill: currentColor;
    stroke-dasharray: 105;
    animation:
      draw 10s linear infinite,
      fillUnfill 3s linear infinite;
  }
</style>
