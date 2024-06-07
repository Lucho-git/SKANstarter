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
  let lastRecordedTime = 0
  let lastClientTime = 0
  let otherVehicleMarkers = []

  const ANIMATION_DURATION = 500 // Adjust this value as needed
  const DISTANCE_THRESHOLD = 0.0
  const LOCATION_TRACKING_INTERVAL_MIN = 1000
  let isTrailingOn = false // Flag to control the trailing feature
  let otherVehiclesUnsubscribe
  let userVehicleUnsubscribe
  let unsubscribeOtherVehiclesDataChanges
  let userCoordinates = null
  let lastClientCoordinates = null
  let lastClientHeading = null

  onMount(() => {
    // Create the geolocateControl and add it to the map
    // console.log("Adding geolocateControl to the map")
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
      //   console.log("Received heading from geolocate event:", coords.heading)
      streamMarkerPosition(coords)
    })

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

    // Unsubscribe from userVehicleupdates
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
      const { coordinates, heading, vehicle_marker, vehicle_id, update_types } =
        change

      // Parse the coordinates string into an array of numbers
      const [longitude, latitude] = coordinates
        .slice(1, -1) // Remove the parentheses
        .split(",") // Split by comma
        .map(parseFloat) // Convert each value to a number

      // Find the existing marker for the vehicle
      const existingMarkerIndex = otherVehicleMarkers.findIndex((marker) => {
        const vehicleId = marker.getElement().getAttribute("data-vehicle-id")
        return vehicleId === vehicle_id
      })

      if (existingMarkerIndex !== -1) {
        const existingMarker = otherVehicleMarkers[existingMarkerIndex]

        if (update_types.includes("vehicle_marker_changed")) {
          // Remove the existing marker
          existingMarker.remove()

          // Create a new marker with the updated vehicle marker
          const newMarker = new mapboxgl.Marker({
            element: createMarkerElement(vehicle_marker, false, vehicle_id),
            pitchAlignment: "map",
            rotationAlignment: "map",
          })

          newMarker
            .setLngLat([longitude, latitude])
            .setRotation(heading)
            .addTo(map)
          otherVehicleMarkers[existingMarkerIndex] = newMarker
        }

        if (
          update_types.includes("position_changed") ||
          update_types.includes("heading_changed")
        ) {
          console.log("Animating user marker")
          // Animate the marker to the new position and heading
          animateMarker(existingMarker, longitude, latitude, heading)
        }
      } else if (update_types.includes("new_vehicle")) {
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

    // Clear the otherVehicleDataChanges store after processing the changes
  }

  function animateMarker(
    marker,
    targetLng,
    targetLat,
    targetRotation,
    isUserVehicle = false,
  ) {
    const currentLngLat = marker.getLngLat()
    const currentRotation = marker.getRotation() // Rotation is already in degrees

    const lngDiff = targetLng - currentLngLat.lng
    const latDiff = targetLat - currentLngLat.lat
    let rotationDiff = targetRotation - currentRotation

    // Ensure the rotation difference is within -180 to 180 degrees
    if (rotationDiff > 180) {
      rotationDiff -= 360
    } else if (rotationDiff < -180) {
      rotationDiff += 360
    }

    const distanceThreshold = DISTANCE_THRESHOLD
    const distance = Math.sqrt(lngDiff ** 2 + latDiff ** 2)

    if (distance < distanceThreshold) {
      // If the distance is too small, skip the animation
      console.log("Skipping animation")
      return
    }

    const duration = ANIMATION_DURATION
    const steps = duration / 45

    const lngStep = lngDiff / steps
    const latStep = latDiff / steps
    const rotationStep = rotationDiff / steps

    let currentStep = 0

    function animate() {
      const newLng = currentLngLat.lng + lngStep
      const newLat = currentLngLat.lat + latStep
      const newRotation = currentRotation + rotationStep

      marker.setLngLat([newLng, newLat]).setRotation(newRotation) // Rotation is in degrees

      const vehicleIcon = marker.getElement().querySelector(".vehicle-icon")
      if (vehicleIcon) {
        vehicleIcon.style.transform = `rotate(${newRotation}deg)`
      }

      currentStep++

      if (currentStep < steps) {
        requestAnimationFrame(animate)
      } else {
        // Animation completed, log the rotation information
        const rotationDegrees = Math.round(rotationDiff)
        if (isUserVehicle) {
          console.log(
            `User vehicle rotated ${rotationDegrees}° from ${Math.round(
              currentRotation,
            )}° to ${Math.round(newRotation)}°`,
          )
        } else {
          const markerElement = marker.getElement()
          const vehicleId = markerElement.getAttribute("data-vehicle-id")
          console.log(
            `Marker ${vehicleId} rotated ${rotationDegrees}° from ${Math.round(
              currentRotation,
            )}° to ${Math.round(newRotation)}°`,
          )
        }
      }

      // Log the current rotation at each step of the animation
      if (isUserVehicle) {
        console.log(
          `User vehicle - Step ${currentStep}: Current rotation: ${Math.round(
            newRotation,
          )}°`,
        )
      } else {
        const markerElement = marker.getElement()
        const vehicleId = markerElement.getAttribute("data-vehicle-id")
        console.log(
          `Marker ${vehicleId} - Step ${currentStep}: Current rotation: ${Math.round(
            newRotation,
          )}°`,
        )
      }
    }

    // Log the initial rotation before starting the animation
    if (isUserVehicle) {
      console.log(
        `User vehicle - Initial rotation: ${Math.round(currentRotation)}°`,
      )
    } else {
      const markerElement = marker.getElement()
      const vehicleId = markerElement.getAttribute("data-vehicle-id")
      console.log(
        `Marker ${vehicleId} - Initial rotation: ${Math.round(currentRotation)}°`,
      )
    }

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

  function streamMarkerPosition(coords) {
    const { latitude, longitude, heading } = coords
    // console.log("Client-side heading before processing:", heading);

    const currentTime = Date.now()

    // Record all the necessary data
    const vehicleData = {
      coordinates: { latitude, longitude },
      last_update: new Date().toISOString(),
      is_trailing: isTrailingOn,
      vehicle_marker: $userVehicleStore.vehicle_marker,
    }

    const updatedHeading = heading !== null ? Math.round(heading) : heading
    // console.log("Server-side heading before adding to store:", updatedHeading);

    updateUserVehicleData(currentTime, vehicleData, updatedHeading)
  }

  function updateUserVehicleData(currentTime, vehicleData, updatedHeading) {
    // Check if the time interval condition is met
    if (currentTime - lastRecordedTime >= LOCATION_TRACKING_INTERVAL_MIN) {
      const { coordinates } = vehicleData
      const { latitude, longitude } = coordinates

      // Check if the coordinates or heading have changed
      if (
        !lastClientCoordinates ||
        lastClientCoordinates.latitude !== latitude ||
        lastClientCoordinates.longitude !== longitude ||
        lastClientHeading !== updatedHeading
      ) {
        let changeLog = ""

        if (!lastClientCoordinates) {
          changeLog += "Initial coordinates. "
        } else {
          if (lastClientCoordinates.latitude !== latitude) {
            const latitudeDiff = latitude - lastClientCoordinates.latitude
            changeLog += `Latitude changed by ${latitudeDiff.toFixed(6)}. `
          }
          if (lastClientCoordinates.longitude !== longitude) {
            const longitudeDiff = longitude - lastClientCoordinates.longitude
            changeLog += `Longitude changed by ${longitudeDiff.toFixed(6)}. `
          }
        }

        if (lastClientHeading !== updatedHeading) {
          const headingDiff = updatedHeading - lastClientHeading
          changeLog += `Heading changed by ${headingDiff.toFixed(2)}°.`
        }

        console.log("Changes detected:", changeLog)

        // Update the userVehicleStore with the latest vehicle state
        userVehicleStore.update((vehicle) => {
          return {
            ...vehicle,
            coordinates: vehicleData.coordinates,
            last_update: vehicleData.last_update,
            is_trailing: vehicleData.is_trailing,
            vehicle_marker: vehicleData.vehicle_marker,
            heading: updatedHeading,
          }
        })

        // Animate the user marker with the new position and heading
        if (userMarker) {
          animateMarker(userMarker, longitude, latitude, updatedHeading)
        }

        // Update the last coordinates and heading
        lastClientCoordinates = { latitude, longitude }
        lastClientHeading = updatedHeading
      } else {
        // console.log("No changes detected.");
      }

      lastRecordedTime = currentTime
    }
  }

  function storeLocationDataLocally(locationData) {
    // Implement the logic to store the location data in local storage
    // You can use IndexedDB or localStorage for this purpose
    // Ensure that the data is stored in an ordered manner
  }
</script>
