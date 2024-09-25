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

  function loadFields() {
    console.log("MapFields component: Loading fields")

    const fields: Field[] = get(mapFieldsStore)
    console.log(`Loaded ${fields.length} fields from store`)

    if (fields.length > 0) {
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

      map.addSource("fields", {
        type: "geojson",
        data: geojson,
      })

      map.addLayer({
        id: "fields-fill",
        type: "fill",
        source: "fields",
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.2,
        },
      })

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
      map.fitBounds(bounds, { padding: 50 })
    } else {
      console.log("No fields found in store")
    }
  }

  onMount(() => {
    if (!map) {
      console.error("Map is not available")
      return
    }

    console.log("MapFields component mounted")

    if (map.loaded()) {
      loadFields()
    } else {
      map.on("load", loadFields)
    }

    return () => {
      // Cleanup function
      if (map.getSource("fields")) {
        map.removeLayer("fields-outline")
        map.removeLayer("fields-fill")
        map.removeSource("fields")
      }
      map.off("load", loadFields)
    }
  })
</script>
