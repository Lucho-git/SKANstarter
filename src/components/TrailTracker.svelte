<script>
  import { onMount, onDestroy } from "svelte"
  import { userTrailStore, otherTrailStore } from "../stores/trailDataStore"
  import { userVehicleStore, otherVehiclesStore } from "../stores/vehicleStore"
  import mapboxgl from "mapbox-gl"

  export let map

  let userTrailUnsubscribe
  let otherTrailUnsubscribe

  onMount(() => {
    console.log("Mounting TrailTracker")

    Object.entries($userTrailStore).forEach(([vehicleId, trail]) => {
      loadTrailLines(trail, $userVehicleStore, `user-${vehicleId}`)
    })

    Object.entries($otherTrailStore).forEach(([vehicleId, trail]) => {
      const vehicle = $otherVehiclesStore.find(
        (v) => v.vehicle_id === vehicleId,
      )
      if (vehicle) {
        loadTrailLines(trail, vehicle, `other-${vehicleId}`)
      } else {
        console.warn(`Vehicle not found for trail data: ${vehicleId}`)
      }
    })

    // Subscribe to changes in the trail stores
    userTrailUnsubscribe = userTrailStore.subscribe((userTrail) => {
      Object.entries(userTrail).forEach(([vehicleId, trail]) => {
        updateTrailLine(trail, $userVehicleStore, `user-${vehicleId}`)
      })
    })

    otherTrailUnsubscribe = otherTrailStore.subscribe((otherTrail) => {
      Object.entries(otherTrail).forEach(([vehicleId, trail]) => {
        const vehicle = $otherVehiclesStore.find(
          (v) => v.vehicle_id === vehicleId,
        )
        if (vehicle) {
          updateTrailLine(trail, vehicle, `other-${vehicleId}`)
        }
      })
    })
  })

  onDestroy(() => {
    console.log("Destroying TrailTracker")

    // Unsubscribe from the trail stores
    if (userTrailUnsubscribe) {
      userTrailUnsubscribe()
    }
    if (otherTrailUnsubscribe) {
      otherTrailUnsubscribe()
    }
  })

  function loadTrailLines(trail, vehicle, sourceId) {
    if (!trail || !Array.isArray(trail)) {
      console.warn(`Trail data for ${sourceId} is not an array`)
      return
    }

    const coordinates = trail.map((point) =>
      point.coordinates.slice(1, -1).split(",").map(parseFloat),
    )

    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
          properties: {},
        },
      ],
    }

    const sourceIdLine = `${sourceId}-line`
    const layerIdLineBackground = `${sourceId}-line-background`

    map.addSource(sourceIdLine, {
      type: "geojson",
      data: geojson,
    })

    // Add a line layer without line-dasharray defined to fill the gaps in the dashed line
    map.addLayer({
      type: "line",
      source: sourceIdLine,
      id: layerIdLineBackground,
      paint: {
        "line-color": "yellow",
        "line-width": 6,
        "line-opacity": 0.4,
      },
    })

    console.log(`Trail lines added for ${sourceId}`)

    // Add circles for each coordinate point
    const sourceIdCircles = `${sourceId}-circles`
    const geojsonCircles = {
      type: "FeatureCollection",
      features: coordinates.map((coordinate) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coordinate,
        },
        properties: {},
      })),
    }

    map.addSource(sourceIdCircles, {
      type: "geojson",
      data: geojsonCircles,
    })

    map.addLayer({
      id: `${sourceId}-circles`,
      type: "circle",
      source: sourceIdCircles,
      paint: {
        "circle-color": "blue",
        "circle-radius": 5,
        "circle-opacity": 0.8,
      },
    })

    console.log(`Trail circles added for ${sourceId}`)

    // Commented out marker code
    // coordinates.forEach((coordinate, index) => {
    //   const marker = new mapboxgl.Marker()
    //     .setLngLat(coordinate)
    //     .setPopup(new mapboxgl.Popup().setText(`Point ${index + 1}`))
    //     .addTo(map)
    // })

    // Add markers at the beginning and end of the trail
    if (coordinates.length > 0) {
      const startCoordinate = coordinates[0]
      const endCoordinate = coordinates[coordinates.length - 1]

      // Create a marker for the start coordinate
      const startMarker = new mapboxgl.Marker({ color: "green" })
        .setLngLat(startCoordinate)
        .addTo(map)

      // Create a marker for the end coordinate
      const endMarker = new mapboxgl.Marker({ color: "red" })
        .setLngLat(endCoordinate)
        .addTo(map)
    }
  }

  function updateTrailLine(trail, vehicle, sourceId) {
    const source = map.getSource(sourceId)
    if (source) {
      const geojson = {
        type: "FeatureCollection",
        features: trail.map((point) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: point.coordinates
              .slice(1, -1)
              .split(",")
              .map(parseFloat),
          },
          properties: {
            timestamp: point.timestamp,
          },
        })),
      }
      source.setData(geojson)
    }
  }
</script>
