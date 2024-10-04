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
      (geojson.type === "Polygon" || geojson.type === "MultiPolygon") &&
      Array.isArray(geojson.coordinates) &&
      geojson.coordinates.length > 0
    )
  }

  function countRings(geojson: GeoJSON): number {
    if (geojson.type === "Polygon") {
      return geojson.coordinates.length
    } else if (geojson.type === "MultiPolygon") {
      return geojson.coordinates.reduce(
        (sum, polygon) => sum + polygon.length,
        0,
      )
    }
    return 0
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

  function createCustomProjection(
    coordinates: number[][],
  ): (coord: number[]) => [number, number] {
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

    return ([x, y]) => [
      (x - centerX) * scale + width / 2,
      (centerY - y) * scale + height / 2,
    ]
  }

  function createPathData(geojson: GeoJSON): string {
    if (geojson.type === "Polygon") {
      const projectPoint = createCustomProjection(geojson.coordinates[0])
      const outerRing = geojson.coordinates[0].map(projectPoint)
      const innerRings = geojson.coordinates
        .slice(1)
        .map((ring) => ring.map(projectPoint))

      return `M${outerRing.map((p) => p.join(",")).join("L")}Z ${innerRings
        .map((ring) => `M${ring.map((p) => p.join(",")).join("L")}Z`)
        .join(" ")}`
    } else if (geojson.type === "MultiPolygon") {
      return geojson.coordinates
        .map((polygon) => {
          const projectPoint = createCustomProjection(polygon[0])
          const outerRing = polygon[0].map(projectPoint)
          const innerRings = polygon
            .slice(1)
            .map((ring) => ring.map(projectPoint))

          return `M${outerRing.map((p) => p.join(",")).join("L")}Z ${innerRings
            .map((ring) => `M${ring.map((p) => p.join(",")).join("L")}Z`)
            .join(" ")}`
        })
        .join(" ")
    }

    return ""
  }

  onMount(() => {
    if (isValidGeoJSON(geojson)) {
      const ringCount = countRings(geojson)
      console.log(`Number of rings: ${ringCount}`)

      pathData = createPathData(geojson)

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
    fill-rule="evenodd"
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
