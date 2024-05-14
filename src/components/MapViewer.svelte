<script>
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import "mapbox-gl/dist/mapbox-gl.css"
  import { debounce } from "lodash-es"
  import { mapStore, userVehicleStore } from "../stores/mapStore"

  import UserMarker from "./UserMarker.svelte"
  import ButtonSection from "./ButtonSection.svelte"

  const MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1IjoibHVjaG9kb3JlIiwiYSI6ImNsdndpd2NvNjA5OWUybG14anc1aWJpbXMifQ.7DSbOP9x-3sTZdJ5ee4UKw"
  const DEFAULT_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"
  const DEFAULT_OUTDOORS_STYLE = "mapbox://styles/mapbox/outdoors-v12"
  const ANIMATION_DURATION = 1000

  let mapContainer
  let map
  let isSatelliteStyle = true
  let userMarker

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
</script>

<div class="map-container" bind:this={mapContainer}>
  <ButtonSection on:toggleMapStyleDispatcher={toggleMapStyle} />
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
