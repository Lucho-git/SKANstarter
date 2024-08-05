<script lang="ts">
  import { onMount } from "svelte"
  import { supabase } from "$lib/supabaseClient"
  import { page } from "$app/stores"

  let mapMarkers = 0
  let vehicles = 0
  let trailCoordinates = 0

  onMount(async () => {
    const session = $page.data.session
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("master_map_id")
        .eq("id", session.user.id)
        .single()

      console.log("Profile:", profile)

      if (profile?.master_map_id) {
        console.log("Master Map ID:", profile.master_map_id)

        const [markersResult, vehiclesResult, trailResult] = await Promise.all([
          supabase
            .from("map_markers")
            .select("id", { count: "exact" })
            .eq("master_map_id", profile.master_map_id),
          supabase
            .from("vehicle_state")
            .select("vehicle_id", { count: "exact" })
            .eq("master_map_id", profile.master_map_id),
          supabase
            .from("trail_data")
            .select("coordinates")
            .eq("master_map_id", profile.master_map_id),
        ])

        console.log("Markers Result:", markersResult)
        console.log("Vehicles Result:", vehiclesResult)
        console.log("Trail Result:", trailResult)

        mapMarkers = markersResult.count || 0
        vehicles = vehiclesResult.count || 0
        trailCoordinates =
          trailResult.data?.reduce(
            (acc, trail) => acc + trail.coordinates.length,
            0,
          ) || 0

        console.log("Map Markers:", mapMarkers)
        console.log("Vehicles:", vehicles)
        console.log("Trail Coordinates:", trailCoordinates)
      }
    }
  })
</script>

<div class="stats shadow w-full">
  <div class="stat place-items-center">
    <div class="stat-title">Map Markers</div>
    <div class="stat-value">{mapMarkers}</div>
    <div class="stat-desc">Total markers on the map</div>
  </div>

  <div class="stat place-items-center">
    <div class="stat-title">Vehicles</div>
    <div class="stat-value text-secondary">{vehicles}</div>
    <div class="stat-desc">Active vehicles</div>
  </div>

  <div class="stat place-items-center">
    <div class="stat-title">Trail Coordinates</div>
    <div class="stat-value">{trailCoordinates}</div>
    <div class="stat-desc">Total recorded coordinates</div>
  </div>
</div>
