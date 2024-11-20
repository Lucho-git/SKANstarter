<!-- VehicleStateSynchronizer.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import { supabase } from "../lib/supabaseClient"
  import {
    userVehicleStore,
    otherVehiclesStore,
    serverOtherVehiclesData,
    otherVehiclesDataChanges,
    userVehicleTrailing,
  } from "../stores/vehicleStore"
  import { profileStore } from "../stores/profileStore"
  import { vehicleDataLoaded } from "../stores/loadedStore"
  import { page } from "$app/stores"

  let channel = null
  let unsubscribe
  let lastDatabaseUpdate = 0
  let previousVehicleData = null
  const DATABASE_UPDATE_INTERVAL = 10000 // 10 seconds

  async function fetchUserVehicleData(userId) {
    const { data, error } = await supabase
      .from("vehicle_state")
      .select("*")
      .eq("vehicle_id", userId)
      .single()

    if (error) {
      console.error("Error fetching user vehicle data:", error)
      return null
    }

    return data
  }

  async function fetchInitialVehicleData(masterMapId, userId) {
    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicle_state")
      .select(
        `
          *,
          profiles:vehicle_id (full_name)
        `,
      )
      .eq("master_map_id", masterMapId)

    console.log("Vehicles:", vehicles)
    if (vehiclesError) {
      console.error("Error retrieving initial vehicle data:", vehiclesError)
      return []
    }

    return vehicles
      .filter((vehicle) => vehicle.vehicle_id !== userId)
      .map((vehicle) => ({
        ...vehicle,
        full_name: vehicle.profiles.full_name,
      }))
  }

  function compareData(serverData, clientData) {
    const changes = serverData.map((serverItem) => {
      const clientItem = clientData.find(
        (item) => item.vehicle_id === serverItem.vehicle_id,
      )

      const change = {
        vehicle_id: serverItem.vehicle_id,
        coordinates: serverItem.coordinates,
        heading: serverItem.heading,
        vehicle_marker: serverItem.vehicle_marker,
        is_trailing: serverItem.is_trailing,
        last_update: serverItem.last_update,
        full_name: serverItem.full_name || clientItem?.full_name,
        update_types: [],
      }

      if (!clientItem) {
        change.update_types.push("new_vehicle")
      } else {
        const vehicleMarkerChanged =
          JSON.stringify(serverItem.vehicle_marker) !==
          JSON.stringify(clientItem.vehicle_marker)
        const coordinatesChanged =
          serverItem.coordinates !== clientItem.coordinates
        const headingChanged = serverItem.heading !== clientItem.heading
        const isTrailingChanged =
          serverItem.is_trailing !== clientItem.is_trailing
        const lastUpdateChanged =
          serverItem.last_update !== clientItem.last_update

        if (vehicleMarkerChanged)
          change.update_types.push("vehicle_marker_changed")
        if (coordinatesChanged) change.update_types.push("position_changed")
        if (headingChanged) change.update_types.push("heading_changed")
        if (isTrailingChanged)
          change.update_types.push("trailing_status_changed")
        if (lastUpdateChanged) change.update_types.push("last_update_changed")
      }

      return change
    })

    return changes.filter((change) => change.update_types.length > 0)
  }

  async function broadcastVehicleState(vehicleData) {
    const userId = $profileStore.id
    const masterMapId = $profileStore.master_map_id

    const { coordinates, last_update, heading, vehicle_marker } = vehicleData

    if (!coordinates) {
      console.warn("Coordinates not available. Skipping vehicle state update.")
      return
    }

    const vehicleStateData = {
      vehicle_id: userId,
      master_map_id: masterMapId,
      coordinates: `(${coordinates.longitude},${coordinates.latitude})`,
      last_update: new Date(last_update).toISOString(),
      is_trailing: $userVehicleTrailing,
      vehicle_marker,
      heading: heading !== null ? heading : null,
    }

    try {
      await channel.send({
        type: "broadcast",
        event: "vehicle_update",
        payload: vehicleStateData,
      })
    } catch (error) {
      console.error("Error broadcasting vehicle state:", error)
    }
  }

  async function updateDatabaseVehicleState(vehicleData, forceUpdate = false) {
    const userId = $profileStore.id
    const masterMapId = $profileStore.master_map_id

    const { coordinates, last_update, heading, vehicle_marker } = vehicleData

    if (!coordinates) {
      console.warn("Coordinates not available. Skipping database update.")
      return
    }

    // Check if any non-movement properties have changed
    const hasNonMovementChanges =
      previousVehicleData &&
      (JSON.stringify(vehicleData.vehicle_marker) !==
        JSON.stringify(previousVehicleData.vehicle_marker) ||
        vehicleData.is_trailing !== previousVehicleData.is_trailing)
      // Add any other properties that should trigger immediate updates

    const currentTime = Date.now()
    const shouldUpdate =
      forceUpdate ||
      hasNonMovementChanges ||
      lastDatabaseUpdate === 0 ||
      currentTime - lastDatabaseUpdate >= DATABASE_UPDATE_INTERVAL

    if (!shouldUpdate) {
      return
    }

    const vehicleStateData = {
      vehicle_id: userId,
      master_map_id: masterMapId,
      coordinates: `(${coordinates.longitude},${coordinates.latitude})`,
      last_update: new Date(last_update).toISOString(),
      is_trailing: $userVehicleTrailing,
      vehicle_marker,
      heading: heading !== null ? heading : null,
    }

    const { data, error } = await supabase
      .from("vehicle_state")
      .upsert(vehicleStateData)
      .single()

    if (error) {
      console.error("Error updating vehicle state in database:", error)
    } else {
      console.log("Database updated successfully")
      lastDatabaseUpdate = currentTime
    }

    // Update previous vehicle data after successful update
    previousVehicleData = { ...vehicleData }
  }

  onMount(async () => {
    console.log("Initializing VehicleStateSynchronizer")
    const userId = $profileStore.id
    const masterMapId = $profileStore.master_map_id

    // First fetch the user's own vehicle data
    const userVehicle = await fetchUserVehicleData(userId)
    if (userVehicle) {
      // Parse the coordinates string into latitude and longitude values
      const [longitude, latitude] = userVehicle.coordinates
        .slice(1, -1)
        .split(",")
        .map(parseFloat)

      // Update the userVehicleStore with the fetched data and parsed coordinates
      userVehicleStore.update((vehicle) => {
        return {
          ...vehicle,
          ...userVehicle,
          coordinates: { latitude, longitude },
        }
      })
    }

    // Then fetch initial vehicle data from the server
    const initialVehicles = await fetchInitialVehicleData(masterMapId, userId)
    console.log("Initial vehicle data:", initialVehicles)
    serverOtherVehiclesData.set(initialVehicles)

    // Compare the serverOtherVehiclesData with the otherVehiclesStore and store the changes
    const changes = compareData($serverOtherVehiclesData, $otherVehiclesStore)
    otherVehiclesDataChanges.set(changes)

    // Subscribe to realtime updates from other vehicles
    channel = supabase
      .channel(`vehicle_updates_${masterMapId}`)
      .on("broadcast", { event: "vehicle_update" }, (payload) => {
        if (payload.payload.vehicle_id !== userId) {
          // Update was made by another vehicle
          serverOtherVehiclesData.update((vehicles) => {
            const existingVehicleIndex = vehicles.findIndex(
              (vehicle) => vehicle.vehicle_id === payload.payload.vehicle_id,
            )
            if (existingVehicleIndex !== -1) {
              // Vehicle already exists, update its data while preserving the full_name
              vehicles[existingVehicleIndex] = {
                ...vehicles[existingVehicleIndex],
                ...payload.payload,
                full_name: vehicles[existingVehicleIndex].full_name,
              }
            } else {
              // Vehicle doesn't exist, add it to the store
              console.log("pushing new vehicle", payload.payload)
              vehicles.push(payload.payload)
            }
            return vehicles
          })

          // Compare the serverOtherVehiclesData with the otherVehiclesStore and store the changes
          const changes = compareData(
            $serverOtherVehiclesData,
            $otherVehiclesStore,
          )
          otherVehiclesDataChanges.set(changes)
        }
      })
      .subscribe()

    // Subscribe to changes in the userVehicleStore
    unsubscribe = userVehicleStore.subscribe(async (vehicleData) => {
      // Always broadcast the update
      console.log("Broadcasting vehicle state:", vehicleData)
      await broadcastVehicleState(vehicleData)

      // Update database with new logic
      await updateDatabaseVehicleState(vehicleData)
    })

    vehicleDataLoaded.set(true)
  })

  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel)
    }
    if (unsubscribe) {
      unsubscribe()
    }
  })
</script>
