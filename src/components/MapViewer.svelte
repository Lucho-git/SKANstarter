<script>
  import { onMount, onDestroy, setContext } from "svelte"
  import mapboxgl from "mapbox-gl"
  import "mapbox-gl/dist/mapbox-gl.css"
  import { mapStore } from "../stores/mapStore"
  import { trailDataLoaded, vehicleDataLoaded } from "../stores/loadedStore"

  import MarkerManager from "./MarkerManager.svelte"

  import ButtonSection from "./ButtonSection.svelte"
  import MapControls from "./MapControls.svelte"
  import MapStateSaver from "./MapStateSaver.svelte"
  import VehicleTracker from "./VehicleTracker.svelte" // Add this import
  import VehicleStateSynchronizer from "./VehicleStateSynchronizer.svelte"
  import TrailTracker from "./TrailTracker.svelte"

  import TrailStateSynchronizer from "./TrailStateSynchronizer.svelte"

  import { db } from "./db.js"

  //Constants and variable initializations
  let dbInstance

  const MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1IjoibHVjaG9kb3JlIiwiYSI6ImNsdndpd2NvNjA5OWUybG14anc1aWJpbXMifQ.7DSbOP9x-3sTZdJ5ee4UKw"
  const DEFAULT_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"
  const DEFAULT_OUTDOORS_STYLE = "mapbox://styles/mapbox/outdoors-v12"

  let isSatelliteStyle = true
  let currentMapStyle = DEFAULT_SATELLITE_STYLE

  let mapContainer
  let map

  let mapControls
  let mapInitialized = false

  setContext("map", {
    getMap: () => Promise.resolve(map),
  })

  // end map controls

  const mapOptions = {
    container: null,
    style: DEFAULT_SATELLITE_STYLE,
    center: [90, -40],
    zoom: 2,
    // failIfMajorPerformanceCaveat: true,
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
      currentMapStyle = DEFAULT_OUTDOORS_STYLE
    } else {
      currentMapStyle = DEFAULT_SATELLITE_STYLE
    }
    map.setStyle(currentMapStyle)
    isSatelliteStyle = !isSatelliteStyle
  }
</script>

<div class="map-container" bind:this={mapContainer}>
  {#if mapInitialized}
    <ButtonSection on:toggleMapStyleDispatcher={toggleMapStyle} />

    <MarkerManager {markerPlacementEvent} {markerClickEvent} />
    <MapStateSaver />
    <MapControls
      bind:this={mapControls}
      {map}
      on:markerPlacement={handleMarkerPlacement}
      on:markerClick={handleMarkerClick}
    />
    <VehicleStateSynchronizer />

    <VehicleTracker {map} />

    <!-- // Wait for veihicle data to be loaded before loading the trail data -->
    {#if $vehicleDataLoaded}
      <TrailStateSynchronizer db={dbInstance} />
    {/if}
    <!-- // Wait for the trail data to be loaded before loading the trail tracker -->
    {#if $trailDataLoaded}
      {#key currentMapStyle}
        <TrailTracker {map} />
      {/key}
    {/if}
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
