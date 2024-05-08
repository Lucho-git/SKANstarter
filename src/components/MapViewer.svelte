<script>
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import "mapbox-gl/dist/mapbox-gl.css"

  let mapContainer
  let map
  let isSatelliteStyle = true

  onMount(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoibHVjaG9kb3JlIiwiYSI6ImNsdndpd2NvNjA5OWUybG14anc1aWJpbXMifQ.7DSbOP9x-3sTZdJ5ee4UKw"

    map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
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

  function toggleMapStyle() {
    if (isSatelliteStyle) {
      map.setStyle("mapbox://styles/mapbox/outdoors-v12")
    } else {
      map.setStyle("mapbox://styles/mapbox/satellite-streets-v12")
    }
    isSatelliteStyle = !isSatelliteStyle
  }
</script>

<div class="map-container" bind:this={mapContainer}>
  <button
    class="btn btn-circle btn-sm absolute top-4 right-4 z-10"
    on:click={toggleMapStyle}
  >
    {#if isSatelliteStyle}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clip-rule="evenodd"
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </button>
</div>

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
