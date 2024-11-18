<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import mapboxgl from "mapbox-gl"
  import type { Map } from "mapbox-gl"
  import type { Trail } from "$lib/types/trail"
  import {
    historicalTrailStore,
    otherActiveTrailStore,
  } from "$lib/stores/otherTrailStore"
  import { currentTrailStore } from "$lib/stores/currentTrailStore"
  import { toast } from "svelte-sonner"

  export const TRAIL_CONFIG = {
    MULTIPLIER: 1,
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

  interface TrailCoordinate {
    coordinates: {
      latitude: number
      longitude: number
    }
    timestamp: number
  }

  interface LineString {
    type: "LineString"
    coordinates: [number, number][]
  }

  export let map: Map

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

  function createTrailGeoJSON(coordinates: LineString | TrailCoordinate[]) {
    const lineString =
      "type" in coordinates
        ? coordinates
        : convertToLineString(coordinates as TrailCoordinate[])

    return {
      type: "Feature",
      properties: {},
      geometry: lineString,
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

      //   removeTrail(trailId)
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

  export function addTrail(trail: Trail) {
    const { sourceId, layerId } = generateTrailIds(trail.id)
    const zoomDependentWidth = calculateZoomDependentWidth(
      trail.trail_width || 3,
      1,
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
        "line-opacity": TRAIL_CONFIG.DEFAULT_OPACITY,
      },
    })
  }

  function convertToLineString(coordinates: TrailCoordinate[]): LineString {
    // Sort coordinates by timestamp
    const sortedCoords = [...coordinates].sort(
      (a, b) => a.timestamp - b.timestamp,
    )

    return {
      type: "LineString",
      coordinates: sortedCoords.map((coord) => [
        coord.coordinates.longitude,
        coord.coordinates.latitude,
      ]),
    }
  }

  export function updateCurrentTrail(trail: Trail) {
    // Add debugging logs
    // console.log("Updating current trail:", trail.id)
    // console.log("Current trail store:", $currentTrailStore)
    // console.log("Existing sources:", map.style.sourceCaches)

    const { sourceId, layerId } = generateTrailIds(trail.id)

    // If we have a different trail ID than before, clean up the old one
    if ($currentTrailStore && $currentTrailStore.id !== trail.id) {
      console.log("Cleaning up old trail:", $currentTrailStore.id)
      removeTrail($currentTrailStore.id)
    }

    // Check if this specific trail's source exists
    if (map.getSource(sourceId)) {
      //   console.log("Found existing source for trail:", sourceId)
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
      const lineString = convertToLineString(trail.path as TrailCoordinate[])
      const newCoordinateCount = lineString.coordinates.length

      if (newCoordinateCount !== lastCoordinateCount) {
        const newGeoJSON = {
          type: "Feature",
          properties: {},
          geometry: lineString,
        }
        source.setData(newGeoJSON)
        lastCoordinateCount = newCoordinateCount
      }
    } else {
      console.log("Creating new trail source:", sourceId)
      const trailWithLineString = {
        ...trail,
        path: convertToLineString(trail.path as TrailCoordinate[]),
      }
      addTrail(trailWithLineString)
    }
  }

  // Add new function similar to updateCurrentTrail
  export function updateOtherActiveTrail(trail: Trail) {
    // console.log("Updating other active trail:", trail.id)

    const { sourceId, layerId } = generateTrailIds(trail.id)

    // Check if this specific trail's source exists
    if (map.getSource(sourceId)) {
      //   console.log("Found existing source for trail:", sourceId)
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
      const lineString = convertToLineString(trail.path as TrailCoordinate[])

      const newGeoJSON = {
        type: "Feature",
        properties: {},
        geometry: lineString,
      }
      source.setData(newGeoJSON)
    } else {
      console.log("Creating new trail source:", sourceId)
      const trailWithLineString = {
        ...trail,
        path: convertToLineString(trail.path as TrailCoordinate[]),
      }
      addTrail(trailWithLineString)
    }
  }

  async function loadHistoricalTrails() {
    console.log("Starting to load historical trails", {
      totalTrails: $historicalTrailStore.length,
      trails: $historicalTrailStore,
    })

    for (let i = 0; i < $historicalTrailStore.length; i++) {
      const trail = $historicalTrailStore[i]
      try {
        console.log(
          `Attempting to load trail [${i + 1}/${$historicalTrailStore.length}]:`,
          {
            trailId: trail.id || "unknown",
            trailData: trail,
          },
        )

        await addTrail(trail)
        console.log(
          `Successfully loaded trail [${i + 1}/${$historicalTrailStore.length}]: ${trail.id || "unknown"}`,
        )

        await new Promise((resolve) =>
          setTimeout(resolve, TRAIL_CONFIG.LOAD_DELAY),
        )
      } catch (error) {
        console.error(
          `Failed to load trail [${i + 1}/${$historicalTrailStore.length}]:`,
          {
            trailId: trail.id || "unknown",
            error: error,
            trailData: trail,
          },
        )

        toast.error(
          `Failed to load corrupt trail data. Please try refreshing.`,
          {
            description: `Trail ${i + 1}/${$historicalTrailStore.length} (ID: ${trail.id || "unknown"})`,
          },
        )
      }
    }

    console.log("Finished loading historical trails")
  }
  let cleanup = {
    currentTrailUnsubscribe: null,
    otherActiveTrailsUnsubscribe: null,
    historicalTrailsUnsubscribe: null, // Add this
  }

  onMount(() => {
    loadHistoricalTrails()

    cleanup.currentTrailUnsubscribe = currentTrailStore.subscribe(
      (currentTrail) => {
        if (currentTrail && currentTrail.path) {
          updateCurrentTrail(currentTrail)
        }
      },
    )

    // Add subscription for other active trails
    cleanup.otherActiveTrailsUnsubscribe = otherActiveTrailStore.subscribe(
      (activeTrails) => {
        if (activeTrails) {
          activeTrails.forEach((trail) => {
            // console.log("Updating other active trail:", trail.id, activeTrails)
            if (trail && trail.path) {
              updateOtherActiveTrail(trail)
            }
          })
        }
      },
    )

    // Add subscription for historical trails to detect deletions
    let previousTrails = $historicalTrailStore
    cleanup.historicalTrailsUnsubscribe = historicalTrailStore.subscribe(
      (currentTrails) => {
        if (previousTrails && currentTrails) {
          // Find trails that were in previous but not in current (deleted trails)
          const deletedTrails = previousTrails.filter(
            (prevTrail) =>
              !currentTrails.some((currTrail) => currTrail.id === prevTrail.id),
          )

          // Remove each deleted trail from the map
          deletedTrails.forEach((trail) => {
            console.log("Deleting historical trail:", trail.id)
            removeTrail(trail.id)
          })
        }
        previousTrails = currentTrails
      },
    )
  })

  onDestroy(() => {
    console.log("Cleaning up trail subscriptions")
    if (cleanup.currentTrailUnsubscribe) {
      cleanup.currentTrailUnsubscribe()
    }
    if (cleanup.otherActiveTrailsUnsubscribe) {
      cleanup.otherActiveTrailsUnsubscribe()
    }
    if (cleanup.historicalTrailsUnsubscribe) {
      cleanup.historicalTrailsUnsubscribe()
    }
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
