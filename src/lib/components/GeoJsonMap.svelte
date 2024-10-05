<!-- src/lib/components/GeoJSONMap.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import type { GeoJSON } from "d3-geo"
  import area from "@turf/area"
  import { polygon, multiPolygon } from "@turf/helpers"

  export let geojson: GeoJSON
  export let width: number = 300
  export let height: number = 200
  export let areaHectares: number = 0

  let pathData = ""

  function isValidGeoJSON(geojson: any): boolean {
    return (
      geojson && (geojson.type === "Polygon" || geojson.type === "MultiPolygon")
    )
  }

  function calculateAreaInHectares(geojson: GeoJSON): number {
    if (geojson.type === "Polygon") {
      return calculatePolygonAreaInHectares(geojson.coordinates)
    } else if (geojson.type === "MultiPolygon") {
      return geojson.coordinates.reduce((total, polygonCoords) => {
        return total + calculatePolygonAreaInHectares(polygonCoords)
      }, 0)
    }
    return 0
  }

  function calculatePolygonAreaInHectares(coordinates: number[][][]): number {
    const outerRing = coordinates[0]
    const innerRings = coordinates.slice(1)

    const outerArea = area(polygon([outerRing])) / 10000 // Convert to hectares
    const innerArea = innerRings.reduce((total, ring) => {
      return total + area(polygon([ring])) / 10000
    }, 0)

    return outerArea - innerArea
  }

  function getBoundingBox(
    coordinates: number[][][],
  ): [number, number, number, number] {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    coordinates.forEach((ring) => {
      ring.forEach(([x, y]) => {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      })
    })
    return [minX, minY, maxX, maxY]
  }

  function createProjection(
    bbox: [number, number, number, number],
  ): (coord: number[]) => [number, number] {
    const [minX, minY, maxX, maxY] = bbox
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

  function createPolygonPathData(
    coordinates: number[][][],
    project: (coord: number[]) => [number, number],
  ): string {
    const outerRing = coordinates[0].map(project)
    const innerRings = coordinates.slice(1).map((ring) => ring.map(project))

    return `M${outerRing.map((p) => p.join(",")).join("L")}Z ${innerRings
      .map((ring) => `M${ring.map((p) => p.join(",")).join("L")}Z`)
      .join(" ")}`
  }

  function createPathData(geojson: GeoJSON): string {
    let allCoordinates: number[][][] = []
    if (geojson.type === "Polygon") {
      allCoordinates = geojson.coordinates
    } else if (geojson.type === "MultiPolygon") {
      allCoordinates = geojson.coordinates.flat()
    }

    const bbox = getBoundingBox(allCoordinates)
    const project = createProjection(bbox)

    if (geojson.type === "Polygon") {
      return createPolygonPathData(geojson.coordinates, project)
    } else if (geojson.type === "MultiPolygon") {
      return geojson.coordinates
        .map((polygonCoords) => createPolygonPathData(polygonCoords, project))
        .join(" ")
    }
    return ""
  }

  onMount(() => {
    if (isValidGeoJSON(geojson)) {
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
