<script>
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import "mapbox-gl/dist/mapbox-gl.css"
  import { debounce } from "lodash-es"
  import { mapStore, userVehicleStore } from "../stores/mapStore"
  import UserMarker from "./UserMarker.svelte"
  import ButtonSection from "./ButtonSection.svelte"
  import MapControls from "./MapControls.svelte"
  import IconSVG from "./IconSVG.svelte"

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

  //Constants and variable initializations

  const MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1IjoibHVjaG9kb3JlIiwiYSI6ImNsdndpd2NvNjA5OWUybG14anc1aWJpbXMifQ.7DSbOP9x-3sTZdJ5ee4UKw"
  const DEFAULT_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"
  const DEFAULT_OUTDOORS_STYLE = "mapbox://styles/mapbox/outdoors-v12"
  const ANIMATION_DURATION = 1000

  let mapContainer
  let map
  let isSatelliteStyle = true
  let userMarker

  // mapcontrols
  let showMarkerMenu = false

  // end map controls

  const mapOptions = {
    container: null,
    style: DEFAULT_SATELLITE_STYLE,
    center: [0, 0],
    zoom: 2,
  }

  onMount(() => {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    mapOptions.container = mapContainer
    map = new mapboxgl.Map(mapOptions)

    const mapControls = new MapControls({
      target: mapContainer,
      props: {
        map: map,
      },
    })

    // Listen for the 'markerPlacement' event from MapControls
    mapControls.$on("markerPlacement", handleMarkerPlacement)

    // Add the GeolocateControl to the map
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
      showUserLocation: false,
    })

    map.addControl(geolocateControl, "bottom-right")
    // Trigger the geolocate action when the map loads
    map.on("load", () => {
      geolocateControl.trigger()
    })

    // Create a custom user location marker
    userMarker = new mapboxgl.Marker({
      element: createUserMarkerElement(),
      pitchAlignment: "map",
      rotationAlignment: "map",
    })

    // Update the user location marker on geolocate event
    geolocateControl.on("geolocate", (e) => {
      const { coords } = e
      updateMarkerPosition(coords)
    })

    mapStore.set(map)
  })

  //Finished Setup

  function createUserMarkerElement() {
    const el = document.createElement("div")

    new UserMarker({
      target: el,
      props: {
        pulseColor: "rgba(172, 172, 230, 0.8)",
        pulseSize: "40px",
        vehicleSize: "60px",
        userVehicle: $userVehicleStore,
      },
    })

    return el
  }

  let currentRotation = 0
  let currentLat = 0
  let currentLng = 0

  const updateMarkerPosition = debounce((coords) => {
    const { latitude, longitude, heading } = coords

    const targetLat = latitude
    const targetLng = longitude
    const targetRotation = heading

    const latDiff = targetLat - currentLat
    const lngDiff = targetLng - currentLng
    const rotationDiff = targetRotation - currentRotation

    const distanceThreshold = 0.00004 // Adjust this value as needed
    const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2)

    if (distance < distanceThreshold) {
      // If the distance is too small, skip the animation
      return
    }

    const duration = ANIMATION_DURATION // Duration in milliseconds
    const steps = duration / 16 // Number of steps based on 60 FPS (16.67ms per frame)

    const latStep = latDiff / steps
    const lngStep = lngDiff / steps
    const rotationStep = rotationDiff / steps

    let currentStep = 0

    function animateMarker() {
      currentLat += latStep
      currentLng += lngStep
      currentRotation += rotationStep

      userMarker.setLngLat([currentLng, currentLat])

      const vehicleIcon = userMarker.getElement().querySelector(".vehicle-icon")
      vehicleIcon.style.transform = `rotate(${currentRotation}deg)`

      currentStep++

      if (currentStep < steps) {
        requestAnimationFrame(animateMarker)
      }
    }

    userMarker.setLngLat([currentLng, currentLat]).addTo(map)
    animateMarker()
  }, ANIMATION_DURATION)

  function toggleMapStyle() {
    if (isSatelliteStyle) {
      map.setStyle(DEFAULT_OUTDOORS_STYLE)
    } else {
      map.setStyle(DEFAULT_SATELLITE_STYLE)
    }
    isSatelliteStyle = !isSatelliteStyle
  }

  let recentMarker = null
  let confirmedMarkers = []

  // MapViewer.svelte
  function handleIconSelection(iconId) {
    if (recentMarker) {
      const lngLat = recentMarker.getLngLat()
      recentMarker.remove()
      // Find the selected icon object based on the iconId
      const selectedIcon = markerIcons.find((icon) => icon.id === iconId.detail)

      console.log("selectedIcon:", selectedIcon)

      if (selectedIcon) {
        // Create a custom marker element based on the selected icon
        const markerElement = document.createElement("div")
        markerElement.style.display = "flex"
        markerElement.style.justifyContent = "center"
        markerElement.style.alignItems = "center"
        markerElement.style.width = "60px"
        markerElement.style.height = "60px"
        markerElement.style.borderRadius = "100%"
        markerElement.style.backgroundColor = "white"
        markerElement.style.opacity = 0.9
        markerElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"

        // Create an <i> element with the selected icon class
        const iconElement = document.createElement("i")
        iconElement.className = selectedIcon.class
        iconElement.style.fontSize = "40px"
        iconElement.style.color = "#000000"

        markerElement.appendChild(iconElement)

        // Add the new custom marker at the same location
        recentMarker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat(lngLat)
          .addTo(map)
      } else {
        console.log("recentMarker is null or undefined")
      }
    }
  }

  function handleMarkerPlacement(event) {
    const { lngLat } = event.detail

    if (lngLat) {
      // Remove the previous recent marker if it exists
      if (recentMarker) {
        recentMarker.remove()
      }

      // Place the new marker on the map
      recentMarker = new mapboxgl.Marker().setLngLat(lngLat).addTo(map)

      // Center the screen on the placed marker
      map.flyTo({
        center: lngLat,
        zoom: 15, // Adjust the zoom level as needed
        duration: 1000, // Adjust the duration of the animation as needed
      })
      showMarkerMenu = true

      // Open the confirmation/customization menu
      // Implement your menu functionality here
      console.log("Marker placed at:", lngLat)
    } else {
      console.error("Invalid event format. Missing lngLat property.")
    }
  }

  function confirmMarker() {
    // Add the recent marker to the confirmedMarkers array
    if (recentMarker) {
      confirmedMarkers.push(recentMarker)
      recentMarker = null
    }

    // Hide the marker menu
    showMarkerMenu = false
  }

  function removeMarker() {
    // Remove the recent marker from the map and the confirmedMarkers array
    if (recentMarker) {
      const index = confirmedMarkers.indexOf(recentMarker)
      if (index !== -1) {
        confirmedMarkers.splice(index, 1)
      }
      recentMarker.remove()
      recentMarker = null
    }

    // Hide the marker menu
    showMarkerMenu = false
  }
</script>

<div class="map-container" bind:this={mapContainer}>
  <ButtonSection
    on:toggleMapStyleDispatcher={toggleMapStyle}
    {showMarkerMenu}
    {markerIcons}
    on:confirmMarker={confirmMarker}
    on:removeMarker={removeMarker}
    on:iconSelected={handleIconSelection}
  />
</div>

<style>
  .map-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
