<!-- src/lib/components/GeoJSONMap.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import { geoPath, geoMercator } from "d3-geo"
  import type { GeoJSON, GeoProjection } from "d3-geo"

  export let geojson: GeoJSON
  export let width: number = 300
  export let height: number = 200

  let pathData = ""

  onMount(() => {
    // Create a projection
    const projection: GeoProjection = geoMercator().fitSize(
      [width, height],
      geojson,
    )

    // Create a path generator
    const pathGenerator = geoPath().projection(projection)

    // Generate SVG path data
    pathData = pathGenerator(geojson) || ""
  })
</script>

<svg
  {width}
  {height}
  viewBox="0 0 {width} {height}"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d={pathData}
    fill="rgba(0, 128, 0, 0.5)"
    stroke="#006400"
    stroke-width="2"
  />
</svg>

<style>
  svg {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }
</style>
