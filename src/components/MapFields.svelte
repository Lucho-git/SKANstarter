<script lang="ts">
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import { mapFieldsStore } from "$lib/stores/mapFieldsStore"
  import { fieldBoundaryStore } from "$lib/stores/homeBoundaryStore"
  import mapboxgl from "mapbox-gl"
  import * as turf from "@turf/turf"

  export let map: mapboxgl.Map

  interface Field {
    area: number
    boundary: {
      type: "Polygon" | "MultiPolygon"
      coordinates: number[][][] | number[][][][]
    }
    name: string
  }

  function calculateBoundingBox(fields: Field[]): mapboxgl.LngLatBounds | null {
    console.log("Calculating bounding box for", fields.length, "fields")

    if (fields.length === 0) {
      console.warn("No fields to calculate bounding box")
      return null
    }

    const bounds = new mapboxgl.LngLatBounds()

    fields.forEach((field, index) => {
      const coordinates =
        field.boundary.type === "Polygon"
          ? field.boundary.coordinates[0]
          : field.boundary.coordinates.flat(1)

      coordinates.forEach(([lng, lat], coordIndex) => {
        if (isNaN(lng) || isNaN(lat)) {
          console.warn(
            `Invalid coordinate at field ${index}, coordinate ${coordIndex}: [${lng}, ${lat}]`,
          )
          return
        }
        bounds.extend(new mapboxgl.LngLat(lng, lat))
      })
    })

    if (!bounds.isEmpty()) {
      console.log("Calculated bounding box:", bounds.toArray())
      return bounds
    } else {
      console.warn("Unable to calculate valid bounding box")
      return null
    }
  }

  function loadFields() {
    const fields: Field[] = get(mapFieldsStore)
    console.log("Loading fields from", $mapFieldsStore)
    if (fields.length > 0) {
      // Create polygons GeoJSON
      const fieldsGeojson = {
        type: "FeatureCollection",
        features: fields.map((field, index) => ({
          type: "Feature",
          geometry: field.boundary,
          properties: {
            id: index,
            area: field.area,
            name: field.name,
          },
        })),
      }

      // Create label points GeoJSON
      const labelPointsGeojson = {
        type: "FeatureCollection",
        features: fields
          .flatMap((field, index) => {
            try {
              if (field.boundary.type === "Polygon") {
                const feature = turf.polygon(field.boundary.coordinates)
                const labelPoint = turf.center(feature)
                return [
                  {
                    type: "Feature",
                    geometry: labelPoint.geometry,
                    properties: {
                      id: index,
                      name: field.name,
                    },
                  },
                ]
              } else if (field.boundary.type === "MultiPolygon") {
                // Create a center point for each polygon in the MultiPolygon
                return field.boundary.coordinates.map((polygonCoords) => {
                  const polygonFeature = turf.polygon(polygonCoords)
                  const labelPoint = turf.center(polygonFeature)
                  return {
                    type: "Feature",
                    geometry: labelPoint.geometry,
                    properties: {
                      id: index,
                      name: field.name,
                    },
                  }
                })
              } else {
                console.warn(
                  `Invalid geometry type for field ${index}: ${field.boundary.type}`,
                )
                return []
              }
            } catch (error) {
              console.warn(`Error processing field ${index}:`, error)
              return []
            }
          })
          .filter((feature) => feature !== null),
      }

      // Add the fields source
      map.addSource("fields", {
        type: "geojson",
        data: fieldsGeojson,
      })

      // Add the label points source
      map.addSource("label-points", {
        type: "geojson",
        data: labelPointsGeojson,
      })

      // Add filled polygons
      map.addLayer({
        id: "fields-fill",
        type: "fill",
        source: "fields",
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.2,
        },
      })

      // Add field outlines
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

      // Add field labels using label points
      map.addLayer({
        id: "fields-labels",
        type: "symbol",
        source: "label-points",
        layout: {
          "text-field": ["get", "name"],
          "text-anchor": "center",
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0,
            11,
            8,
            13,
            10,
            15,
            12,
            17,
            14,
          ],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#ffffff",
        },
      })

      // Calculate bounding box and store it
      const bounds = calculateBoundingBox(fields)
      if (bounds) {
        fieldBoundaryStore.set(bounds.toArray())
        console.log("Stored field bounding box")
      } else {
        console.warn("Unable to calculate valid bounding box")
      }
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
      map.off("load", loadFields)
    }
  })
</script>
