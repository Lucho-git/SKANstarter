<script>
  import { onMount } from "svelte"
  import mapboxgl from "mapbox-gl"
  import { drawingModeEnabled } from "../../stores/controlStore"

  export let map
  let draw
  let calculatedAreaDiv

  // Function to format area in both units
  function formatArea(areaInSquareMeters) {
    const roundedSquareMeters = Math.round(areaInSquareMeters * 100) / 100
    const hectares = Math.round((areaInSquareMeters / 10000) * 100) / 100
    return {
      squareMeters: roundedSquareMeters,
      hectares: hectares,
    }
  }

  onMount(() => {
    const script = document.createElement("script")
    script.src =
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.js"
    document.head.appendChild(script)

    const turfScript = document.createElement("script")
    turfScript.src = "https://unpkg.com/@turf/turf@6/turf.min.js"
    document.head.appendChild(turfScript)

    const linkEl = document.createElement("link")
    linkEl.rel = "stylesheet"
    linkEl.href =
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css"
    document.head.appendChild(linkEl)

    script.onload = () => {
      draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: "draw_polygon",
      })

      map.addControl(draw)

      map.on("draw.create", (e) => {
        console.log("Draw create:", e)
        updateArea()
      })

      map.on("draw.delete", (e) => {
        console.log("Draw delete:", e)
        updateArea()
      })

      map.on("draw.update", (e) => {
        console.log("Draw update:", e)
        updateArea()
      })

      map.on("draw.action", (e) => {
        console.log("Draw action:", e.action)
        if (e.action === "addition") {
          console.log("Point added!")
          const data = draw.getAll()
          console.log("Current features:", data.features)
          calculatePartialArea()
        }
      })

      map.on("draw.modechange", (e) => {
        console.log("Mode changed:", e)
      })
    }

    return () => {
      if (map && draw) {
        map.removeControl(draw)
      }
    }
  })

  function calculatePartialArea() {
    if (!calculatedAreaDiv) return

    const data = draw.getAll()
    console.log("Calculating partial area, features:", data.features)

    if (data.features.length > 0) {
      const feature = data.features[data.features.length - 1]
      console.log("Current feature:", feature)

      if (
        feature.geometry &&
        feature.geometry.coordinates &&
        feature.geometry.coordinates[0] &&
        feature.geometry.coordinates[0].length >= 3
      ) {
        const coordinates = feature.geometry.coordinates[0]
        const polygon = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[...coordinates, coordinates[0]]],
          },
        }

        console.log("Created polygon for calculation:", polygon)
        const area = turf.area(polygon)
        const formattedArea = formatArea(area)
        console.log("Calculated area:", formattedArea)
        calculatedAreaDiv.innerHTML = `
            <div class="divider my-1"></div>
            <div class="text-lg font-bold">${formattedArea.hectares}</div>
            <div class="text-sm">hectares</div>
            <div class="text-sm text-gray-500">(${formattedArea.squareMeters} m²)</div>
          `
      } else {
        console.log("Not enough points for area calculation")
        calculatedAreaDiv.innerHTML = `
            <div class="text-sm">Add more points to calculate area</div>
          `
      }
    }
  }

  function updateArea() {
    if (!calculatedAreaDiv) return

    const data = draw.getAll()
    console.log("Update area called, features:", data.features)

    if (data.features.length > 0) {
      const area = turf.area(data)
      const formattedArea = formatArea(area)
      console.log("Final area calculated:", formattedArea)
      calculatedAreaDiv.innerHTML = `
          <div class="divider my-1"></div>
          <div class="text-lg font-bold">${formattedArea.hectares}</div>
          <div class="text-sm">hectares</div>
          <div class="text-sm text-gray-500">(${formattedArea.squareMeters} m²)</div>
        `
    } else {
      calculatedAreaDiv.innerHTML = ""
    }
  }

  $: if (draw && $drawingModeEnabled !== undefined) {
    if ($drawingModeEnabled) {
      draw.changeMode("draw_polygon")
    } else {
      draw.deleteAll()
      draw.changeMode("simple_select")
      if (calculatedAreaDiv) calculatedAreaDiv.innerHTML = ""
    }
  }
</script>

{#if $drawingModeEnabled}
  <div class="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body p-4 text-center">
        <h2 class="card-title justify-center text-sm">Area Calculation</h2>
        <div bind:this={calculatedAreaDiv}>
          <div class="text-sm">Click the map to draw a polygon</div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Add any additional custom styles here if needed */
</style>
