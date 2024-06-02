<script>
  import { onMount, onDestroy, setContext } from "svelte"
  import mapboxgl from "mapbox-gl"
  import "mapbox-gl/dist/mapbox-gl.css"
  import { mapStore } from "../stores/mapStore"
  import MarkerManager from "./MarkerManager.svelte"

  import ButtonSection from "./ButtonSection.svelte"
  import MapControls from "./MapControls.svelte"
  import MapStateSaver from "./MapStateSaver.svelte"
  import VehicleTracker from "./VehicleTracker.svelte" // Add this import
  import VehicleStateSynchronizer from "./VehicleStateSynchronizer.svelte"

  //Constants and variable initializations

  const MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1IjoibHVjaG9kb3JlIiwiYSI6ImNsdndpd2NvNjA5OWUybG14anc1aWJpbXMifQ.7DSbOP9x-3sTZdJ5ee4UKw"
  const DEFAULT_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"
  const DEFAULT_OUTDOORS_STYLE = "mapbox://styles/mapbox/outdoors-v12"

  let mapContainer
  let map
  let mapInitialized = false

  let isSatelliteStyle = true
  let mapControls

  setContext("map", {
    getMap: () => Promise.resolve(map),
  })

  // end map controls

  const mapOptions = {
    container: null,
    style: DEFAULT_SATELLITE_STYLE,
    center: [90, -40],
    zoom: 2,
  }

  onMount(() => {
    mapInitialized = false
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    mapOptions.container = mapContainer
    map = new mapboxgl.Map(mapOptions)

    mapStore.set(map)
    mapInitialized = true
  })

  onDestroy(() => {
    console.log("DestroyingMap")
    if (map) {
      // Remove all event listeners and controls from the map
      map.off()
      map.remove()
      // Set the map reference to null
      map = null
      mapStore.set(null)
    }
    if (mapControls) {
      mapControls.$destroy()
    }
  })

  //Finished Setup
  let markerPlacementEvent = null
  let markerClickEvent = null

  function handleMarkerPlacement(event) {
    markerPlacementEvent = event.detail
  }

  function handleMarkerClick(event) {
    markerClickEvent = event.detail
  }

  function toggleMapStyle() {
    if (isSatelliteStyle) {
      map.setStyle(DEFAULT_OUTDOORS_STYLE)
    } else {
      map.setStyle(DEFAULT_SATELLITE_STYLE)
    }
    isSatelliteStyle = !isSatelliteStyle
  }
</script>

<div class="map-container" bind:this={mapContainer}>
  <ButtonSection on:toggleMapStyleDispatcher={toggleMapStyle} />
  {#if mapInitialized}
    <MarkerManager {markerPlacementEvent} {markerClickEvent} />
    <MapStateSaver />
    <MapControls
      bind:this={mapControls}
      {map}
      on:markerPlacement={handleMarkerPlacement}
      on:markerClick={handleMarkerClick}
    />
    <VehicleTracker {map} />
    <VehicleStateSynchronizer />
  {/if}
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
