<!-- VehicleTracker.svelte -->

<script>
  import { onMount, onDestroy } from "svelte"
  import mapboxgl from "mapbox-gl"
  import {
    userVehicleStore,
    userVehicleTrailing,
    otherVehiclesStore,
    otherVehiclesDataChanges,
  } from "../stores/vehicleStore"
  import UserMarker from "./UserMarker.svelte"
  import { unsavedTrailStore } from "../stores/trailDataStore"
  import { toast } from "svelte-sonner"
  import { page } from "$app/stores"
  import "../styles/global.css"

  export let map
  export let disableAutoZoom = false

  let userVehicleId
  let geolocateControl
  let userMarker
  let lastRecordedTime = 0
  let lastClientTime = 0
  let otherVehicleMarkers = []

  const LOCATION_TRACKING_INTERVAL_MIN = 30
  const REJOIN_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds

  let otherVehiclesUnsubscribe
  let userVehicleUnsubscribe
  let unsubscribeOtherVehiclesDataChanges
  let userCoordinates = null
  let lastClientCoordinates = null
  let lastClientHeading = null
  let previousVehicleMarker = null

  onMount(() => {
    // Create the geolocateControl and add it to the map
    // console.log("Adding geolocateControl to the map")
    console.log("Mounting VehicleTracker")

    const session = $page.data.session
    if (session) {
      userVehicleId = session.user.id
    }
    geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
      showUserLocation: false,
      className: "custom-geolocate-control",
    })

    map.addControl(geolocateControl, "bottom-right")
    map.on("load", () => {
      if (!disableAutoZoom) {
        geolocateControl.trigger()
      }
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
    console.log("Unmounting VehicleTracker")
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
    // console.log("Received changes from otherVehiclesDataChanges:", changes)

    const REJOIN_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds

    changes.forEach((change) => {
      const {
        coordinates,
        heading,
        vehicle_marker,
        vehicle_id,
        update_types,
        is_trailing,
        last_update,
        full_name,
      } = change

      // Parse the coordinates string into an array of numbers
      const [longitude, latitude] = coordinates
        .slice(1, -1)
        .split(",")
        .map(parseFloat)

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

          // Add toast for vehicle type change
          //   toast.info(`Vehicle Type Changed`, {
          //     description: `${full_name} changed their vehicle to ${vehicle_marker.type}`,
          //     action: {
          //       label: "Locate",
          //       onClick: () => {
          //         map.flyTo({
          //           center: [longitude, latitude],
          //           zoom: 15,
          //           duration: 1000,
          //         })
          //       },
          //     },
          //   })
        }

        if (
          update_types.includes("position_changed") ||
          update_types.includes("heading_changed")
        ) {
          // Animate the marker to the new position and heading
          animateMarker(existingMarker, longitude, latitude, heading)
        }
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
          const oldVehicle = vehicles[index]

          if (
            update_types.includes("last_update_changed") &&
            !update_types.includes("new_vehicle")
          ) {
            //Toast for a vehicle rejoining the map after a given period of time, removed because many calculations required not sure if it's too intensive
            // const timeDifference =
            //   new Date(last_update) - new Date(oldVehicle.last_update)
            // console.log(
            //   `Time difference for vehicle ${vehicle_id}: ${timeDifference} ms`,
            // )
            // if (timeDifference > REJOIN_THRESHOLD) {
            //   toast.info(`Vehicle Rejoined`, {
            //     description: `${full_name}'s ${vehicle_marker.type} has joined the map`,
            //     action: {
            //       label: "Locate",
            //       onClick: () => {
            //         map.flyTo({
            //           center: [longitude, latitude],
            //           zoom: 15,
            //           duration: 1000,
            //         })
            //       },
            //     },
            //   })
            // }
          }

          if (
            update_types.includes("trailing_status_changed") &&
            !update_types.includes("new_vehicle")
          ) {
            toast.info(`Trailing Status Changed`, {
              description: `${full_name}'s ${vehicle_marker.type} has ${is_trailing ? "started" : "stopped"} trailing`,
              action: {
                label: "Locate",
                onClick: () => {
                  map.flyTo({
                    center: [longitude, latitude],
                    zoom: 15,
                    duration: 1000,
                  })
                },
              },
            })
          }

          vehicles[index] = { ...oldVehicle, ...change }
        } else {
          vehicles.push(change)
        }
        return vehicles
      })
    })

    // Clear the otherVehicleDataChanges store after processing the changes
  }

  function animateMarker(marker, targetLng, targetLat, targetRotation) {
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

    const duration = 1000 // Animation duration in milliseconds
    const start = performance.now()

    function animate(timestamp) {
      const elapsed = timestamp - start
      const t = Math.min(elapsed / duration, 1) // Normalize time between 0 and 1

      // Use an easing function for smoother animation
      const easing = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

      const lng = currentLngLat.lng + lngDiff * easing
      const lat = currentLngLat.lat + latDiff * easing
      const rotation = currentRotation + rotationDiff * easing

      marker.setLngLat([lng, lat]).setRotation(rotation)

      if (elapsed < duration) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  function updateUserMarker(vehicleMarker) {
    if (userMarker && previousVehicleMarker) {
      // Compare the current vehicle marker with the previous one
      if (
        vehicleMarker.type === previousVehicleMarker.type &&
        vehicleMarker.bodyColor === previousVehicleMarker.bodyColor &&
        vehicleMarker.size === previousVehicleMarker.size &&
        vehicleMarker.swath === previousVehicleMarker.swath
      ) {
        // Vehicle marker hasn't changed, no need to update the marker
        // console.log("Vehicle marker hasn't changed")
        return
      }
    }

    // Vehicle marker has changed or user marker hasn't been placed yet
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
      // Update the previous vehicle marker
      previousVehicleMarker = { ...vehicleMarker }
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
        vehicleColor: vehicleMarker.bodyColor,
        vehicleSwath: vehicleMarker.swath,
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
      last_update: currentTime,
      vehicle_marker: $userVehicleStore.vehicle_marker,
    }

    const updatedHeading = heading !== null ? Math.round(heading) : heading
    // console.log("Server-side heading before adding to store:", updatedHeading);
    // console.log("updating vehicle dataa", vehicleData)
    updateUserVehicleData(currentTime, vehicleData, updatedHeading)
  }

  function updateUserVehicleData(currentTime, vehicleData, updatedHeading) {
    // Check if the time interval condition is met
    if (currentTime - lastRecordedTime >= LOCATION_TRACKING_INTERVAL_MIN) {
      const { coordinates } = vehicleData
      const { bodyColor, swath } = vehicleData.vehicle_marker
      const { latitude, longitude } = coordinates

      //TODO move this function after checking if it's a unique marker, ie. different coordinates or heading
      // Store the location data locally only if isTrailingFunction is on
      if ($userVehicleTrailing) {
        const locationData = {
          coordinates: { latitude, longitude },
          timestamp: currentTime,
          color: bodyColor,
          swath: swath,
        }
        console.log("Saving location data:", locationData)
        unsavedTrailStore.update((markers) => [...markers, locationData])
      }

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

        userVehicleStore.update((vehicle) => {
          return {
            ...vehicle,
            coordinates: vehicleData.coordinates,
            last_update: vehicleData.last_update,
            vehicle_marker: vehicleData.vehicle_marker,
            heading: updatedHeading,
          }
        })

        // Animate the user marker with the new position and heading
        if (userMarker && userMarker.getLngLat()) {
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
</script>

<style>
  .mapboxgl-ctrl-group {
    border-radius: 1px;
  }
</style>
