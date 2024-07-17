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
  import { vehicleDataLoaded } from "../stores/loadedStore"
  import { page } from "$app/stores"

  let channel = null
  let unsubscribe

  onMount(async () => {
    console.log("Initializing VehicleStateSynchronizer")
    const session = $page.data.session
    if (session) {
      const userId = session.user.id
      console.log("Session:", session)
      console.log("User ID:", userId)

      // Retrieve the user's profile to get the master_map_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("master_map_id")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error("Error retrieving user profile:", profileError)
        return
      }

      const masterMapId = profile.master_map_id
      //   console.log("User Profile:", profile)
      //   console.log("Master Map ID:", profile.master_map_id)

      // Fetch the user's vehicle data from the server
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

      // Fetch initial vehicle data from the server
      const initialVehicles = await fetchInitialVehicleData(masterMapId, userId)
      console.log("Initial vehicle data:", initialVehicles)
      serverOtherVehiclesData.set(initialVehicles)

      // Compare the serverOtherVehiclesData with the otherVehiclesStore and store the changes
      const changes = compareData($serverOtherVehiclesData, $otherVehiclesStore)
      otherVehiclesDataChanges.set(changes)

      //Subscribe to realtime updates from other vehicles
      channel = supabase
        .channel("vehicle_state_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "vehicle_state",
            filter: `master_map_id=eq.${masterMapId}`,
          },
          (payload) => {
            if (payload.new.vehicle_id !== userId) {
              // Update was made by another vehicle

              // Update the serverOtherVehiclesData store with the received vehicle state
              serverOtherVehiclesData.update((vehicles) => {
                const existingVehicleIndex = vehicles.findIndex(
                  (vehicle) => vehicle.vehicle_id === payload.new.vehicle_id,
                )
                if (existingVehicleIndex !== -1) {
                  // Vehicle already exists, update its data while preserving the full_name
                  vehicles[existingVehicleIndex] = {
                    ...vehicles[existingVehicleIndex],
                    ...payload.new,
                    full_name: vehicles[existingVehicleIndex].full_name,
                  }
                } else {
                  // Vehicle doesn't exist, add it to the store
                  console.log("pushing new vehicle", payload.new)
                  vehicles.push(payload.new)
                }
                return vehicles
              })

              // Compare the serverOtherVehiclesData with the otherVehiclesStore and store the changes
              const changes = compareData(
                $serverOtherVehiclesData,
                $otherVehiclesStore,
              )
              otherVehiclesDataChanges.set(changes)
            } else {
              //   console.log("Updated vehicle state from self:", payload.new)
            }
          },
        )
        .subscribe()

      // Subscribe to changes in the userVehicleStore which are sent to the database
      unsubscribe = userVehicleStore.subscribe(async (vehicleData) => {
        console.log("Updating vehicle state in the database:", vehicleData)
        await sendVehicleStateToDatabase(vehicleData)
      })
    }

    vehicleDataLoaded.set(true)
  })

  onDestroy(() => {
    // Unsubscribe from real-time updates when the component is destroyed
    if (channel) {
      supabase.removeChannel(channel)
    }

    // Unsubscribe from the userVehicleStore
    if (unsubscribe) {
      unsubscribe()
    }
  })

  async function fetchUserVehicleData(userId) {
    const { data: userVehicle, error: userVehicleError } = await supabase
      .from("vehicle_state")
      .select("*")
      .eq("vehicle_id", userId)
      .single()

    if (userVehicleError) {
      console.error("Error retrieving user vehicle data:", userVehicleError)

      return null
    }

    return userVehicle
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
    console.log("SERVERDATA", serverData)
    console.log("CLIENTDATA", clientData)

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
        full_name: serverItem.full_name || clientItem?.full_name, // Preserve full_name
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

        if (vehicleMarkerChanged) {
          change.update_types.push("vehicle_marker_changed")
        }
        if (coordinatesChanged) {
          change.update_types.push("position_changed")
        }
        if (headingChanged) {
          change.update_types.push("heading_changed")
        }
        if (isTrailingChanged) {
          change.update_types.push("trailing_status_changed")
        }
        if (lastUpdateChanged) {
          change.update_types.push("last_update_changed")
        }
      }

      return change
    })

    const filteredChanges = changes.filter(
      (change) => change.update_types.length > 0,
    )

    console.log("RETURNINGCHANGEDVALUES", filteredChanges)
    return filteredChanges
  }

  async function sendVehicleStateToDatabase(vehicleData) {
    const session = $page.data.session
    if (!session) {
      console.error("User not authenticated")
      return
    }

    const userId = session.user.id

    // Retrieve the user's profile to get the master_map_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("master_map_id")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error retrieving user profile:", profileError)
      return
    }

    const masterMapId = profile.master_map_id

    const { coordinates, last_update, heading, vehicle_marker } = vehicleData

    // Check if coordinates exist before proceeding
    if (!coordinates) {
      console.warn("Coordinates not available. Skipping vehicle state update.")
      return
    }
    // console.log("Sending heading to server:", heading)

    const vehicleStateData = {
      vehicle_id: userId,
      master_map_id: masterMapId,
      coordinates: `(${coordinates.longitude},${coordinates.latitude})`,
      last_update: new Date(last_update).toISOString(),
      is_trailing: $userVehicleTrailing,
      vehicle_marker,
    }

    if (heading !== null) {
      vehicleStateData.heading = heading
    } else {
      //   console.log("heading is null")
    }

    console.log("Sending vehicle state to server:", vehicleStateData)

    const { data, error } = await supabase
      .from("vehicle_state")
      .upsert(vehicleStateData)
      .single()

    if (error) {
      console.error("Error sending vehicle state to the database:", error)
    } else {
      //   console.log("Vehicle state sent to the database:", data)
    }
  }
</script>
