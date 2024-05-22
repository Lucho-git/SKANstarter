<!-- MapStateSaver.svelte -->
<script>
  import { confirmedMarkersStore } from "../stores/mapStore"
  import { supabase } from "../lib/supabaseClient"
  import { page } from "$app/stores"

  async function saveMapStateToDatabase() {
    const session = $page.data.session
    if (!session) {
      console.error("User not authenticated")
      return
    }

    const markerInserts = await prepareMapStateForSaving(session)
    console.log("Markers to save:", markerInserts)

    const { data, error } = await supabase
      .from("map_markers")
      .upsert(markerInserts, { onConflict: "id" })

    if (error) {
      console.error("Error saving map markers to database:", error)
    } else {
      console.log("Map markers saved to database successfully:", data)
    }
  }

  async function prepareMapStateForSaving(session) {
    console.log("Preparing map state for saving...")

    const userId = session.user.id

    // Retrieve the user's profile to get the master_map_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("master_map_id")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error retrieving user profile:", profileError)
      throw new Error("Failed to retrieve user profile")
    }

    const masterMapId = profile.master_map_id

    const markerInserts = []

    confirmedMarkersStore.subscribe((markers) => {
      markers.forEach(({ marker, id }) => {
        const feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: marker.getLngLat().toArray(),
          },
          properties: {
            icon:
              marker.getElement().querySelector("i")?.className || "default",
            // Add any additional metadata properties here
            id: id,
          },
        }

        const markerData = {
          master_map_id: masterMapId,
          id: id,
          marker_data: feature,
        }

        markerInserts.push(markerData)
      })
    })

    // Add vehicle locations to the markerInserts array
    // Implement the logic to retrieve vehicle locations and add them as separate markers

    return markerInserts
  }
</script>

<button
  class="btn btn-circle btn-md absolute top-40 right-20 z-10"
  on:click={saveMapStateToDatabase}>Save Map State</button
>
