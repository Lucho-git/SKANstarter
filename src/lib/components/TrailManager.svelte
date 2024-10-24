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
        baseWidth * TRAIL_CONFIG.MULTIPLIER * multiplier, // Apply multiplier here
        ["^", 2, TRAIL_CONFIG.MIN_POWER],
      ],
      TRAIL_CONFIG.MAX_ZOOM,
      [
        "*",
        baseWidth * TRAIL_CONFIG.MULTIPLIER * multiplier, // Apply multiplier here
        ["^", 2, TRAIL_CONFIG.MAX_POWER],
      ],
    ]
  }

  function createTrailGeoJSON(coordinates: number[][]) {
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates,
      },
    }
  }
</script>

<script lang="ts">
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import { historicalTrailStore } from "$lib/stores/otherTrailStore"

  export let map: Map

  export function removeTrail(trailId: string) {
    const { sourceId, layerId, highlightLayerId, highlightBackgroundLayerId } =
      generateTrailIds(trailId)

    const layersToRemove = [
      highlightLayerId,
      highlightBackgroundLayerId,
      layerId,
    ]
    layersToRemove.forEach((layer) => {
      if (map.getLayer(layer)) {
        map.removeLayer(layer)
      }
    })

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  }

  export function addTrail(trail: Trail) {
    const { sourceId, layerId } = generateTrailIds(trail.id)
    const zoomDependentWidth = calculateZoomDependentWidth(trail.trail_width)

    map.addSource(sourceId, {
      type: "geojson",
      data: createTrailGeoJSON(trail.path.coordinates),
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
        "line-color": trail.trail_color,
        "line-width": zoomDependentWidth,
        "line-opacity": TRAIL_CONFIG.DEFAULT_OPACITY,
      },
    })
  }

  async function loadHistoricalTrails() {
    console.log("Loading trails store:", $historicalTrailStore)

    $historicalTrailStore.forEach((trail) => removeTrail(trail.id))

    for (const trail of $historicalTrailStore) {
      //   console.log(`Adding trail: ${trail.id}`)
      addTrail(trail)
      await new Promise((resolve) =>
        setTimeout(resolve, TRAIL_CONFIG.LOAD_DELAY),
      )
    }
  }

  function cleanupTrails() {
    $historicalTrailStore.forEach((trail) => removeTrail(trail.id))
  }

  onMount(() => {
    console.log("Mounting TrailManager")
    loadHistoricalTrails()

    // return cleanupTrails
  })

  export const trailManagerAPI = {
    addTrail,
    removeTrail,
    reloadAll: loadHistoricalTrails,
  }
</script>

<slot />
