<script lang="ts">
  import type { Map } from "mapbox-gl"
  import type { Trail } from "$lib/types/trail"
  import { historicalTrailStore } from "$lib/stores/otherTrailStore"
  import mapboxgl from "mapbox-gl"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"
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

        // If this was the last trail, close the navigation UI
        if ($historicalTrailStore.length === 0) {
          showNavigationUI = false
        } else {
          // Update currentTrailIndex only if there are remaining trails
          if (currentTrailIndex >= $historicalTrailStore.length) {
            currentTrailIndex = Math.max(0, $historicalTrailStore.length - 1)
          }
          navigateToTrail(currentTrailIndex)
        }
      }
    }
  }

  function toggleNavigationUI() {
    if (!$historicalTrailStore.length) {
      toast.error("No trails available. Create some trails first!")
      return
    }

    showNavigationUI = !showNavigationUI
    if (!showNavigationUI) {
      // Clean up highlights when hiding UI
      $historicalTrailStore.forEach((t) => removeHighlight(t.id))
    } else {
      // Start animation for current trail when showing UI
      if ($historicalTrailStore.length > 0) {
        const currentTrail = $historicalTrailStore[currentTrailIndex]
        flyToTrail(currentTrail)
        startOutlineAnimation(currentTrail)
      }
    }
  }

  function startOutlineAnimation(trail: Trail) {
    const { sourceId, highlightLayerId } = generateTrailIds(trail.id)
    const baseWidth =
      trail.trail_width * HIGHLIGHT_CONFIG.HIGHLIGHT_WIDTH_MULTIPLIER

    // Add white outline layer
    map.addLayer({
      type: "line",
      source: sourceId,
      id: highlightLayerId,
      paint: {
        "line-color": "white",
        "line-width": calculateZoomDependentWidth(baseWidth, 1.5),
        "line-opacity": 0.8,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    })

    // Add the original trail on top with slightly smaller width
    const innerLayerId = `${highlightLayerId}-inner`
    map.addLayer({
      type: "line",
      source: sourceId,
      id: innerLayerId,
      paint: {
        "line-color": trail.trail_color,
        "line-width": calculateZoomDependentWidth(baseWidth, 0.8),
        "line-opacity": 1,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    })

    // Return cleanup function
    return () => {
      if (map.getLayer(highlightLayerId)) {
        map.removeLayer(highlightLayerId)
      }
      if (map.getLayer(innerLayerId)) {
        map.removeLayer(innerLayerId)
      }
    }
  }

  function startGlowAnimation(trail: Trail) {
    const { sourceId, highlightBackgroundLayerId } = generateTrailIds(trail.id)
    let opacityStep = 0
    const baseWidth =
      trail.trail_width * HIGHLIGHT_CONFIG.HIGHLIGHT_WIDTH_MULTIPLIER
    const opacitySequence = [0.3, 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4]
    let animationFrameId: number | null = null // Add this line

    // Base electric glow
    if (!map.getSource(sourceId)) return // Add this check

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
      if (!isAnimating || !map) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        return
      }

      try {
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
          animationFrameId = requestAnimationFrame(animate)
        }
      } catch (error) {
        console.log("Animation stopped due to map cleanup")
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
      }
    }

    animate(0)

    // Return cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
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

    try {
      if (map && map.getLayer(highlightLayerId)) {
        map.removeLayer(highlightLayerId)
      }
      if (map && map.getLayer(highlightBackgroundLayerId)) {
        map.removeLayer(highlightBackgroundLayerId)
      }
    } catch (error) {
      console.log("Error removing highlight layers:", error)
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
    startOutlineAnimation(trail)

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
    outlineTrail: startOutlineAnimation,
    removeHighlight,
    flyToTrail,
    nextTrail: handleNext,
    previousTrail: handlePrevious,
    navigateToTrail,
  }

  onMount(() => {
    const cleanup = () => {
      isAnimating = false
    }

    return cleanup
  })
</script>

<button
  class="btn btn-circle fixed bottom-8 left-6 z-50 h-10 w-10 border-none bg-black/70 text-white backdrop-blur transition-transform hover:scale-110 hover:bg-black/80"
  style="background: {showNavigationUI ? 'rgba(255, 255, 255, 0.9)' : ''}"
  class:text-black={showNavigationUI}
  on:click={toggleNavigationUI}
>
  {showNavigationUI ? "✕" : "▶"}
</button>

{#if showNavigationUI}
  <div
    class="fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-black/70 backdrop-blur"
    style="max-width: calc(70vw - 2rem); min-width: min-content;"
  >
    <div
      class="flex items-center justify-between gap-x-[max(0.25rem,min(1rem,1.5vw))] p-[max(0.25rem,min(1rem,1.5vw))]"
    >
      <button
        class="btn btn-circle h-10 w-10 shrink-0 border-none bg-white text-lg hover:bg-gray-100"
        on:click={handlePrevious}
        disabled={false}
      >
        ←
      </button>

      <div class="mx-1 truncate text-center text-sm text-white">
        {#if $historicalTrailStore.length > 0}
          Trail {currentTrailIndex + 1} of {$historicalTrailStore.length}
        {/if}
      </div>

      <button
        class="btn btn-circle h-10 w-10 shrink-0 border-none bg-white text-lg hover:bg-gray-100"
        on:click={handleNext}
        disabled={false}
      >
        →
      </button>

      <button
        class="btn btn-circle btn-error h-10 w-10 shrink-0 border-none hover:bg-error/90"
        on:click={() => {
          trailToDelete = $historicalTrailStore[currentTrailIndex]
          showDeleteModal = true
        }}
      >
        🗑️
      </button>
    </div>
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
        <button class="btn btn-ghost" on:click={() => (showDeleteModal = false)}
          >Cancel</button
        >
        <button class="btn btn-error" on:click={handleDeleteConfirm}
          >Delete</button
        >
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button on:click={() => (showDeleteModal = false)}>close</button>
    </form>
  </dialog>
{/if}
