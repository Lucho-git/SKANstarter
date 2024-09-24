<script lang="ts">
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import { mapFieldsStore } from "$lib/stores/mapFieldsStore"
  import mapboxgl from "mapbox-gl"

  export let map: mapboxgl.Map

  interface Field {
    area: number
    boundary: {
      coordinates: number[][][]
    }
    // Add other properties if needed
  }

  onMount(() => {
    if (!map) {
      console.error("Map is not available")
      return
    }

    console.log("MapFields component mounted")

    const fields: Field[] = get(mapFieldsStore)
    console.log(`Loaded ${fields.length} fields from store`)
    console.log("Fields:", fields)

    if (fields.length > 0) {
      console.log("Creating GeoJSON FeatureCollection")
      const geojson = {
        type: "FeatureCollection",
        features: fields.map((field, index) => ({
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: field.boundary.coordinates,
          },
          properties: { id: index, area: field.area },
        })),
      }

      console.log("Adding fields source to map")
      map.addSource("fields", {
        type: "geojson",
        data: geojson,
      })

      console.log("Adding fields-fill layer")
      map.addLayer({
        id: "fields-fill",
        type: "fill",
        source: "fields",
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.2,
        },
      })

      console.log("Adding fields-outline layer")
      map.addLayer({
        id: "fields-outline",
        type: "line",
        source: "fields",
        paint: {
          "line-color": "#bfffbf",
          "line-opacity": 0.5,
          "line-width": 2,
        },
      })

      console.log("Fitting map to field bounds")
      const bounds = new mapboxgl.LngLatBounds()
      geojson.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach((coord) => {
            bounds.extend(coord as [number, number])
          })
        }
      })

      console.log("Fields loaded and displayed on map")
    } else {
      console.log("No fields found in store")
    }
  })
</script>
