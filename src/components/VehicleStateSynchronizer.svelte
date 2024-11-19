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

  onMount(async () => {
    console.log("Initializing VehicleStateSynchronizer")
    const userId = $profileStore.id
    const masterMapId = $profileStore.master_map_id

    // Fetch initial vehicle data from the server
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

    // Subscribe to changes in the userVehicleStore which are broadcast to other clients
    unsubscribe = userVehicleStore.subscribe(async (vehicleData) => {
      console.log("Broadcasting vehicle state:", vehicleData)
      await broadcastVehicleState(vehicleData)
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

    console.log("Broadcasting vehicle state:", vehicleStateData)

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
</script>
