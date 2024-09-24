<!-- src/lib/components/FieldIcon.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import type { GeoJSON } from "d3-geo"

  export let geojson: GeoJSON
  export let size: number = 24

  let pathData = ""

  function extractCoordinates(geojson: GeoJSON): number[][] {
    if (geojson.type === "Feature" && geojson.geometry) {
      return extractCoordinates(geojson.geometry as GeoJSON)
    }
    if (geojson.type === "Polygon") {
      return geojson.coordinates[0]
    }
    if (geojson.type === "MultiPolygon") {
      return geojson.coordinates[0][0]
    }
    console.error("FieldIcon: Unsupported GeoJSON type", geojson.type)
    return []
  }

  function createCustomProjection(coordinates: number[][]): [number, number][] {
    if (coordinates.length === 0) return []

    const [minX, minY, maxX, maxY] = coordinates.reduce(
      ([minX, minY, maxX, maxY], [x, y]) => [
        Math.min(minX, x),
        Math.min(minY, y),
        Math.max(maxX, x),
        Math.max(maxY, y),
      ],
      [Infinity, Infinity, -Infinity, -Infinity],
    )

    const scaleX = size / (maxX - minX)
    const scaleY = size / (maxY - minY)
    const scale = Math.min(scaleX, scaleY) * 0.9

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    return coordinates.map(([x, y]) => [
      (x - centerX) * scale + size / 2,
      (centerY - y) * scale + size / 2,
    ])
  }

  onMount(() => {
    try {
      const coordinates = extractCoordinates(geojson)
      if (coordinates.length > 0) {
        const projectedCoordinates = createCustomProjection(coordinates)
        pathData =
          "M" +
          projectedCoordinates.map((point) => point.join(",")).join("L") +
          "Z"
      } else {
        console.error("FieldIcon: No valid coordinates found in GeoJSON")
      }
    } catch (error) {
      console.error("FieldIcon: Error processing GeoJSON", error)
    }
  })
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  xmlns="http://www.w3.org/2000/svg"
  style="background-color: #f0f0f0; border: 1px solid #ccc;"
>
  <path
    d={pathData}
    fill="rgba(0, 128, 0, 0.5)"
    stroke="#006400"
    stroke-width="0.5"
  />
</svg>

<style>
  svg {
    display: inline-block;
    vertical-align: middle;
  }
</style>
