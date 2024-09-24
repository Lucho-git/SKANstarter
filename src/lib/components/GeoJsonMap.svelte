<!-- src/lib/components/GeoJSONMap.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import type { GeoJSON } from "d3-geo"
  import area from "@turf/area"
  import { polygon } from "@turf/helpers"

  export let geojson: GeoJSON
  export let width: number = 300
  export let height: number = 200
  export let areaHectares: number = 0

  let pathData = ""

  function isValidGeoJSON(geojson: GeoJSON): boolean {
    return (
      geojson &&
      geojson.type === "Polygon" &&
      Array.isArray(geojson.coordinates) &&
      geojson.coordinates.length > 0 &&
      Array.isArray(geojson.coordinates[0]) &&
      geojson.coordinates[0].length >= 4 &&
      JSON.stringify(geojson.coordinates[0][0]) ===
        JSON.stringify(
          geojson.coordinates[0][geojson.coordinates[0].length - 1],
        )
    )
  }

  function calculateAreaInHectares(geojson: GeoJSON): number {
    console.log("Input to area calculation:", JSON.stringify(geojson))

    if (!isValidGeoJSON(geojson)) {
      console.error("Invalid GeoJSON structure")
      return 0
    }

    const poly = polygon(geojson.coordinates)
    const areaInSquareMeters = area(poly)
    const areaInHectares = areaInSquareMeters / 10000

    console.log("Calculated area in hectares:", areaInHectares)

    return areaInHectares
  }

  function createCustomProjection(coordinates: number[][]): [number, number][] {
    const [minX, minY, maxX, maxY] = coordinates.reduce(
      ([minX, minY, maxX, maxY], [x, y]) => [
        Math.min(minX, x),
        Math.min(minY, y),
        Math.max(maxX, x),
        Math.max(maxY, y),
      ],
      [Infinity, Infinity, -Infinity, -Infinity],
    )

    const scaleX = width / (maxX - minX)
    const scaleY = height / (maxY - minY)
    const scale = Math.min(scaleX, scaleY) * 0.9

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    return coordinates.map(([x, y]) => [
      (x - centerX) * scale + width / 2,
      (centerY - y) * scale + height / 2,
    ])
  }

  onMount(() => {
    if (isValidGeoJSON(geojson)) {
      const projectedCoordinates = createCustomProjection(
        geojson.coordinates[0],
      )
      pathData =
        "M" +
        projectedCoordinates.map((point) => point.join(",")).join("L") +
        "Z"

      areaHectares = calculateAreaInHectares(geojson)
    } else {
      console.error("Invalid GeoJSON structure")
    }
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
    stroke-width="1"
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
