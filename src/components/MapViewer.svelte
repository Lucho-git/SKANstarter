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
  import TrailStateSynchronizer from "./TrailStateSynchronizer.svelte"
  import { db } from "./db.js"

  //Constants and variable initializations
  let dbInstance

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

  onMount(async () => {
    mapInitialized = false
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    mapOptions.container = mapContainer
    map = new mapboxgl.Map(mapOptions)

    mapStore.set(map)
    mapInitialized = true

    try {
      await db.open()
      console.log("IndexedDB database opened")
      dbInstance = db
    } catch (error) {
      console.error("Error opening IndexedDB database:", error)
    }
  })

  onDestroy(() => {
    console.log("DestroyingMap")
    if (map) {
      map.off()
      map.remove()
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
    <VehicleTracker {map} db={dbInstance} />
    <VehicleStateSynchronizer />
    <TrailStateSynchronizer db={dbInstance} />
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
