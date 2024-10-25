<script lang="ts">
  import type { Map } from "mapbox-gl"
  import type { Trail } from "$lib/types/trail"
  import { historicalTrailStore } from "$lib/stores/otherTrailStore"
  import mapboxgl from "mapbox-gl"
  import { onMount } from "svelte"
  interface TrailIdentifiers {
    sourceId: string
    layerId: string
    highlightLayerId: string
    highlightBackgroundLayerId: string
  }
  export let calculateZoomDependentWidth: (
    width: number,
    multiplier: number,
  ) => number
  export let generateTrailIds: (trailId: string) => TrailIdentifiers
  export let deleteTrail: (trailId: string) => Promise<boolean>

  export let map: Map
  let currentTrailIndex = 0
  let isAnimating = true
  let showNavigationUI = false
  let showDeleteModal = false
  let trailToDelete: Trail | null = null

  const HIGHLIGHT_CONFIG = {
    TRAIL_HIGHLIGHT_DELAY: 3000,
    FLIGHT_DURATION: 2000,
    HIGHLIGHT_WIDTH_MULTIPLIER: 1.2,
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

  async function handleDeleteConfirm() {
    if (trailToDelete) {
      const success = await deleteTrail(trailToDelete.id)
      if (success) {
        showDeleteModal = false
        trailToDelete = null
        if (currentTrailIndex >= $historicalTrailStore.length) {
          currentTrailIndex = Math.max(0, $historicalTrailStore.length - 1)
        }
        if ($historicalTrailStore.length > 0) {
          navigateToTrail(currentTrailIndex)
        }
      }
    }
  }

  function toggleNavigationUI() {
    showNavigationUI = !showNavigationUI
    if (!showNavigationUI) {
      // Clean up highlights when hiding UI
      $historicalTrailStore.forEach((t) => removeHighlight(t.id))
    } else {
      // Start animation for current trail when showing UI
      if ($historicalTrailStore.length > 0) {
        const currentTrail = $historicalTrailStore[currentTrailIndex]
        flyToTrail(currentTrail)
        startGlowAnimation(currentTrail)
      }
    }
  }

  function startGlowAnimation(trail: Trail) {
    const { sourceId, highlightBackgroundLayerId } = generateTrailIds(trail.id)
    let opacityStep = 0
    const baseWidth =
      trail.trail_width * HIGHLIGHT_CONFIG.HIGHLIGHT_WIDTH_MULTIPLIER

    const opacitySequence = [0.3, 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4]

    // Base electric glow
    map.addLayer({
      type: "line",
      source: sourceId,
      id: highlightBackgroundLayerId,
      paint: {
        "line-color": trail.trail_color,
        "line-width": calculateZoomDependentWidth(baseWidth, 2.2),
        "line-opacity": 0.3,
        "line-blur": calculateZoomDependentWidth(baseWidth, 0.8),
      },
      layout: {
        "line-cap": "round",
        "line-join": "bevel",
      },
    })

    function animate(timestamp: number) {
      const newOpacityStep = parseInt(
        (timestamp / 100) % opacitySequence.length,
      )

      if (
        newOpacityStep !== opacityStep &&
        map.getLayer(highlightBackgroundLayerId)
      ) {
        map.setPaintProperty(
          highlightBackgroundLayerId,
          "line-opacity",
          opacitySequence[opacityStep],
        )
        opacityStep = newOpacityStep
      }

      if (map.getLayer(highlightBackgroundLayerId)) {
        requestAnimationFrame(animate)
      }
    }
    animate(0)
  }

  function startAntAnimation(trail: Trail) {
    const { sourceId, highlightLayerId, highlightBackgroundLayerId } =
      generateTrailIds(trail.id)
    let step = 0
    let opacityStep = 0
    const baseWidth =
      trail.trail_width * HIGHLIGHT_CONFIG.HIGHLIGHT_WIDTH_MULTIPLIER

    // Convert trail color to HSL and calculate complementary
    const hslMatch = trail.trail_color.match(
      /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i,
    )
    let complementColor = "#4fc3f7"
    let brightTrailColor = trail.trail_color
    if (hslMatch) {
      const r = parseInt(hslMatch[1], 16)
      const g = parseInt(hslMatch[2], 16)
      const b = parseInt(hslMatch[3], 16)
      complementColor = `rgb(${255 - r}, ${255 - g}, ${255 - b})`
      brightTrailColor = `rgb(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)})`
    }

    const opacitySequence = [0.3, 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4]

    // Base electric glow
    map.addLayer({
      type: "line",
      source: sourceId,
      id: highlightBackgroundLayerId,
      paint: {
        "line-color": trail.trail_color,
        "line-width": calculateZoomDependentWidth(baseWidth, 2.2),
        "line-opacity": 0.3,
        "line-blur": calculateZoomDependentWidth(baseWidth, 0.8),
      },
      layout: {
        "line-cap": "round",
        "line-join": "bevel",
      },
    })

    // Animated bright trail-colored core
    map.addLayer({
      type: "line",
      source: sourceId,
      id: highlightLayerId,
      paint: {
        "line-color": brightTrailColor,
        "line-width": calculateZoomDependentWidth(baseWidth, 0.8),
        "line-dasharray": dashArraySequence[0],
        "line-opacity": 1,
      },
      layout: {
        "line-cap": "butt",
        "line-join": "bevel",
      },
    })

    function animate(timestamp: number) {
      if (!isAnimating) return // Stop animation if flag is false

      const newOpacityStep = parseInt(
        (timestamp / 100) % opacitySequence.length,
      )

      try {
        if (
          newOpacityStep !== opacityStep &&
          map?.getLayer(highlightBackgroundLayerId)
        ) {
          map.setPaintProperty(
            highlightBackgroundLayerId,
            "line-opacity",
            opacitySequence[opacityStep],
          )
          opacityStep = newOpacityStep
        }

        if (map?.getLayer(highlightBackgroundLayerId)) {
          requestAnimationFrame(animate)
        }
      } catch (error) {
        console.log("Animation stopped due to map cleanup")
        isAnimating = false
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
      duration: HIGHLIGHT_CONFIG.FLIGHT_DURATION,
      maxZoom: HIGHLIGHT_CONFIG.MAX_FLIGHT_ZOOM,
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
    if (false || $historicalTrailStore.length === 0) return

    $historicalTrailStore.forEach((t) => removeHighlight(t.id))

    currentTrailIndex = index
    if (currentTrailIndex >= $historicalTrailStore.length) {
      currentTrailIndex = 0
    } else if (currentTrailIndex < 0) {
      currentTrailIndex = $historicalTrailStore.length - 1
    }

    const trail = $historicalTrailStore[currentTrailIndex]

    flyToTrail(trail)
    startGlowAnimation(trail)

    await new Promise((resolve) =>
      setTimeout(resolve, HIGHLIGHT_CONFIG.FLIGHT_DURATION),
    )
  }

  function handlePrevious() {
    navigateToTrail(currentTrailIndex - 1)
  }

  function handleNext() {
    navigateToTrail(currentTrailIndex + 1)
  }

  export const highlighterAPI = {
    highlightTrail: startAntAnimation,
    glowTrail: startGlowAnimation,
    removeHighlight,
    flyToTrail,
    nextTrail: handleNext,
    previousTrail: handlePrevious,
    navigateToTrail,
  }

  onMount(() => {
    return () => {
      isAnimating = false // Stop animation on component cleanup
    }
  })
</script>

<button
  class="toggle-button"
  on:click={toggleNavigationUI}
  class:active={showNavigationUI}
>
  {showNavigationUI ? "✕" : "▶"}
</button>

{#if showNavigationUI}
  <div class="navigation-container">
    <button class="nav-button" on:click={handlePrevious} disabled={false}>
      ←
    </button>

    <div class="trail-counter">
      {#if $historicalTrailStore.length > 0}
        Trail {currentTrailIndex + 1} of {$historicalTrailStore.length}
      {/if}
    </div>

    <button class="nav-button" on:click={handleNext} disabled={false}>
      →
    </button>

    <button
      class="delete-button"
      on:click={() => {
        trailToDelete = $historicalTrailStore[currentTrailIndex]
        showDeleteModal = true
      }}
    >
      🗑️
    </button>
  </div>
{/if}

{#if showDeleteModal && trailToDelete}
  <dialog class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Delete Trail?</h3>
      <p class="py-4">
        Are you sure you want to delete this trail? This action cannot be
        undone.
      </p>
      <div class="modal-action">
        <button
          class="btn btn-ghost"
          on:click={() => (showDeleteModal = false)}
        >
          Cancel
        </button>
        <button class="btn btn-error" on:click={handleDeleteConfirm}>
          Delete
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button on:click={() => (showDeleteModal = false)}>close</button>
    </form>
  </dialog>
{/if}

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

  .toggle-button {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    transition: all 0.2s ease;
  }

  .toggle-button:hover {
    transform: scale(1.1);
  }

  .toggle-button.active {
    background: rgba(255, 255, 255, 0.9);
    color: black;
  }

  .delete-button {
    background: #ff4444;
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
    color: white;
  }

  .delete-button:hover {
    background: #ff6666;
    transform: scale(1.1);
  }
</style>
