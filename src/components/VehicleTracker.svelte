<!-- VehicleTracker.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import mapboxgl from "mapbox-gl"
  import { userVehicleStore } from "../stores/mapStore"
  import UserMarker from "./UserMarker.svelte"

  export let map

  let geolocateControl
  let userMarker

  onMount(() => {
    // Create the geolocateControl and add it to the map
    geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
      showUserLocation: false,
    })
    map.addControl(geolocateControl, "bottom-right")

    // Create the userMarker
    userMarker = new mapboxgl.Marker({
      element: createUserMarkerElement(),
      pitchAlignment: "map",
      rotationAlignment: "map",
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

  function createUserMarkerElement() {
    const el = document.createElement("div")

    new UserMarker({
      target: el,
      props: {
        pulseColor: "rgba(172, 172, 230, 0.8)",
        pulseSize: "40px",
        vehicleSize: $userVehicleStore.size,
        userVehicle: $userVehicleStore.type,
        vehicleColor: $userVehicleStore.color,
      },
    })

    return el
  }

  function updateMarkerPosition(coords) {
    const { latitude, longitude } = coords
    userMarker.setLngLat([longitude, latitude]).addTo(map)
  }
</script>
