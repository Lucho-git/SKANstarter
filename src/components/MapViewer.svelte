<script>
  import { onMount, onDestroy, setContext } from "svelte"
  import mapboxgl from "mapbox-gl"
  import "mapbox-gl/dist/mapbox-gl.css"
  import { mapStore } from "../stores/mapStore"
  import {
    fieldBoundaryStore,
    markerBoundaryStore,
  } from "$lib/stores/homeBoundaryStore"
  import { trailDataLoaded, vehicleDataLoaded } from "../stores/loadedStore"
  import { toast } from "svelte-sonner"

  import MarkerManager from "./MarkerManager.svelte"

  import ButtonSection from "./ButtonSection.svelte"
  import MapControls from "./MapControls.svelte"
  import MapStateSaver from "./MapStateSaver.svelte"
  import VehicleTracker from "./VehicleTracker.svelte" // Add this import
  import VehicleStateSynchronizer from "./VehicleStateSynchronizer.svelte"
  import TrailTracker from "./TrailTracker.svelte"
  import MapFields from "./MapFields.svelte"

  import TrailStateSynchronizer from "./TrailStateSynchronizer.svelte"

  import { db } from "./db.js"

  export let handleBackToDashboard

  //Constants and variable initializations
  let dbInstance

  const MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1IjoibHVjaG9kb3JlIiwiYSI6ImNsdndpd2NvNjA5OWUybG14anc1aWJpbXMifQ.7DSbOP9x-3sTZdJ5ee4UKw"
  const DEFAULT_SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12"
  const DEFAULT_OUTDOORS_STYLE = "mapbox://styles/mapbox/outdoors-v12"

  let isSatelliteStyle = true
  let currentMapStyle = DEFAULT_SATELLITE_STYLE
  let mapLoaded = false

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
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    mapOptions.container = mapContainer
    map = new mapboxgl.Map(mapOptions)

    mapStore.set(map)
    mapInitialized = true

    if (map.loaded()) {
      mapLoaded = true
    } else {
      map.on("load", () => {
        mapLoaded = true
      })
    }
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
    mapLoaded = false
    if (isSatelliteStyle) {
      currentMapStyle = DEFAULT_OUTDOORS_STYLE
    } else {
      currentMapStyle = DEFAULT_SATELLITE_STYLE
    }
    map.setStyle(currentMapStyle)
    map.once("load", () => {
      mapLoaded = true
    })
    isSatelliteStyle = !isSatelliteStyle
  }

  function handleLocateHome() {
    console.log("Locating home", $fieldBoundaryStore, $markerBoundaryStore)

    if ($fieldBoundaryStore) {
      // Use field boundary if available
      const [minLng, minLat, maxLng, maxLat] = $fieldBoundaryStore

      map.fitBounds($fieldBoundaryStore, {
        padding: 50,
        maxZoom: 15,
      })
    } else if ($markerBoundaryStore) {
      // Use marker boundary if field boundary is not available
      map.fitBounds($markerBoundaryStore, {
        padding: 50,
        maxZoom: 15,
      })
    } else {
      console.log("No bounding box available")
      toast.error(
        "Please place markers or upload field boundaries to set a home location",
        {
          duration: 4000,
        },
      )
    }
  }
</script>

<div class="map-container" bind:this={mapContainer}>
  {#if mapInitialized}
    <ButtonSection
      on:toggleMapStyleDispatcher={toggleMapStyle}
      on:backToDashboard={handleBackToDashboard}
      on:locateHome={handleLocateHome}
    />

    <MarkerManager {markerPlacementEvent} {markerClickEvent} />
    <MapStateSaver {map} />

    <MapControls
      bind:this={mapControls}
      {map}
      on:markerPlacement={handleMarkerPlacement}
      on:markerClick={handleMarkerClick}
    />
    <VehicleStateSynchronizer />
    <VehicleTracker {map} />
    <MapFields {map} />

    <!-- // Wait for veihicle data to be loaded before loading the trail data -->
    {#if $vehicleDataLoaded}
      <TrailStateSynchronizer db={dbInstance} />
    {/if}
    <!-- // Wait for the trail data to be loaded before loading the trail tracker -->
    {#if $trailDataLoaded && mapLoaded}
      <TrailTracker {map} />
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
