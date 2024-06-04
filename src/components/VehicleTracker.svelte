<!-- VehicleTracker.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import mapboxgl from "mapbox-gl"
  import {
    userVehicleStore,
    otherVehiclesStore,
    otherVehiclesDataChanges,
  } from "../stores/vehicleStore"
  import UserMarker from "./UserMarker.svelte"
  import { debounce } from "lodash-es"

  export let map

  let geolocateControl
  let userMarker
  let locationTrackingInterval
  let lastRecordedTime = 0
  let otherVehicleMarkers = []

  const ANIMATION_DURATION = 500 // Adjust this value as needed
  const DISTANCE_THRESHOLD = 0.0
  const LOCATION_TRACKING_INTERVAL_TRIGGER = 11114000 // Adjust this value as needed
  const LOCATION_TRACKING_INTERVAL_MIN = 1000
  let isTrailingOn = false // Flag to control the trailing feature
  let otherVehiclesUnsubscribe
  let userVehicleUnsubscribe
  let unsubscribeOtherVehiclesDataChanges
  let userCoordinates = null

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

    // Update the user location marker on geolocate event
    geolocateControl.on("geolocate", (e) => {
      const { coords } = e
      console.log("Received heading from geolocate event:", coords.heading)

      updateMarkerPosition(coords)
      streamMarkerPosition(coords)
    })

    startLocationTracking()

    // Subscribe to userVehicleStore updates
    userVehicleUnsubscribe = userVehicleStore.subscribe((value) => {
      userCoordinates = value.coordinates
      updateUserMarker(value.vehicle_marker)
    })

    // Subscribe to the otherVehiclesDataChanges store
    unsubscribeOtherVehiclesDataChanges =
      otherVehiclesDataChanges.subscribe(processChanges)
  })

  onDestroy(() => {
    // Clean up the geolocateControl and userMarker
    if (userMarker) {
      userMarker.remove()
    }
    stopLocationTracking()

    if (userVehicleUnsubscribe) {
      userVehicleUnsubscribe()
    }

    // Unsubscribe from otherVehiclesStore updates
    if (otherVehiclesUnsubscribe) {
      otherVehiclesUnsubscribe()
    }

    // Unsubscribe from the otherVehiclesDataChanges store
    if (unsubscribeOtherVehiclesDataChanges) {
      unsubscribeOtherVehiclesDataChanges()
    }
  })

  function processChanges(changes) {
    changes.forEach((change) => {
      const { coordinates, heading, vehicle_marker, vehicle_id } = change

      // Parse the coordinates string into an array of numbers
      const [longitude, latitude] = coordinates
        .slice(1, -1) // Remove the parentheses
        .split(",") // Split by comma
        .map(parseFloat) // Convert each value to a number

      // Find the existing marker for the vehicle
      const existingMarker = otherVehicleMarkers.find((marker) => {
        const vehicleId = marker.getElement().getAttribute("data-vehicle-id")
        return vehicleId === vehicle_id
      })

      if (existingMarker) {
        // Update the existing marker's position and rotation
        animateMarker(existingMarker, longitude, latitude, heading)
      } else {
        // Create a new marker for the vehicle
        const marker = new mapboxgl.Marker({
          element: createMarkerElement(vehicle_marker, false, vehicle_id),
          pitchAlignment: "map",
          rotationAlignment: "map",
        })

        marker.setLngLat([longitude, latitude]).setRotation(heading).addTo(map)
        otherVehicleMarkers.push(marker)
      }

      // Update the otherVehiclesStore with the change
      otherVehiclesStore.update((vehicles) => {
        const index = vehicles.findIndex(
          (vehicle) => vehicle.vehicle_id === vehicle_id,
        )
        if (index !== -1) {
          vehicles[index] = change
        } else {
          vehicles.push(change)
        }
        return vehicles
      })
    })
  }

  //Animate other markers
  function animateMarker(marker, targetLng, targetLat, targetRotation) {
    const currentLngLat = marker.getLngLat()
    const currentRotation = marker.getRotation()

    const lngDiff = targetLng - currentLngLat.lng
    const latDiff = targetLat - currentLngLat.lat
    const rotationDiff = targetRotation - currentRotation

    const distanceThreshold = DISTANCE_THRESHOLD
    const distance = Math.sqrt(lngDiff ** 2 + latDiff ** 2)

    if (distance < distanceThreshold) {
      // If the distance is too small, skip the animation
      return
    }

    const duration = ANIMATION_DURATION
    const steps = duration / 16

    const lngStep = lngDiff / steps
    const latStep = latDiff / steps
    const rotationStep = rotationDiff / steps

    let currentStep = 0

    function animate() {
      const newLng = currentLngLat.lng + lngStep
      const newLat = currentLngLat.lat + latStep
      const newRotation = currentRotation + rotationStep

      marker.setLngLat([newLng, newLat]).setRotation(newRotation)

      const vehicleIcon = marker.getElement().querySelector(".vehicle-icon")
      if (vehicleIcon) {
        vehicleIcon.style.transform = `rotate(${newRotation}deg)`
      }

      currentStep++

      if (currentStep < steps) {
        requestAnimationFrame(animate)
      } else {
        // Animation completed, log the rotation information
        const markerElement = marker.getElement()
        const vehicleId = markerElement.getAttribute("data-vehicle-id")
        const rotationDegrees = Math.round((rotationDiff * 180) / Math.PI)
        console.log(
          `Marker ${vehicleId} rotated ${rotationDegrees}° from ${Math.round(
            (currentRotation * 180) / Math.PI,
          )}° to ${Math.round((newRotation * 180) / Math.PI)}°`,
        )
      }

      // Log the current rotation at each step of the animation
      console.log(
        `Marker ${vehicleId} - Step ${currentStep}: Current rotation: ${Math.round(
          (newRotation * 180) / Math.PI,
        )}°`,
      )
    }

    // Log the initial rotation before starting the animation
    const markerElement = marker.getElement()
    const vehicleId = markerElement.getAttribute("data-vehicle-id")
    console.log(
      `Marker ${vehicleId} - Initial rotation: ${Math.round(
        (currentRotation * 180) / Math.PI,
      )}°`,
    )

    animate()
  }

  function updateUserMarker(vehicleMarker) {
    if (userMarker) {
      userMarker.remove()
    }

    userMarker = new mapboxgl.Marker({
      element: createMarkerElement(vehicleMarker, true),
      pitchAlignment: "map",
      rotationAlignment: "map",
    })

    if ($userVehicleStore.coordinates) {
      const { latitude, longitude } = $userVehicleStore.coordinates
      userMarker.setLngLat([longitude, latitude]).addTo(map)
    }
  }

  function createMarkerElement(
    vehicleMarker,
    isUserVehicle = false,
    vehicleId = null,
  ) {
    const el = document.createElement("div")
    el.setAttribute("data-vehicle-id", vehicleId)

    new UserMarker({
      target: el,
      props: {
        pulseColor: "rgba(172, 172, 230, 0.8)",
        pulseSize: "40px",
        vehicleSize: vehicleMarker.size,
        userVehicle: vehicleMarker.type,
        vehicleColor: vehicleMarker.color,
        showPulse: isUserVehicle,
      },
    })

    return el
  }

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
    console.log("Recording location data - Heading:", heading)

    const vehicleData = {
      coordinates: { latitude, longitude },
      last_update: new Date().toISOString(),
      is_trailing: isTrailingOn,
      vehicle_marker: $userVehicleStore.vehicle_marker,
    }

    if (heading !== null) {
      vehicleData.heading = heading
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

  const updateMarkerPosition = debounce((coords) => {
    const { latitude, longitude, heading } = coords

    if (userMarker) {
      animateMarker(userMarker, longitude, latitude, heading)
    }
  }, ANIMATION_DURATION)
</script>
