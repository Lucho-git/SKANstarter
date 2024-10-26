<script lang="ts">
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import type { Map } from "mapbox-gl"
  import type { Trail } from "$lib/types/trail"
  import { historicalTrailStore } from "$lib/stores/otherTrailStore"
  import { currentTrailStore } from "$lib/stores/currentTrailStore"
  import { toast } from "svelte-sonner"

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

  export let map: Map
  let currentTrailSource: string | null = null
  let currentTrailLayer: string | null = null
  let lastCoordinateCount = 0

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
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    }
  }

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

  export async function deleteTrail(trailId: string) {
    try {
      const response = await fetch("/api/map-trails/delete-trail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trail_id: trailId }),
      })

      if (!response.ok) {
        toast.error("Failed to delete trail")
        throw new Error("Failed to delete trail")
      }

      removeTrail(trailId)
      historicalTrailStore.update((trails) =>
        trails.filter((t) => t.id !== trailId),
      )

      toast.success("Trail deleted")
      return true
    } catch (error) {
      console.error("Error deleting trail:", error)
      toast.error("Error deleting trail")
      return false
    }
  }

  export function addTrail(trail: Trail, isCurrent: boolean = false) {
    const { sourceId, layerId } = generateTrailIds(trail.id)
    const zoomDependentWidth = calculateZoomDependentWidth(
      trail.trail_width || 3,
      isCurrent ? 1.2 : 1,
    )

    map.addSource(sourceId, {
      type: "geojson",
      data: createTrailGeoJSON(trail.path),
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

    if (isCurrent) {
      currentTrailSource = sourceId
      currentTrailLayer = layerId
      lastCoordinateCount = Array.isArray(trail.path)
        ? trail.path.length
        : trail.path.coordinates.length
    }
  }

  export function updateCurrentTrail(trail: Trail) {
    console.log("Updating current trail", trail)
    console.log("Current source:", currentTrailSource)
    console.log("Has source:", map.getSource(currentTrailSource))

    if (!currentTrailSource || !map.getSource(currentTrailSource)) {
      console.log(
        "When updating trail no current trail found so making new trail",
      )
      addTrail(trail, true)
      return
    }

    const coords = Array.isArray(trail.path)
      ? trail.path
      : trail.path.coordinates
    const newCoordinateCount = coords.length

    console.log("New coordinates:", coords)
    console.log("New coordinate count:", newCoordinateCount)
    console.log("Last coordinate count:", lastCoordinateCount)

    if (newCoordinateCount !== lastCoordinateCount) {
      console.log("Updating source with new data")
      const source = map.getSource(currentTrailSource) as mapboxgl.GeoJSONSource
      const newGeoJSON = createTrailGeoJSON(trail.path)
      console.log("New GeoJSON data:", newGeoJSON)
      source.setData(newGeoJSON)
      lastCoordinateCount = newCoordinateCount
    } else {
      console.log("No coordinate count change, skipping update")
    }

    console.log("Updated current trail", trail)
  }

  async function loadHistoricalTrails() {
    for (const trail of $historicalTrailStore) {
      addTrail(trail)
      await new Promise((resolve) =>
        setTimeout(resolve, TRAIL_CONFIG.LOAD_DELAY),
      )
    }
  }

  onMount(() => {
    loadHistoricalTrails()

    const unsubscribeCurrent = currentTrailStore.subscribe((currentTrail) => {
      if (currentTrail && currentTrail.path) {
        updateCurrentTrail(currentTrail)
      }
    })

    return unsubscribeCurrent
  })

  export const trailManagerAPI = {
    addTrail,
    removeTrail,
    deleteTrail,
    reloadAll: loadHistoricalTrails,
    updateCurrentTrail,
    generateTrailIds,
    calculateZoomDependentWidth,
    createTrailGeoJSON,
  }
</script>

<slot {calculateZoomDependentWidth} {generateTrailIds} {deleteTrail} />
