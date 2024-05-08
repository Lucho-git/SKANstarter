<script>
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import "mapbox-gl/dist/mapbox-gl.css"

  let mapContainer
  let map

  onMount(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoibHVjaG9kb3JlIiwiYSI6ImNsdndpd2NvNjA5OWUybG14anc1aWJpbXMifQ.7DSbOP9x-3sTZdJ5ee4UKw"

    map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 2,
    })

    // Add the GeolocateControl to the map
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
    map.addControl(geolocateControl, "bottom-right")

    // Trigger the geolocate action when the map loads
    map.on("load", () => {
      geolocateControl.trigger()
    })
  })
</script>

<div class="map-container" bind:this={mapContainer}></div>

<style>
  .map-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
