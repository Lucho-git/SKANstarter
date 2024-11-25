<script>
  import { onMount } from "svelte"
  import MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js"
  import { drawingModeEnabled } from "../../stores/controlStore"
  import * as turf from "@turf/turf"
  import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
  import { Ruler } from "lucide-svelte"

  export let map
  let draw
  let area = { hectares: 0, squareMeters: 0 }
  let isDrawing = false
  let hasEnoughPoints = false

  function formatArea(areaInSquareMeters) {
    return {
      squareMeters: Math.round(areaInSquareMeters * 100) / 100,
      hectares: Math.round((areaInSquareMeters / 10000) * 100) / 100,
    }
  }

  const eventHandlers = {
    create: () => updateArea(),
    delete: () => updateArea(),
    update: () => updateArea(),
    action: (e) => {
      if (e.action === "addition") {
        calculatePartialArea()
      }
    },
  }

  onMount(() => {
    draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: "draw_polygon",
      clickBuffer: 6,
      touchBuffer: 6,
      snapToFinish: true,
      finishDrawingOnSnapToFinish: true,
      touchEnabled: true,
      boxSelect: false,
      translateEnabled: false,
      rotateEnabled: false,
      // Add custom styling
      styles: [
        // Styling for the polygon being drawn (active)
        {
          id: "gl-draw-polygon-fill-active",
          type: "fill",
          filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": "#0ea5e9", // sky-500
            "fill-opacity": 0.25,
          },
        },
        // Styling for completed polygon (inactive)
        {
          id: "gl-draw-polygon-fill-inactive",
          type: "fill",
          filter: [
            "all",
            ["==", "active", "false"],
            ["==", "$type", "Polygon"],
          ],
          paint: {
            "fill-color": "#0ea5e9", // sky-500
            "fill-opacity": 0.4,
          },
        },
        // Styling for the polygon stroke while drawing
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#0ea5e9", // sky-500
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        },
        // Styling for completed polygon stroke
        {
          id: "gl-draw-polygon-stroke-inactive",
          type: "line",
          filter: [
            "all",
            ["==", "active", "false"],
            ["==", "$type", "Polygon"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#0ea5e9", // sky-500
            "line-width": 3,
          },
        },
        // Styling for vertices
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 6,
            "circle-color": "#fff",
            "circle-stroke-color": "#0ea5e9", // sky-500
            "circle-stroke-width": 2,
          },
        },
        // Styling for the midpoints
        {
          id: "gl-draw-polygon-and-line-midpoint-active",
          type: "circle",
          filter: ["all", ["==", "meta", "midpoint"], ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 4,
            "circle-color": "#0ea5e9", // sky-500
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 2,
          },
        },
      ],
    })

    map.addControl(draw)

    // Listen for when user is close to the starting point
    map.on("draw.selectionchange", (e) => {
      if (draw.getMode() === "draw_polygon") {
        const features = draw.getAll().features
        if (features.length > 0) {
          const currentFeature = features[features.length - 1]
          if (currentFeature.geometry.coordinates[0].length >= 3) {
            const points = currentFeature.geometry.coordinates[0]
            const start = points[0]
            const current = points[points.length - 1]

            // Calculate distance between start and current point
            const distance = turf.distance(
              turf.point(start),
              turf.point(current),
              { units: "meters" },
            )

            // If within 10 meters of start point and we have at least 3 points
            if (distance < 10 && points.length >= 3) {
              draw.changeMode("simple_select")
            }
          }
        }
      }
    })

    map.on("draw.create", eventHandlers.create)
    map.on("draw.delete", eventHandlers.delete)
    map.on("draw.update", eventHandlers.update)
    map.on("draw.action", eventHandlers.action)
  })

  function calculatePartialArea() {
    if (!draw) return

    const data = draw.getAll()
    if (!data.features.length) return

    const feature = data.features[data.features.length - 1]

    if (feature.geometry?.coordinates?.[0]?.length >= 3) {
      const coordinates = feature.geometry.coordinates[0]
      const polygon = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [[...coordinates, coordinates[0]]],
        },
      }

      area = formatArea(turf.area(polygon))
      hasEnoughPoints = true
      isDrawing = true
    } else {
      hasEnoughPoints = false
      isDrawing = true
    }
  }

  function updateArea() {
    if (!draw) return

    const data = draw.getAll()
    if (data.features.length > 0) {
      area = formatArea(turf.area(data))
      isDrawing = true
      hasEnoughPoints = true
    } else {
      isDrawing = false
      hasEnoughPoints = false
      area = { hectares: 0, squareMeters: 0 }
    }
  }

  $: if (draw && $drawingModeEnabled !== undefined) {
    if ($drawingModeEnabled) {
      draw.changeMode("draw_polygon")
    } else {
      draw.deleteAll()
      draw.changeMode("simple_select")
      isDrawing = false
      hasEnoughPoints = false
    }
  }
</script>

{#if $drawingModeEnabled}
  <div class="absolute left-1/2 top-3 z-10 -translate-x-1/2 transform">
    <div
      class="relative min-w-[180px] rounded-lg border border-gray-200 bg-white/90 p-3 backdrop-blur-sm"
    >
      <!-- Add close button -->
      <button
        class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
        on:click={() => ($drawingModeEnabled = false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div class="flex flex-col items-center gap-2">
        <!-- Rest of the content remains the same -->
        <div
          class="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-600"
        >
          <Ruler class="h-3.5 w-3.5" />
          <span>Measured Area</span>
        </div>
        {#if !isDrawing}
          <div class="text-sm text-gray-600">Click to start measuring</div>
        {:else if !hasEnoughPoints}
          <div class="text-sm text-gray-600">Complete the shape</div>
        {:else}
          <div class="flex flex-col items-center">
            <div
              class="flex items-baseline gap-1 text-2xl font-bold text-gray-800"
            >
              {area.hectares}
              <span class="text-xs font-normal">ha</span>
            </div>
            <div class="text-xs text-gray-500">
              {area.squareMeters.toLocaleString()} m²
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
