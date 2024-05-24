<!-- src/components/MarkerManager.svelte -->
<script>
  import {
    selectedMarkerStore,
    confirmedMarkersStore,
    removeMarkerStore,
    markerActionsStore,
  } from "../stores/mapStore"
  import { controlStore } from "../stores/controlStore"
  import { getContext, onMount, onDestroy } from "svelte"
  import mapboxgl from "mapbox-gl"
  import { v4 as uuidv4 } from "uuid"

  const { getMap } = getContext("map")

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
  // MapViewer.svelte

  async function handleIconSelection(icon) {
    const map = await getMap()
    let iconId = icon.id
    if ($selectedMarkerStore) {
      const { marker, id } = $selectedMarkerStore
      const lngLat = marker.getLngLat()
      marker.remove()
      // Find the selected icon object based on the iconId
      const selectedIcon = markerIcons.find((icon) => icon.id === iconId)

      if (selectedIcon) {
        // Create a custom marker element based on the selected icon
        const markerElement = document.createElement("div")
        markerElement.style.display = "flex"
        markerElement.style.justifyContent = "center"
        markerElement.style.alignItems = "center"
        markerElement.style.width = "35px"
        markerElement.style.height = "35px"
        markerElement.style.borderRadius = "100%"
        markerElement.style.backgroundColor = "LightGray"
        markerElement.style.opacity = 0.9
        markerElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"

        // Create an <i> element with the selected icon class
        const iconElement = document.createElement("i")
        iconElement.className = selectedIcon.class
        iconElement.style.fontSize = "20px"
        iconElement.style.color = "black"
        iconElement.style.fill = "#ff6347" // Set the fill color using inline styles
        iconElement.style.fontWeight = "bold"

        markerElement.appendChild(iconElement)

        // Add the new custom marker at the same location
        const newMarker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat(lngLat)
          .addTo(map)
        selectedMarkerStore.set({ marker: newMarker, id })
      } else {
        console.log("recentMarker is null or undefined")
      }
    }
  }

  async function handleMarkerPlacement(event) {
    const map = await getMap()
    const { lngLat } = event.detail

    if (lngLat) {
      // Remove the previous recent marker if it exists
      if ($selectedMarkerStore) {
        const { marker } = $selectedMarkerStore
        marker.remove()
      }

      // Place the new marker on the map
      const newMarker = new mapboxgl.Marker().setLngLat(lngLat).addTo(map)
      const markerId = uuidv4() // Generate a unique UUID for the marker
      selectedMarkerStore.set({ marker: newMarker, id: markerId })

      // Center the screen on the placed marker
      map.flyTo({
        center: lngLat,
        zoom: 15, // Adjust the zoom level as needed
        duration: 1000, // Adjust the duration of the animation as needed
      })
      controlStore.update((controls) => ({
        ...controls,
        showMarkerMenu: true,
      }))
      // Open the confirmation/customization menu
      // Implement your menu functionality here
      console.log("Marker placed at:", lngLat)
    } else {
      console.error("Invalid event format. Missing lngLat property.")
    }
  }

  function confirmMarker() {
    // Add the recent marker to the confirmedMarkers array
    if ($selectedMarkerStore) {
      const { marker, id } = $selectedMarkerStore
      const last_confirmed = new Date().toISOString() // Get the current last_confirmed

      confirmedMarkersStore.update((markers) => {
        const existingMarkerIndex = markers.findIndex((m) => m.id === id)
        if (existingMarkerIndex !== -1) {
          // If a marker with the same ID already exists, update it
          return markers.map((m, index) =>
            index === existingMarkerIndex ? { marker, id, last_confirmed } : m,
          )
        } else {
          // If no marker with the same ID exists, add a new entry
          return [...markers, { marker, id, last_confirmed }]
        }
      })
      selectedMarkerStore.set(null)
    }

    // Hide the marker menu
    controlStore.update((controls) => ({
      ...controls,
      showMarkerMenu: false,
    }))
  }

  function removeMarker() {
    // Remove the recent marker from the map
    if ($selectedMarkerStore) {
      const { marker, id } = $selectedMarkerStore
      marker.remove()
      selectedMarkerStore.set(null)

      confirmedMarkersStore.update((markers) => {
        const updatedMarkers = markers.filter((m) => m.id !== id)
        if (updatedMarkers.length !== markers.length) {
          // If a marker was removed, add its ID to the removeMarkerStore
          const removedMarker = markers.find((m) => m.id === id)
          removeMarkerStore.update((removedMarkers) => [
            ...removedMarkers,
            { id, last_confirmed: removedMarker.last_confirmed },
          ])
        }
        return updatedMarkers
      })
      console.log("Marker removed:", id)
      console.log("RemoveMarkerStore", $removeMarkerStore)
    }

    // Hide the marker menu
    controlStore.update((controls) => ({
      ...controls,
      showMarkerMenu: false,
    }))
  }

  async function handleMarkerSelection(event) {
    const map = await getMap()
    const { marker, id } = event.detail
    selectedMarkerStore.set({ marker, id })
    console.log("Marker selected:", $selectedMarkerStore)

    if ($selectedMarkerStore) {
      const lngLat = marker.getLngLat()

      map.flyTo({
        center: lngLat,
        zoom: 15, // Adjust the zoom level as needed
        duration: 1000, // Adjust the duration of the animation as needed
      })
      controlStore.update((controls) => ({
        ...controls,
        showMarkerMenu: true,
      }))
      // Open the confirmation/customization menu
      // Implement your menu functionality here
    }
  }

  // Handle server synchronization for markers:

  async function applyMarkerActions(actions) {
    const map = await getMap()
    const completedActions = []

    actions.forEach((action, index) => {
      const { markerData } = action
      const { id, marker_data, last_confirmed } = markerData

      if (action.action === "add") {
        const { geometry, properties } = marker_data
        const { coordinates } = geometry
        const { icon } = properties

        const lngLat = new mapboxgl.LngLat(coordinates[0], coordinates[1])

        // Create a custom marker element based on the icon
        const markerElement = document.createElement("div")
        markerElement.style.display = "flex"
        markerElement.style.justifyContent = "center"
        markerElement.style.alignItems = "center"
        markerElement.style.width = "35px"
        markerElement.style.height = "35px"
        markerElement.style.borderRadius = "100%"
        markerElement.style.backgroundColor = "LightGray"
        markerElement.style.opacity = 0.9
        markerElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"

        const iconElement = document.createElement("i")
        iconElement.className = icon
        iconElement.style.fontSize = "20px"
        iconElement.style.color = "black"
        iconElement.style.fill = "#ff6347"
        iconElement.style.fontWeight = "bold"

        markerElement.appendChild(iconElement)

        const newMarker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat(lngLat)
          .addTo(map)

        // Add the marker to the confirmedMarkersStore
        confirmedMarkersStore.update((markers) => [
          ...markers,
          { marker: newMarker, id, last_confirmed },
        ])

        console.log("Marker added:", markerData)
        completedActions.push(index)
      } else if (action.action === "update") {
        // Find the corresponding marker in the confirmedMarkersStore
        const existingMarker = $confirmedMarkersStore.find(
          (marker) => marker.id === id,
        )

        if (existingMarker) {
          const { marker: oldMarker } = existingMarker
          const { geometry, properties } = marker_data
          const { coordinates } = geometry
          const { icon } = properties

          const lngLat = new mapboxgl.LngLat(coordinates[0], coordinates[1])

          // Remove the old marker from the map
          oldMarker.remove()

          // Create a new marker element based on the updated data
          const markerElement = document.createElement("div")
          markerElement.style.display = "flex"
          markerElement.style.justifyContent = "center"
          markerElement.style.alignItems = "center"
          markerElement.style.width = "35px"
          markerElement.style.height = "35px"
          markerElement.style.borderRadius = "100%"
          markerElement.style.backgroundColor = "LightGray"
          markerElement.style.opacity = 0.9
          markerElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"

          const iconElement = document.createElement("i")
          iconElement.className = icon
          iconElement.style.fontSize = "20px"
          iconElement.style.color = "black"
          iconElement.style.fill = "#ff6347"
          iconElement.style.fontWeight = "bold"

          markerElement.appendChild(iconElement)

          const newMarker = new mapboxgl.Marker({ element: markerElement })
            .setLngLat(lngLat)
            .addTo(map)

          // Update the confirmedMarkersStore with the new marker and last_confirmed value
          confirmedMarkersStore.update((markers) =>
            markers.map((marker) =>
              marker.id === id
                ? { marker: newMarker, id, last_confirmed }
                : marker,
            ),
          )

          console.log("Marker updated:", markerData)
        }

        completedActions.push(index)
      } else if (action.action === "delete") {
        // Find the corresponding marker in the confirmedMarkersStore
        const existingMarker = $confirmedMarkersStore.find(
          (marker) => marker.id === id,
        )

        if (existingMarker) {
          const { marker } = existingMarker

          // Remove the marker from the map
          marker.remove()

          // Update the confirmedMarkersStore by removing the marker
          confirmedMarkersStore.update((markers) =>
            markers.filter((marker) => marker.id !== id),
          )

          console.log("Marker removed:", markerData)
        }

        completedActions.push(index)
      }
    })

    console.log("Completed actions:", completedActions)
    console.log("MarkerActionsStore", $markerActionsStore)
    // Remove completed actions from the markerActionsStore
    if (completedActions.length > 0) {
      markerActionsStore.update((currentActions) =>
        currentActions.filter((_, index) => !completedActions.includes(index)),
      )
    }
    console.log("MarkerActionsStore", $markerActionsStore)
  }

  markerActionsStore.subscribe(applyMarkerActions)

  onMount(async () => {
    const map = await getMap()

    const mapContainer = document.querySelector(".map-container")
    mapContainer.addEventListener("markerPlacement", handleMarkerPlacement)
    mapContainer.addEventListener("markerSelection", handleMarkerSelection)

    return () => {
      mapContainer.removeEventListener("markerPlacement", handleMarkerPlacement)
      mapContainer.removeEventListener("markerSelection", handleMarkerSelection)
    }
  })

  onDestroy(() => {})
</script>

<!-- Marker Menu -->
{#if $controlStore.showMarkerMenu}
  <div class="fixed bottom-0 left-0 right-0 flex justify-center mb-8 z-10">
    <div
      class="bg-white bg-opacity-90 rounded-lg shadow-lg w-11/12 sm:w-1/2 overflow-hidden border-2 border-gray-300"
    >
      <div class="grid grid-cols-2 bg-gray-200">
        <button
          class="p-4 hover:bg-green-300 transition duration-200 flex justify-center items-center border-r border-gray-300"
          on:click={confirmMarker}
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
          on:click={removeMarker}
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
              on:click={() => handleIconSelection(icon)}
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
