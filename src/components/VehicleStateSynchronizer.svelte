<!-- VehicleStateSynchronizer.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import { supabase } from "../lib/supabaseClient"
  import { userVehicleStore, otherVehiclesStore } from "../stores/vehicleStore"
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
      console.log("User Profile:", profile)
      console.log("Master Map ID:", profile.master_map_id)
      // Subscribe to changes in the 'vehicle_state' table

      // Fetch the user's vehicle data from the server
      const { data: userVehicle, error: userVehicleError } = await supabase
        .from("vehicle_state")
        .select("*")
        .eq("vehicle_id", userId)
        .single()

      if (userVehicleError) {
        console.error("Error retrieving user vehicle data:", userVehicleError)
      } else {
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

      // Fetch initial vehicle data
      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicle_state")
        .select("*")
        .eq("master_map_id", masterMapId)

      if (vehiclesError) {
        console.error("Error retrieving initial vehicle data:", vehiclesError)
      } else {
        // Update the otherVehiclesStore with the initial vehicle data
        otherVehiclesStore.set(
          vehicles.filter((vehicle) => vehicle.vehicle_id !== userId),
        )
      }

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
              console.log(
                "Updated vehicle state from another vehicle:",
                payload.new,
              )
              // Update the otherVehiclesStore with the received vehicle state
              otherVehiclesStore.update((vehicles) => {
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
            } else {
              console.log("Updated vehicle state from self:", payload.new)
            }
          },
        )
        .subscribe()

      // Subscribe to changes in the userVehicleStore
      unsubscribe = userVehicleStore.subscribe(async (vehicleData) => {
        await sendVehicleStateToDatabase(vehicleData)
      })
    }
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

    const { data, error } = await supabase
      .from("vehicle_state")
      .upsert({
        vehicle_id: userId,
        master_map_id: masterMapId,
        coordinates: `(${coordinates.longitude},${coordinates.latitude})`,
        last_update,
        heading,
        is_trailing,
        vehicle_marker,
      })
      .single()

    if (error) {
      console.error("Error sending vehicle state to the database:", error)
    } else {
      //   console.log("Vehicle state sent to the database:", data)
    }
  }
</script>
