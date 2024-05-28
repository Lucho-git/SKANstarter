<!-- VehicleTracker.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import mapboxgl from "mapbox-gl"
  import { userVehicleStore } from "../stores/mapStore"

  export let map

  let geolocateControl
  let userMarker

  onMount(() => {
    // Create the geolocateControl and add it to the map
    geolocateControl = new mapboxgl.GeolocateControl({
      // ... (geolocateControl options)
    })
    map.addControl(geolocateControl, "bottom-right")

    // Create the userMarker
    userMarker = new mapboxgl.Marker({
      // ... (userMarker options)
    })

    // Update the user location marker on geolocate event
    geolocateControl.on("geolocate", (e) => {
      const { coords } = e
      updateMarkerPosition(coords)
    })
  })

  onDestroy(() => {
    // Clean up the geolocateControl and userMarker
    geolocateControl.remove()
    userMarker.remove()
  })

  function updateMarkerPosition(coords) {
    // ... (updateMarkerPosition logic)
  }
</script>
