<script lang="ts">
  import { onMount } from "svelte"
  import type { Map } from "mapbox-gl"
  import { historicalTrailStore } from "$lib/stores/otherTrailStore"
  import type { Trail } from "$lib/types/trail"
  import mapboxgl from "mapbox-gl"

  export let map: Map
  let currentTrailIndex = 0
  let isAnimating = false

  const TRAIL_CONFIG = {
    MULTIPLIER: 2.5,
    MIN_ZOOM: 10,
    MAX_ZOOM: 24,
    MIN_POWER: -6,
    MAX_POWER: 8,
    DEFAULT_OPACITY: 0.5,
    LOAD_DELAY: 10,
    TRAIL_HIGHLIGHT_DELAY: 3000,
    FLIGHT_DURATION: 2000,
    HIGHLIGHT_WIDTH_MULTIPLIER: 1.5,
    MAX_FLIGHT_ZOOM: 16,
  }

  const dashArraySequence = [
    [0, 4, 3],
    [0.5, 4, 2.5],
    [1, 4, 2],
    [1.5, 4, 1.5],
    [2, 4, 1],
    [2.5, 4, 0.5],
    [3, 4, 0],
    [0, 0.5, 3, 3.5],
    [0, 1, 3, 3],
    [0, 1.5, 3, 2.5],
    [0, 2, 3, 2],
    [0, 2.5, 3, 1.5],
    [0, 3, 3, 1],
    [0, 3.5, 3, 0.5],
  ]

  interface TrailIdentifiers {
    sourceId: string
    layerId: string
    highlightLayerId: string
    highlightBackgroundLayerId: string
  }

  function generateTrailIds(trailId: string): TrailIdentifiers {
    return {
      sourceId: `trail-source-${trailId}`,
      layerId: `trail-layer-${trailId}`,
      highlightLayerId: `trail-highlight-${trailId}`,
      highlightBackgroundLayerId: `trail-highlight-bg-${trailId}`,
    }
  }

  function calculateZoomDependentWidth(baseWidth: number) {
    return [
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      TRAIL_CONFIG.MIN_ZOOM,
      [
        "*",
        baseWidth * TRAIL_CONFIG.MULTIPLIER,
        ["^", 2, TRAIL_CONFIG.MIN_POWER],
      ],
      TRAIL_CONFIG.MAX_ZOOM,
      [
        "*",
        baseWidth * TRAIL_CONFIG.MULTIPLIER,
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

  function removeTrail(trailId: string) {
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

  function addTrail(trail: Trail) {
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

  function startAntAnimation(trail: Trail) {
    const { sourceId, highlightLayerId, highlightBackgroundLayerId } =
      generateTrailIds(trail.id)
    let step = 0

    const highlightWidth = calculateZoomDependentWidth(
      trail.trail_width * TRAIL_CONFIG.HIGHLIGHT_WIDTH_MULTIPLIER,
    )

    map.addLayer({
      type: "line",
      source: sourceId,
      id: highlightBackgroundLayerId,
      paint: {
        "line-color": trail.trail_color,
        "line-width": highlightWidth,
        "line-opacity": 0.4,
      },
    })

    map.addLayer({
      type: "line",
      source: sourceId,
      id: highlightLayerId,
      paint: {
        "line-color": trail.trail_color,
        "line-width": highlightWidth,
        "line-dasharray": dashArraySequence[0],
      },
    })

    function animate(timestamp: number) {
      const newStep = parseInt((timestamp / 50) % dashArraySequence.length)

      if (newStep !== step) {
        if (map.getLayer(highlightLayerId)) {
          map.setPaintProperty(
            highlightLayerId,
            "line-dasharray",
            dashArraySequence[step],
          )
          step = newStep
        }
      }

      if (map.getLayer(highlightLayerId)) {
        requestAnimationFrame(animate)
      }
    }

    animate(0)
  }

  function flyToTrail(trail: Trail) {
    const coordinates = trail.path.coordinates
    const bounds = coordinates.reduce(
      (bounds, coord) => {
        return bounds.extend(coord)
      },
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
    )

    map.fitBounds(bounds, {
      padding: 50,
      duration: TRAIL_CONFIG.FLIGHT_DURATION,
      maxZoom: TRAIL_CONFIG.MAX_FLIGHT_ZOOM,
    })
  }

  function removeHighlight(trailId: string) {
    const { highlightLayerId, highlightBackgroundLayerId } =
      generateTrailIds(trailId)

    if (map.getLayer(highlightLayerId)) {
      map.removeLayer(highlightLayerId)
    }
    if (map.getLayer(highlightBackgroundLayerId)) {
      map.removeLayer(highlightBackgroundLayerId)
    }
  }

  async function navigateToTrail(index: number) {
    if (isAnimating || $historicalTrailStore.length === 0) return

    isAnimating = true

    $historicalTrailStore.forEach((t) => removeHighlight(t.id))

    currentTrailIndex = index
    if (currentTrailIndex >= $historicalTrailStore.length) {
      currentTrailIndex = 0
    } else if (currentTrailIndex < 0) {
      currentTrailIndex = $historicalTrailStore.length - 1
    }

    const trail = $historicalTrailStore[currentTrailIndex]

    flyToTrail(trail)
    startAntAnimation(trail)

    await new Promise((resolve) =>
      setTimeout(resolve, TRAIL_CONFIG.FLIGHT_DURATION),
    )
    isAnimating = false
  }

  function handlePrevious() {
    navigateToTrail(currentTrailIndex - 1)
  }

  function handleNext() {
    navigateToTrail(currentTrailIndex + 1)
  }

  async function loadHistoricalTrails() {
    console.log("Loading trails store:", $historicalTrailStore)

    $historicalTrailStore.forEach((trail) => removeTrail(trail.id))

    for (const trail of $historicalTrailStore) {
      console.log(`Adding trail: ${trail.id}`)
      addTrail(trail)
      await new Promise((resolve) =>
        setTimeout(resolve, TRAIL_CONFIG.LOAD_DELAY),
      )
    }

    if ($historicalTrailStore.length > 0) {
      navigateToTrail(0)
    }
  }

  function cleanupTrails() {
    $historicalTrailStore.forEach((trail) => removeTrail(trail.id))
  }

  onMount(() => {
    console.log("Mounting TrailView")
    loadHistoricalTrails()

    return cleanupTrails
  })

  export const trailAPI = {
    addTrail,
    removeTrail,
    highlightTrail: startAntAnimation,
    removeHighlight,
    flyToTrail,
    reloadAll: loadHistoricalTrails,
    nextTrail: handleNext,
    previousTrail: handlePrevious,
  }
</script>

<slot />

<div class="navigation-container">
  <button class="nav-button" on:click={handlePrevious} disabled={isAnimating}>
    ←
  </button>

  <div class="trail-counter">
    {#if $historicalTrailStore.length > 0}
      Trail {currentTrailIndex + 1} of {$historicalTrailStore.length}
    {/if}
  </div>

  <button class="nav-button" on:click={handleNext} disabled={isAnimating}>
    →
  </button>
</div>

<style>
  .navigation-container {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(0, 0, 0, 0.7);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    backdrop-filter: blur(4px);
  }

  .nav-button {
    background: white;
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .nav-button:hover:not(:disabled) {
    background: #f0f0f0;
    transform: scale(1.1);
  }

  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .trail-counter {
    color: white;
    font-size: 0.9rem;
    min-width: 8rem;
    text-align: center;
  }
</style>
