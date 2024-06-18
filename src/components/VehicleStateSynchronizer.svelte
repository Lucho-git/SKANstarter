<!-- VehicleStateSynchronizer.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import { supabase } from "../lib/supabaseClient"
  import {
    userVehicleStore,
    otherVehiclesStore,
    serverOtherVehiclesData,
    otherVehiclesDataChanges,
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
      //   console.log("Initial vehicle data:", initialVehicles)
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
                  // Vehicle already exists, update its data
                  vehicles[existingVehicleIndex] = payload.new
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
      .select("*")
      .eq("master_map_id", masterMapId)

    if (vehiclesError) {
      console.error("Error retrieving initial vehicle data:", vehiclesError)
      return []
    }

    return vehicles.filter((vehicle) => vehicle.vehicle_id !== userId)
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
        update_types: [],
      }

      if (!clientItem) {
        // console.log(`New vehicle found on server: ${serverItem.vehicle_id}`)
        change.update_types.push("new_vehicle")
      } else {
        const vehicleMarkerChanged =
          JSON.stringify(serverItem.vehicle_marker) !==
          JSON.stringify(clientItem.vehicle_marker)
        const coordinatesChanged =
          serverItem.coordinates !== clientItem.coordinates
        const headingChanged = serverItem.heading !== clientItem.heading

        if (vehicleMarkerChanged) {
          console
            .log
            // `Vehicle marker changed for vehicle: ${serverItem.vehicle_id}`,
            ()
          change.update_types.push("vehicle_marker_changed")
        }
        if (coordinatesChanged) {
          //   console.log(`Position changed for vehicle: ${serverItem.vehicle_id}`)
          change.update_types.push("position_changed")
        }
        if (headingChanged) {
          //   console.log(`Heading changed for vehicle: ${serverItem.vehicle_id}`)
          change.update_types.push("heading_changed")
        }

        // Log specific differences
        // if (vehicleMarkerChanged) {
        //   console.log(
        //     `Difference in vehicle_marker for vehicle: ${serverItem.vehicle_id}`,
        //   )
        //   console.log(`Server value:`, serverItem.vehicle_marker)
        //   console.log(`Client value:`, clientItem.vehicle_marker)
        // }
        // if (coordinatesChanged) {
        //   console.log(
        //     `Difference in coordinates for vehicle: ${serverItem.vehicle_id}`,
        //   )
        //   console.log(`Server value:`, serverItem.coordinates)
        //   console.log(`Client value:`, clientItem.coordinates)
        // }
        // if (headingChanged) {
        //   console.log(
        //     `Difference in heading for vehicle: ${serverItem.vehicle_id}`,
        //   )
        //   console.log(`Server value:`, serverItem.heading)
        //   console.log(`Client value:`, clientItem.heading)
        // }
      }

      return change
    })

    const filteredChanges = changes.filter(
      (change) => change.update_types.length > 0,
    )

    // console.log("Filtered changes:", filteredChanges)

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

    const { coordinates, last_update, heading, is_trailing, vehicle_marker } =
      vehicleData

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
      is_trailing,
      vehicle_marker,
    }

    if (heading !== null) {
      vehicleStateData.heading = heading
    } else {
      //   console.log("heading is null")
    }

    // console.log("Sending vehicle state to server:", vehicleStateData)

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
