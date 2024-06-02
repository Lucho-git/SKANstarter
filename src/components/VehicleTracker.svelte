<!-- VehicleTracker.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import mapboxgl from "mapbox-gl"
  import { userVehicleStore } from "../stores/vehicleStore"
  import UserMarker from "./UserMarker.svelte"
  import { debounce } from "lodash-es"
  import VehicleStateSynchronizer from "./VehicleStateSynchronizer.svelte"

  export let map

  let geolocateControl
  let userMarker
  let locationTrackingInterval
  let lastRecordedTime = 0

  const ANIMATION_DURATION = 500 // Adjust this value as needed
  const DISTANCE_THRESHOLD = 0.00001
  const LOCATION_TRACKING_INTERVAL_TRIGGER = 11114000 // Adjust this value as needed
  const LOCATION_TRACKING_INTERVAL_MIN = 1000
  let isTrailingOn = false // Flag to control the trailing feature

  onMount(() => {
    // Create the geolocateControl and add it to the map
    console.log("Adding geolocateControl to the map")
    geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
      showUserLocation: false,
    })
    map.addControl(geolocateControl, "bottom-right")
    map.on("load", () => {
      geolocateControl.trigger()
    })
    // Create the userMarker
    userMarker = new mapboxgl.Marker({
      element: createUserMarkerElement(),
      pitchAlignment: "map",
      rotationAlignment: "map",
    })

    // Update the user location marker on geolocate event
    geolocateControl.on("geolocate", (e) => {
      const { coords } = e
      updateMarkerPosition(coords)
      streamMarkerPosition(coords)
    })

    startLocationTracking()
  })

  onDestroy(() => {
    // Clean up the geolocateControl and userMarker
    if (userMarker) {
      userMarker.remove()
    }
    stopLocationTracking()
  })

  function startLocationTracking() {
    locationTrackingInterval = setInterval(() => {
      geolocateControl.trigger()
    }, LOCATION_TRACKING_INTERVAL_TRIGGER)
  }

  function stopLocationTracking() {
    clearInterval(locationTrackingInterval)
  }

  function streamMarkerPosition(coords) {
    const currentTime = Date.now()
    if (currentTime - lastRecordedTime >= LOCATION_TRACKING_INTERVAL_MIN) {
      //Set the minimum length of time between location updates
      recordLocationData(coords)
      lastRecordedTime = currentTime
    }
  }

  function recordLocationData(locationData) {
    const { latitude, longitude, heading } = locationData

    const vehicleData = {
      coordinates: { latitude, longitude },
      last_update: new Date().toISOString(),
      heading,
      is_trailing: isTrailingOn,
      vehicle_marker: $userVehicleStore.vehicle_marker,
    }
    console.log("Recording location data:", vehicleData)
    // Update the userVehicleStore with the latest vehicle state
    userVehicleStore.update((vehicle) => {
      return {
        ...vehicle,
        ...vehicleData,
      }
    })
  }

  let vehicleStateSynchronizer

  function handleVehicleStateUpdated(event) {
    const vehicleData = event.detail
    console.log("Vehicle state updated:", vehicleData)
  }

  function storeLocationDataLocally(locationData) {
    // Implement the logic to store the location data in local storage
    // You can use IndexedDB or localStorage for this purpose
    // Ensure that the data is stored in an ordered manner

    // Example using localStorage
    const storedData = localStorage.getItem("vehicleLocationData")
    const locationDataArray = storedData ? JSON.parse(storedData) : []

    locationDataArray.push(locationData)

    localStorage.setItem(
      "vehicleLocationData",
      JSON.stringify(locationDataArray),
    )
  }

  function createUserMarkerElement() {
    const el = document.createElement("div")

    new UserMarker({
      target: el,
      props: {
        pulseColor: "rgba(172, 172, 230, 0.8)",
        pulseSize: "40px",
        vehicleSize: $userVehicleStore.size,
        userVehicle: $userVehicleStore.type,
        vehicleColor: $userVehicleStore.color,
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

    const distanceThreshold = DISTANCE_THRESHOLD // Adjust this value as needed
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
      if (vehicleIcon) {
        vehicleIcon.style.transform = `rotate(${currentRotation}deg)`
      }

      currentStep++

      if (currentStep < steps) {
        requestAnimationFrame(animateMarker)
      }
    }

    userMarker.setLngLat([currentLng, currentLat]).addTo(map)
    animateMarker()
  }, ANIMATION_DURATION)
</script>

<VehicleStateSynchronizer
  bind:this={vehicleStateSynchronizer}
  on:vehicleStateUpdated={handleVehicleStateUpdated}
/>
