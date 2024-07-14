<!-- src/components/MarkerManager.svelte -->
<script>
  import {
    selectedMarkerStore,
    confirmedMarkersStore,
    removeMarkerStore,
    markerActionsStore,
    locationMarkerStore,
  } from "../stores/mapStore"
  import { controlStore } from "../stores/controlStore"
  import { getContext, onMount, onDestroy } from "svelte"
  import mapboxgl from "mapbox-gl"
  import { v4 as uuidv4 } from "uuid"
  import IconSVG from "../components/IconSVG.svelte"
  import { toast } from "svelte-sonner"

  const { getMap } = getContext("map")
  let markerActionsUnsubscribe
  let locationMarkerUnsubscribe

  const markerIcons = [
    // { id: "barn", class: "custom-svg" },
    // { id: "color_tractor", class: "custom-svg" },
    // { id: "corn_field", class: "custom-svg" },
    // { id: "cell_tower", class: "custom-svg" },
    { id: "rock", class: "custom-svg" },
    { id: "tree13", class: "custom-svg" },
    { id: "watertank2", class: "custom-svg" },
    { id: "wheat2", class: "custom-svg" },
    { id: "kangaroo", class: "custom-svg" },

    // { id: "tree1", class: "custom-svg" },
    { id: "electric_tower", class: "custom-svg" },
    // { id: "electric_tower_2", class: "custom-svg" },
    { id: "gate", class: "custom-svg" },
    // { id: "farmer", class: "custom-svg" },
    // { id: "pickup_truck", class: "custom-svg" },

    // { id: "liquid_tank", class: "custom-svg" },
    { id: "machine_pump", class: "custom-svg" },
    { id: "recharge_icon", class: "custom-svg" },
    { id: "repair_shop", class: "custom-svg" },
    // { id: "repair_house", class: "custom-svg" },
    // { id: "repair_marker", class: "custom-svg" },

    // { id: "tree8", class: "custom-svg" },
    // { id: "tree12", class: "custom-svg" },

    { id: "tractor", class: "custom-svg" },
    { id: "silo2", class: "custom-svg" },
    { id: "tree_stump", class: "custom-svg" },
    // { id: "vehicle_workshop", class: "custom-svg" },
    // { id: "water_pump", class: "custom-svg" },
    // { id: "water_tank", class: "custom-svg" },
    { id: "workshop_icon", class: "custom-svg" },
    // { id: "workshop2", class: "custom-svg" },

    // Ionic icons

    { id: "pin", class: "ionic-pin" },

    { id: "arrow-up-circle", class: "ionic-arrow-up-circle" },
    { id: "arrow-down-circle", class: "ionic-arrow-down-circle" },
    { id: "arrow-back-circle", class: "ionic-arrow-back-circle" },
    { id: "arrow-forward-circle", class: "ionic-arrow-forward-circle" },
    { id: "thumbs-down", class: "ionic-thumbs-down" },
    { id: "thumbs-up", class: "ionic-thumbs-up" },

    { id: "accessibility", class: "ionic-accessibility" },
    { id: "people", class: "ionic-people" },
    { id: "settings", class: "ionic-settings" },
    { id: "home", class: "ionic-home" },
    { id: "checkmark-circle", class: "ionic-checkmark-circle" },
    { id: "close-circle", class: "ionic-close-circle" },

    { id: "information-circle", class: "ionic-information-circle" },
    { id: "warning", class: "ionic-warning" },
    { id: "help-circle", class: "ionic-help-circle" },
    { id: "ban", class: "ionic-ban" },

    { id: "location", class: "ionic-location" },

    { id: "lock-closed", class: "ionic-lock-closed" },
    { id: "lock-open", class: "ionic-lock-open" },
    { id: "trash", class: "ionic-trash" },

    { id: "cart", class: "ionic-cart" },

    { id: "locate", class: "ionic-locate" },
    { id: "leaf", class: "ionic-leaf" },
    { id: "call", class: "ionic-call" },

    { id: "wifi", class: "ionic-wifi" },
    { id: "radio", class: "ionic-radio" },
    { id: "cloud-offline", class: "ionic-cloud-offline" },

    { id: "battery-charging", class: "ionic-battery-charging" },

    { id: "thermometer", class: "ionic-thermometer" },
    { id: "sunny", class: "ionic-sunny" },
    { id: "cloud", class: "ionic-cloud" },
    { id: "thunderstorm", class: "ionic-thunderstorm" },
    { id: "rainy", class: "ionic-rainy" },
    { id: "water", class: "ionic-water" },

    { id: "fast-food", class: "ionic-fast-food" },
    { id: "restaurant", class: "ionic-restaurant" },
    { id: "cart", class: "ionic-cart" },
    { id: "airplane", class: "ionic-airplane" },
    { id: "trail-sign", class: "ionic-trail-sign" },
    { id: "car", class: "ionic-car" },
    { id: "beer", class: "ionic-beer" },
    { id: "bonfire", class: "ionic-bonfire" },
    { id: "boat", class: "ionic-boat" },
    { id: "bed", class: "ionic-bed" },
    { id: "bicycle", class: "ionic-bicycle" },
    { id: "build", class: "ionic-build" },
    { id: "desktop", class: "ionic-desktop" },
    { id: "earth", class: "ionic-earth" },
    { id: "camera", class: "ionic-camera" },
    { id: "fish", class: "ionic-fish" },
    { id: "flame", class: "ionic-flame" },
    { id: "footsteps", class: "ionic-footsteps" },
    { id: "key", class: "ionic-key" },
    { id: "man", class: "ionic-man" },
    { id: "paw", class: "ionic-paw" },
    { id: "skull", class: "ionic-skull" },

    { id: "construct", class: "ionic-construct" },

    { id: "bus", class: "ionic-bus" },
    { id: "subway", class: "ionic-subway" },
    { id: "telescope", class: "ionic-telescope" },

    { id: "construction-truck", class: "at-construction-truck" },
    { id: "electric-car", class: "at-electric-car" },
    { id: "gasoline", class: "at-gasoline" },

    { id: "kg-weight", class: "at-kg-weight" },
    { id: "carrot", class: "at-carrot" },
    { id: "middle-finger", class: "at-middle-finger" },
    { id: "toilet-bathroom", class: "at-toilet-bathroom" },

    { id: "car-garage", class: "at-car-garage" },
    { id: "electricity-home", class: "at-electricity-home" },

    { id: "carrot-turnip-vegetable", class: "at-carrot-turnip-vegetable" },
    { id: "wheat-harvest", class: "at-wheat-harvest" },
    { id: "helicopter-travel", class: "at-helicopter-travel" },

    { id: "camper-vehicle", class: "at-camper-vehicle" },

    { id: "cargo-transport", class: "at-cargo-transport" },
    { id: "bulldozer", class: "at-bulldozer" },
    { id: "construction-transport", class: "at-construction-transport" },
    { id: "crane-truck", class: "at-crane-truck" },
    { id: "delivery-truck", class: "at-delivery-truck" },
    { id: "liquid-transportation", class: "at-liquid-transportation" },
    { id: "transport-truck", class: "at-transport-truck" },
    { id: "ladder-truck", class: "at-ladder-truck" },
  ]

  export let markerPlacementEvent = null
  export let markerClickEvent = null

  $: if (markerPlacementEvent) {
    handleMarkerPlacement(markerPlacementEvent)
  }

  $: if (markerClickEvent) {
    handleMarkerSelection(markerClickEvent)
  }

  // MapViewer.svelte

  onMount(async () => {
    const map = await getMap()

    const mapContainer = document.querySelector(".map-container")

    markerActionsUnsubscribe = markerActionsStore.subscribe(applyMarkerActions)

    locationMarkerUnsubscribe = locationMarkerStore.subscribe((timestamp) => {
      if (timestamp) {
        placeMarkerAtCurrentLocation()
      }
    })
  })

  onDestroy(() => {
    console.log("Destroying MarkerManager")

    // Unsubscribe from the markerActionsStore subscription
    if (markerActionsUnsubscribe) {
      markerActionsUnsubscribe()
    }
    if (locationMarkerUnsubscribe) {
      locationMarkerUnsubscribe()
    }
    // Clear the confirmedMarkersStore
    confirmedMarkersStore.set([])

    // Clear the removeMarkerStore
    removeMarkerStore.set([])

    // Clear the markerActionsStore
    markerActionsStore.set([])
  })

  // Instant Marker placement

  async function placeMarkerAtCurrentLocation() {
    const map = await getMap()
    const coordinates = $locationMarkerStore

    if (coordinates) {
      const lngLat = new mapboxgl.LngLat(
        coordinates.longitude,
        coordinates.latitude,
      )
      const id = uuidv4()
      const newMarker = createCustomMarker(lngLat, "default", id)
      newMarker.addTo(map)

      confirmedMarkersStore.update((markers) => [
        ...markers,
        {
          marker: newMarker,
          id,
          last_confirmed: new Date().toISOString(),
          iconClass: "default",
        },
      ])

      // Center the map on the new marker
      map.flyTo({
        center: lngLat,
        zoom: 15,
        duration: 1000,
      })

      console.log("Marker placed at current location:", lngLat)
    } else {
      console.error("Unable to get current location")
    }
  }

  function createCustomMarker(lngLat, icon, id) {
    if (icon === "default") {
      // Create a default Mapbox marker
      const marker = new mapboxgl.Marker().setLngLat(lngLat)
      marker.getElement().setAttribute("data-marker-id", id)
      dispatchUpdateEvent(marker, id)
      return marker
    }

    const markerElement = document.createElement("div")
    markerElement.style.width = "35px"
    markerElement.style.height = "35px"
    markerElement.setAttribute("data-marker-id", id)
    markerElement.style.display = "flex"
    markerElement.style.justifyContent = "center"
    markerElement.style.alignItems = "center"
    markerElement.style.borderRadius = "100%"
    markerElement.style.backgroundColor = "LightGray"
    markerElement.style.opacity = 0.9
    markerElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"

    if (icon.startsWith("custom-svg-")) {
      const svgComponent = new IconSVG({
        target: markerElement,
        props: {
          icon: icon.replace("custom-svg-", ""),
          size: "25px",
        },
      })
      markerElement.querySelector("svg").dataset.icon = icon.replace(
        "custom-svg-",
        "",
      )
    } else if (icon.startsWith("ionic-")) {
      const ionIcon = document.createElement("ion-icon")
      ionIcon.setAttribute("name", icon.replace("ionic-", ""))
      ionIcon.style.fontSize = "28px"
      ionIcon.style.color = "black"
      markerElement.appendChild(ionIcon)
    } else {
      const iconElement = document.createElement("i")
      iconElement.className = icon
      iconElement.style.fontSize = "20px"
      iconElement.style.color = "black"
      iconElement.style.fill = "#ff6347"
      iconElement.style.fontWeight = "bold"
      markerElement.appendChild(iconElement)
    }

    const marker = new mapboxgl.Marker({ element: markerElement }).setLngLat(
      lngLat,
    )
    dispatchUpdateEvent(marker, id)
    return marker
  }

  function dispatchUpdateEvent(marker, id) {
    const handleUpdateMarkerListeners = new CustomEvent(
      "handleUpdateMarkerListeners",
      {
        detail: { marker: marker, id },
      },
    )
    document.dispatchEvent(handleUpdateMarkerListeners)
  }

  async function handleMarkerPlacement(event) {
    const map = await getMap()
    const { lngLat } = event

    if (lngLat) {
      // Remove the previous recent marker if it exists
      if ($selectedMarkerStore) {
        const { marker } = $selectedMarkerStore
        marker.remove()
      }

      // Place the new marker on the map
      const id = uuidv4() // Generate a unique UUID for the marker
      const newMarker = createCustomMarker(lngLat, "default", id)

      newMarker.setLngLat(lngLat).addTo(map)

      selectedMarkerStore.set({ marker: newMarker, id: id })

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
      console.log("Marker ID Placed:", id, $selectedMarkerStore)
    } else {
      console.error("Invalid event format. Missing lngLat property.")
    }
  }

  function confirmMarker() {
    if ($selectedMarkerStore) {
      const { marker: selectedMarker, id } = $selectedMarkerStore
      const currentTimestamp = new Date().toISOString()
      const existingMarker = $confirmedMarkersStore.find((m) => m.id === id)

      let iconClass = "default"
      const markerElement = selectedMarker.getElement()

      // Check for custom-svg markers
      const svgElement = markerElement.querySelector("svg[data-icon]")
      if (svgElement && svgElement.dataset.icon) {
        iconClass = `custom-svg-${svgElement.dataset.icon}`
      } else {
        // Check for ionic icons
        const ionIconElement = markerElement.querySelector("ion-icon")
        if (ionIconElement) {
          iconClass = `ionic-${ionIconElement.getAttribute("name")}`
        } else {
          // Check for atlas icons
          const iElement = markerElement.querySelector("i")
          if (iElement) {
            iconClass = iElement.className
          }
        }
      }

      const markerData = {
        marker: selectedMarker,
        id,
        last_confirmed: currentTimestamp,
        iconClass: iconClass,
      }

      if (!existingMarker) {
        console.log("Adding new marker:", markerData)
        confirmedMarkersStore.update((markers) => [...markers, markerData])
      } else {
        console.log("Updating existing marker:", markerData)
        confirmedMarkersStore.update((markers) =>
          markers.map((m) => (m.id === id ? markerData : m)),
        )
      }

      selectedMarkerStore.set(null)
    }

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

      const existingMarker = $confirmedMarkersStore.find((m) => m.id === id)
      if (existingMarker) {
        // If the marker exists in the confirmedMarkersStore, remove it and add its ID to the removeMarkerStore
        confirmedMarkersStore.update((markers) => {
          const updatedMarkers = markers.filter((m) => m.id !== id)
          removeMarkerStore.update((removedMarkers) => [
            ...removedMarkers,
            { id, last_confirmed: existingMarker.last_confirmed },
          ])
          return updatedMarkers
        })
        console.log("Marker removed:", id)
      }
    }

    // Hide the marker menu
    controlStore.update((controls) => ({
      ...controls,
      showMarkerMenu: false,
    }))
  }

  async function handleMarkerSelection(event) {
    const map = await getMap()
    const { marker, id } = event
    selectedMarkerStore.set({ marker, id })
    console.log(`Marker selected with ID: ${id}`, $selectedMarkerStore)

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

  async function handleIconSelection(icon) {
    const map = await getMap()
    let iconId = icon.id
    if ($selectedMarkerStore) {
      const { marker, id } = $selectedMarkerStore
      const lngLat = marker.getLngLat()

      marker.remove()

      let newMarker
      if (icon.class.startsWith("custom-svg")) {
        newMarker = createCustomMarker(lngLat, `custom-svg-${iconId}`, id)
      } else {
        newMarker = createCustomMarker(lngLat, icon.class, id)
      }

      newMarker.addTo(map)

      const updatedMarker = { marker: newMarker, id }
      selectedMarkerStore.set(updatedMarker)
    }
  }

  async function applyMarkerActions(actions) {
    const map = await getMap()

    const completedActions = []

    actions.forEach((action, index) => {
      const { markerData } = action
      const { id, marker_data, last_confirmed, iconClass } = markerData

      if (action.action === "add" || action.action === "update") {
        const { geometry, properties } = marker_data
        const { coordinates } = geometry
        const lngLat = new mapboxgl.LngLat(coordinates[0], coordinates[1])

        // Use iconClass if available, otherwise fall back to properties.icon
        const icon = iconClass || properties.icon
        const newMarker = createCustomMarker(lngLat, icon, id)
        newMarker.setLngLat(lngLat).addTo(map)

        if (action.action === "add") {
          confirmedMarkersStore.update((markers) => [
            ...markers,
            { marker: newMarker, id, last_confirmed, iconClass: icon },
          ])
        } else {
          confirmedMarkersStore.update((markers) =>
            markers.map((marker) =>
              marker.id === id
                ? { marker: newMarker, id, last_confirmed, iconClass: icon }
                : marker,
            ),
          )
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

    // Remove completed actions from the markerActionsStore
    if (completedActions.length > 0) {
      markerActionsStore.update((currentActions) =>
        currentActions.filter((_, index) => !completedActions.includes(index)),
      )
    }
  }
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
      <div class="p-2 overflow-auto max-h-64">
        <div class="grid grid-auto-flow grid-auto-columns gap-2">
          {#each markerIcons as icon}
            <button
              class="marker-icon focus:outline-none"
              on:click={() => handleIconSelection(icon)}
            >
              <div
                class="bg-gray-200 hover:bg-gray-300 rounded-lg p-3 transition duration-200 transform hover:scale-125 flex items-center justify-center"
                style="width: 50px; height: 45px;"
              >
                {#if icon.class.startsWith("custom-svg")}
                  <IconSVG icon={icon.id} size="42px" />
                {:else if icon.class.startsWith("ionic-")}
                  <ion-icon name={icon.id} style="font-size: 32px;"></ion-icon>
                {:else}
                  <i class={`${icon.class} text-3xl text-gray-700`}></i>
                {/if}
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
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }
</style>
