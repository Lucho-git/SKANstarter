<!-- src/lib/components/FieldIcon.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import { geoPath, geoMercator } from "d3-geo"
  import type { GeoJSON, GeoProjection } from "d3-geo"

  export let geojson: GeoJSON
  export let size: number = 24

  let pathData = ""

  console.log("FieldIcon: Received GeoJSON:", JSON.stringify(geojson, null, 2))

  onMount(() => {
    console.log("FieldIcon: onMount started")
    try {
      const projection: GeoProjection = geoMercator().fitSize(
        [size, size],
        geojson,
      )
      console.log("FieldIcon: Projection created")

      const pathGenerator = geoPath().projection(projection)
      console.log("FieldIcon: Path generator created")

      pathData = pathGenerator(geojson) || ""
      console.log("FieldIcon: Generated pathData:", pathData)
    } catch (error) {
      console.error("FieldIcon: Error in onMount:", error)
    }
  })
</script>

<svg
  width={size}
  height={size}
  viewBox="-1 -1 {size + 2} {size + 2}"
  xmlns="http://www.w3.org/2000/svg"
  style="background-color: #f0f0f0; border: 1px solid #ccc;"
>
  <path
    d={pathData}
    fill="rgba(0, 128, 0, 0.5)"
    stroke="#006400"
    stroke-width="1"
  />
</svg>

<style>
  svg {
    display: inline-block;
    vertical-align: middle;
  }
</style>
