<script>
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"

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
  })
</script>

<div class="map-container" bind:this={mapContainer}></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
  }
</style>
