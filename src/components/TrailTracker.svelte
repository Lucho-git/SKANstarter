<script>
  import { onMount, onDestroy } from "svelte"
  import {
    userTrailStore,
    otherTrailStore,
    newUserTrail,
    newOtherTrail,
  } from "../stores/trailDataStore"
  import { userVehicleStore, otherVehiclesStore } from "../stores/vehicleStore"
  import mapboxgl from "mapbox-gl"
  import * as turf from "@turf/turf"

  export let map

  let newUserTrailUnsubscribe
  let newOtherTrailUnsubscribe

  let trailData = {}

  onMount(() => {
    console.log("Mounting TrailTracker")

    console.log("Loading User Trail:", $userTrailStore)
    Object.entries($userTrailStore).forEach(([vehicleId, trail]) => {
      loadTrailLines(trail, $userVehicleStore, `user-${vehicleId}`)
    })
    console.log("Loading Other Trail:", $otherTrailStore)
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

    console.log(trailData)

    newUserTrailUnsubscribe = newUserTrail.subscribe((newTrail) => {
      console.log("New User Trail:", Object.keys(newTrail).length)
      if (Object.keys(newTrail).length > 0) {
        Object.entries(newTrail).forEach(([vehicleId, trail]) => {
          updateTrailLine(trail, $userVehicleStore, `user-${vehicleId}`)
        })
        newUserTrail.set({}) // Clear the newUserTrail store after processing
      }
    })
  })

  onDestroy(() => {
    console.log("Destroying TrailTracker")
  })

  function loadTrailLines(trail, vehicle, sourceId) {
    if (!trail || !Array.isArray(trail)) {
      console.warn(`Trail data for ${sourceId} is not an array`)
      return
    }

    const coordinates = trail.map((point) =>
      point.coordinates.slice(1, -1).split(",").map(parseFloat),
    )

    const features = []
    let currentLine = []

    const maxDistance = 1 // Maximum distance in x units unsure between points
    const maxTimeDiff = 60 * 60 * 1000 // Maximum time difference in milliseconds (1 hour)

    for (let i = 0; i < coordinates.length; i++) {
      const currentPoint = coordinates[i]
      const currentTimestamp = trail[i].timestamp

      if (currentLine.length === 0) {
        currentLine.push(currentPoint)
      } else {
        const prevPoint = currentLine[currentLine.length - 1]
        const prevTimestamp = trail[i - 1].timestamp

        const distance = turf.distance(
          turf.point(prevPoint),
          turf.point(currentPoint),
        )
        const timeDiff = currentTimestamp - prevTimestamp

        if (distance <= maxDistance && timeDiff <= maxTimeDiff) {
          currentLine.push(currentPoint)
        } else {
          features.push({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: currentLine,
            },
            properties: {},
          })
          currentLine = [currentPoint]
        }
      }
    }

    if (currentLine.length > 1) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: currentLine,
        },
        properties: {},
      })
    }

    const geojson = {
      type: "FeatureCollection",
      features: features,
    }

    // Store the trail data in the trailData object
    trailData[sourceId] = geojson

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
        "line-width": 30,
        "line-opacity": 0.4,
      },
    })

    // console.log(`Trail lines added for ${sourceId}`)

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

    // console.log(`Trail circles added for ${sourceId}`)

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
    console.log("Updating trail line", trail, vehicle, sourceId)

    // Retrieve the existing trail data from trailData
    const existingTrail = trailData[sourceId]
    console.log("Existing trail", existingTrail)

    if (existingTrail) {
      const coordinates = trail.map((point) =>
        point.coordinates.slice(1, -1).split(",").map(parseFloat),
      )

      const features = []
      let currentLine = []

      const maxDistance = 1
      const maxTimeDiff = 60 * 60 * 1000

      // Append the new coordinates to the existing trail
      coordinates.forEach((currentPoint, i) => {
        const currentTimestamp = trail[i].timestamp

        if (currentLine.length === 0) {
          currentLine.push(currentPoint)
        } else {
          const prevPoint = currentLine[currentLine.length - 1]
          const prevTimestamp = trail[i - 1].timestamp

          const distance = turf.distance(
            turf.point(prevPoint),
            turf.point(currentPoint),
          )
          const timeDiff = currentTimestamp - prevTimestamp

          if (distance <= maxDistance && timeDiff <= maxTimeDiff) {
            currentLine.push(currentPoint)
          } else {
            features.push({
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: currentLine,
              },
              properties: {},
            })
            currentLine = [currentPoint]
          }
        }
      })

      if (currentLine.length > 1) {
        features.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: currentLine,
          },
          properties: {},
        })
      }

      // Update the existing trail data with the new features
      existingTrail.features.push(...features)

      // Update the trail on the map
      const sourceIdLine = `${sourceId}-line`
      const sourceIdCircles = `${sourceId}-circles`

      map.getSource(sourceIdLine).setData(existingTrail)

      const circleData = {
        type: "FeatureCollection",
        features: existingTrail.features.flatMap((feature) => {
          return feature.geometry.coordinates.map((coordinate) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: coordinate,
            },
            properties: {},
          }))
        }),
      }

      map.getSource(sourceIdCircles).setData(circleData)
    }
  }
</script>
