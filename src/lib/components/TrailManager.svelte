<script context="module" lang="ts">
  import type { Map } from "mapbox-gl"
  import type { Trail } from "$lib/types/trail"

  export const TRAIL_CONFIG = {
    MULTIPLIER: 2.5,
    MIN_ZOOM: 10,
    MAX_ZOOM: 24,
    MIN_POWER: -6,
    MAX_POWER: 8,
    DEFAULT_OPACITY: 0.5,
    CURRENT_OPACITY: 0.8,
    LOAD_DELAY: 10,
  }

  export interface TrailIdentifiers {
    sourceId: string
    layerId: string
    highlightLayerId: string
    highlightBackgroundLayerId: string
  }

  export function generateTrailIds(trailId: string): TrailIdentifiers {
    return {
      sourceId: `trail-source-${trailId}`,
      layerId: `trail-layer-${trailId}`,
      highlightLayerId: `trail-highlight-${trailId}`,
      highlightBackgroundLayerId: `trail-highlight-bg-${trailId}`,
    }
  }

  export function calculateZoomDependentWidth(
    baseWidth: number,
    multiplier: number = 1,
  ) {
    return [
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      TRAIL_CONFIG.MIN_ZOOM,
      [
        "*",
        baseWidth * TRAIL_CONFIG.MULTIPLIER * multiplier,
        ["^", 2, TRAIL_CONFIG.MIN_POWER],
      ],
      TRAIL_CONFIG.MAX_ZOOM,
      [
        "*",
        baseWidth * TRAIL_CONFIG.MULTIPLIER * multiplier,
        ["^", 2, TRAIL_CONFIG.MAX_POWER],
      ],
    ]
  }

  function createTrailGeoJSON(coordinates: any[]) {
    const coords = Array.isArray(coordinates)
      ? coordinates
      : coordinates.coordinates
    console.log(`Creating GeoJSON with ${coords.length} coordinates`)
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    }
  }
</script>

<script lang="ts">
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import { historicalTrailStore } from "$lib/stores/otherTrailStore"
  import { currentTrailStore } from "$lib/stores/currentTrailStore"

  export let map: Map
  let currentTrailSource: string | null = null
  let currentTrailLayer: string | null = null
  let lastCoordinateCount = 0

  export function removeTrail(trailId: string) {
    console.log(`Removing trail: ${trailId}`)
    const { sourceId, layerId, highlightLayerId, highlightBackgroundLayerId } =
      generateTrailIds(trailId)

    const layersToRemove = [
      highlightLayerId,
      highlightBackgroundLayerId,
      layerId,
    ]
    layersToRemove.forEach((layer) => {
      if (map.getLayer(layer)) {
        console.log(`Removing layer: ${layer}`)
        map.removeLayer(layer)
      }
    })

    if (map.getSource(sourceId)) {
      console.log(`Removing source: ${sourceId}`)
      map.removeSource(sourceId)
    }
  }

  export function addTrail(trail: Trail, isCurrent: boolean = false) {
    console.log(
      `Adding ${isCurrent ? "current" : "historical"} trail: ${trail.id}`,
    )
    const { sourceId, layerId } = generateTrailIds(trail.id)
    const zoomDependentWidth = calculateZoomDependentWidth(
      trail.trail_width || 3,
      isCurrent ? 1.2 : 1,
    )

    const geoJSON = createTrailGeoJSON(trail.path)
    console.log(
      `Initial trail coordinates count: ${geoJSON.geometry.coordinates.length}`,
    )

    map.addSource(sourceId, {
      type: "geojson",
      data: geoJSON,
    })

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": trail.trail_color || "#FF0000",
        "line-width": zoomDependentWidth,
        "line-opacity": isCurrent
          ? TRAIL_CONFIG.CURRENT_OPACITY
          : TRAIL_CONFIG.DEFAULT_OPACITY,
      },
    })

    console.log(`Trail layer added: ${layerId}`)

    if (isCurrent) {
      currentTrailSource = sourceId
      currentTrailLayer = layerId
      lastCoordinateCount = geoJSON.geometry.coordinates.length
    }
  }

  export function updateCurrentTrail(trail: Trail) {
    console.log(`Updating current trail: ${trail.id}`)

    if (!currentTrailSource || !map.getSource(currentTrailSource)) {
      console.log("No current trail source exists, creating new trail")
      addTrail(trail, true)
      return
    }

    const coords = Array.isArray(trail.path)
      ? trail.path
      : trail.path.coordinates
    const newCoordinateCount = coords.length

    if (newCoordinateCount !== lastCoordinateCount) {
      console.log(
        `Coordinates updated: ${lastCoordinateCount} -> ${newCoordinateCount}`,
      )
      console.log(
        `New coordinate: ${JSON.stringify(coords[coords.length - 1])}`,
      )

      const source = map.getSource(currentTrailSource) as mapboxgl.GeoJSONSource
      source.setData(createTrailGeoJSON(trail.path))

      lastCoordinateCount = newCoordinateCount
    }
  }

  async function loadHistoricalTrails() {
    console.log("Loading historical trails:", $historicalTrailStore)
    console.log(
      `Total historical trails to load: ${$historicalTrailStore.length}`,
    )

    $historicalTrailStore.forEach((trail) => removeTrail(trail.id))

    for (const trail of $historicalTrailStore) {
      console.log(`Processing historical trail: ${trail.id}`)
      addTrail(trail)
      await new Promise((resolve) =>
        setTimeout(resolve, TRAIL_CONFIG.LOAD_DELAY),
      )
    }

    console.log("Historical trails loading completeds")
  }

  function cleanupTrails() {
    console.log("Cleaning up all trails")
    $historicalTrailStore.forEach((trail) => removeTrail(trail.id))
    if (currentTrailLayer) {
      removeTrail(currentTrailLayer)
      currentTrailSource = null
      currentTrailLayer = null
    }
    console.log("Cleanup completed")
  }

  onMount(() => {
    console.log("Mounting TrailManager")
    loadHistoricalTrails()

    const unsubscribeCurrent = currentTrailStore.subscribe((currentTrail) => {
      console.log("Current trail store updated:", currentTrail?.id)
      if (currentTrail && currentTrail.path) {
        updateCurrentTrail(currentTrail)
      } else if (currentTrailLayer) {
        console.log("Removing current trail as it's no longer active")
        removeTrail(currentTrailLayer)
        currentTrailSource = null
        currentTrailLayer = null
      }
    })

    return () => {
      console.log("Unmounting TrailManager")
      cleanupTrails()
      unsubscribeCurrent()
    }
  })

  export const trailManagerAPI = {
    addTrail,
    removeTrail,
    reloadAll: loadHistoricalTrails,
    updateCurrentTrail,
  }
</script>

<slot />
