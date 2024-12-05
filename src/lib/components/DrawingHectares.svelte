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
      squareMeters: Math.round(areaInSquareMeters),
      hectares: Math.round((areaInSquareMeters / 10000) * 100) / 100,
    }
  }

  const eventHandlers = {
    create: () => updateArea(),
    delete: () => updateArea(),
    update: () => updateArea(),
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
      styles: [
        {
          id: "gl-draw-polygon-fill-active",
          type: "fill",
          filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": "#0ea5e9",
            "fill-opacity": 0.25,
          },
        },
        {
          id: "gl-draw-polygon-fill-inactive",
          type: "fill",
          filter: [
            "all",
            ["==", "active", "false"],
            ["==", "$type", "Polygon"],
          ],
          paint: {
            "fill-color": "#0ea5e9",
            "fill-opacity": 0.4,
          },
        },
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#0ea5e9",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        },
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
            "line-color": "#0ea5e9",
            "line-width": 3,
          },
        },
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 6,
            "circle-color": "#fff",
            "circle-stroke-color": "#0ea5e9",
            "circle-stroke-width": 2,
          },
        },
        {
          id: "gl-draw-polygon-and-line-midpoint-active",
          type: "circle",
          filter: ["all", ["==", "meta", "midpoint"], ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 4,
            "circle-color": "#0ea5e9",
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 2,
          },
        },
      ],
    })

    map.addControl(draw)

    map.on("draw.create", eventHandlers.create)
    map.on("draw.delete", eventHandlers.delete)
    map.on("draw.update", eventHandlers.update)
  })

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
