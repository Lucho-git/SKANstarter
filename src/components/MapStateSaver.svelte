<!-- MapStateSaver.svelte -->
<script>
  import { confirmedMarkersStore } from "../stores/mapStore"
  import { supabase } from "../lib/supabaseClient"

  async function saveMapStateToDatabase() {
    const geoJSON = prepareMapStateForSaving()
    console.log("Geometry to save:", geoJSON)
    const { data, error } = await supabase
      .from("map_state")
      .insert({ geojson: geoJSON })

    if (error) {
      console.error("Error saving map state to database:", error)
    } else {
      console.log("Map state saved to database successfully:", data)
    }
  }

  function prepareMapStateForSaving() {
    console.log("Preparing map state for saving...")
    const geoJSON = {
      type: "FeatureCollection",
      features: [],
    }

    confirmedMarkersStore.subscribe((markers) => {
      markers.forEach((marker) => {
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
          },
        }
        geoJSON.features.push(feature)
      })
    })

    // Add vehicle locations to the geoJSON features array
    // Implement the logic to retrieve vehicle locations and add them as features

    return geoJSON
  }
</script>

<button
  class="btn btn-circle btn-md absolute top-40 right-20 z-10"
  on:click={saveMapStateToDatabase}>Save Map State</button
>
