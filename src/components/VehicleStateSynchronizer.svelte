<!-- VehicleStateSynchronizer.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import { supabase } from "../lib/supabaseClient"
  import { userVehicleStore } from "../stores/mapStore"
  import { page } from "$app/stores"

  let channel = null

  onMount(async () => {
    const session = $page.data.session
    if (session) {
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

      // Subscribe to changes in the 'vehicle_state' table
      channel = supabase
        .channel("vehicle_state_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "vehicle_state",
            filter: `vehicle_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new.master_map_id === masterMapId) {
              console.log("Updated vehicle state:", payload.new)
              // Update the userVehicleStore with the latest vehicle state
              userVehicleStore.update((vehicle) => {
                return {
                  ...vehicle,
                  ...payload.new,
                }
              })
            }
          },
        )
        .subscribe()
    }
  })

  onDestroy(() => {
    // Unsubscribe from real-time updates when the component is destroyed
    if (channel) {
      supabase.removeChannel(channel)
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

    // Send the latest vehicle state to the database
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
      console.log("Vehicle state sent to the database:", data)
    }
  }
</script>
