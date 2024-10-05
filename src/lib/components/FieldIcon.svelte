<!-- src/lib/components/FieldIcon.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import type { GeoJSON } from "d3-geo"

  export let geojson: GeoJSON
  export let size: number = 24

  let pathData = ""

  function isValidGeoJSON(geojson: any): boolean {
    return (
      geojson &&
      (geojson.type === "Polygon" ||
        geojson.type === "MultiPolygon" ||
        (geojson.type === "Feature" &&
          geojson.geometry &&
          (geojson.geometry.type === "Polygon" ||
            geojson.geometry.type === "MultiPolygon")))
    )
  }

  function extractGeometry(geojson: GeoJSON): GeoJSON {
    if (geojson.type === "Feature" && geojson.geometry) {
      return geojson.geometry as GeoJSON
    }
    return geojson
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
    const scaleX = size / (maxX - minX)
    const scaleY = size / (maxY - minY)
    const scale = Math.min(scaleX, scaleY) * 0.9

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    return ([x, y]) => [
      (x - centerX) * scale + size / 2,
      (centerY - y) * scale + size / 2,
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
    const geometry = extractGeometry(geojson)
    let allCoordinates: number[][][] = []

    if (geometry.type === "Polygon") {
      allCoordinates = geometry.coordinates
    } else if (geometry.type === "MultiPolygon") {
      allCoordinates = geometry.coordinates.flat()
    }

    const bbox = getBoundingBox(allCoordinates)
    const project = createProjection(bbox)

    if (geometry.type === "Polygon") {
      return createPolygonPathData(geometry.coordinates, project)
    } else if (geometry.type === "MultiPolygon") {
      return geometry.coordinates
        .map((polygonCoords) => createPolygonPathData(polygonCoords, project))
        .join(" ")
    }
    return ""
  }

  onMount(() => {
    if (isValidGeoJSON(geojson)) {
      pathData = createPathData(geojson)
    } else {
      console.error("FieldIcon: Invalid GeoJSON structure")
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
    fill-rule="evenodd"
  />
</svg>

<style>
  svg {
    display: inline-block;
    vertical-align: middle;
  }
</style>
