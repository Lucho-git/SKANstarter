<script>
  import { onMount, onDestroy } from "svelte"
  import {
    userTrailStore,
    otherTrailStore,
    newUserTrail,
    newOtherTrail,
    antLineConfigStore,
  } from "../stores/trailDataStore"
  import {
    userVehicleStore,
    otherVehiclesStore,
    userVehicleTrailing,
  } from "../stores/vehicleStore"

  import mapboxgl from "mapbox-gl"
  import * as turf from "@turf/turf"
  import { toast } from "@zerodevx/svelte-toast"

  export let map

  let newUserTrailUnsubscribe
  let newOtherTrailUnsubscribe
  let antLineConfigUnsubscribe

  let trailData = {}
  let animationEnabled = {}
  let latestTrails = {}

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

    antLineConfigUnsubscribe = antLineConfigStore.subscribe(toggleAntLines)
  })

  onDestroy(() => {
    if (antLineConfigUnsubscribe) {
      antLineConfigUnsubscribe()
    }
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
      const feature = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: currentLine,
        },
        properties: {},
      }

      features.push(feature)

      // Update the latest trail information
      const vehicleId = sourceId.split("-")[1]
      latestTrails[vehicleId] = {
        sourceId: sourceId,
        feature: feature,
      }
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

    console.log("COLOR", vehicle, vehicle.vehicle_marker.color)
    // Add a line layer without line-dasharray defined to fill the gaps in the dashed line
    map.addLayer({
      type: "line",
      source: sourceIdLine,
      id: layerIdLineBackground,
      paint: {
        "line-color": vehicle.vehicle_marker.color,
        "line-width": 30,
        "line-opacity": 0.4,
      },
    })

    // Create a separate layer for each trail
    features.forEach((feature, index) => {
      const trailId = `${sourceId}-trail-${index}`
      const trailSourceId = `${sourceId}-trail-${index}-line`
      console.log(`Creating trail layer for ${trailId}`)
      map.addSource(trailSourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [feature],
        },
      })
      map.addLayer({
        type: "line",
        source: trailSourceId,
        id: trailId,
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": vehicle.vehicle_marker.color,
          "line-width": 6,
          "line-dasharray": [0, 4, 3],
        },
      })

      // Update the latest trail information
      const vehicleId = sourceId.split("-")[1]
      if (index === features.length - 1) {
        console.log(
          `Updating latestTrails for vehicle ${vehicleId} with trailId ${trailId}`,
        )
        latestTrails[vehicleId] = {
          sourceId: sourceId,
          trailId: trailId,
        }
      }
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
        "circle-color": vehicle.vehicle_marker.color,
        "circle-radius": 2,
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
    // if (coordinates.length > 0) {
    //   const startCoordinate = coordinates[0]
    //   const endCoordinate = coordinates[coordinates.length - 1]

    //   // Create a marker for the start coordinate
    //   const startMarker = new mapboxgl.Marker({ color: "green" })
    //     .setLngLat(startCoordinate)
    //     .addTo(map)

    //   // Create a marker for the end coordinate
    //   const endMarker = new mapboxgl.Marker({ color: "red" })
    //     .setLngLat(endCoordinate)
    //     .addTo(map)
    // }
  }

  function updateTrailLine(trail, vehicle, sourceId) {
    console.log("Updating trail line", trail, vehicle, sourceId)

    // Retrieve the existing trail data from trailData
    const existingTrail = trailData[sourceId]

    const coordinates = trail.map((point) =>
      point.coordinates.slice(1, -1).split(",").map(parseFloat),
    )

    console.log("New coordinates to add:", coordinates)
    console.log("existingTrail", existingTrail)

    const features = []
    let currentLine = []

    const maxDistance = 1
    const maxTimeDiff = 60 * 60 * 1000

    // Process the new coordinates
    coordinates.forEach((currentPoint, i) => {
      const currentTimestamp = trail[i].timestamp

      if (existingTrail && existingTrail.features.length > 0) {
        console.log("Comparing against last datapoint of existing trail")
        // Get the last data point of the existing trail
        const lastFeature =
          existingTrail.features[existingTrail.features.length - 1]
        const lastCoordinate =
          lastFeature.geometry.coordinates[
            lastFeature.geometry.coordinates.length - 1
          ]

        const distance = turf.distance(
          turf.point(lastCoordinate),
          turf.point(currentPoint),
        )

        console.log("Distance:", distance, "maxDistance:", maxDistance)
        const timeDiff = currentTimestamp - lastFeature.properties.timestamp
        console.log("Time diff:", timeDiff, "maxTimeDiff:", maxTimeDiff)
        if (distance <= maxDistance && timeDiff <= maxTimeDiff) {
          // Append the new data point to the existing trail
          console.log("Appending to existing trail")
          lastFeature.geometry.coordinates.push(currentPoint)
          lastFeature.properties.timestamp = currentTimestamp
        } else {
          const feature = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [currentPoint],
            },
            properties: {
              timestamp: currentTimestamp,
            },
          }

          features.push(feature)

          // Update the latest trail information
          const vehicleId = sourceId.split("-")[1]
          latestTrails[vehicleId] = {
            sourceId: sourceId,
            feature: feature,
          }
        }
      } else {
        const feature = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [currentPoint],
          },
          properties: {
            timestamp: currentTimestamp,
          },
        }

        features.push(feature)

        // Update the latest trail information
        const vehicleId = sourceId.split("-")[1]
        latestTrails[vehicleId] = {
          sourceId: sourceId,
          feature: feature,
        }
      }
    })

    console.log("Processed features:", features)

    if (existingTrail) {
      console.log("Existing trail found")
      console.log(
        "Existing trail features length:",
        existingTrail.features.length,
      )

      // If there is an existing trail, append the new features to it
      existingTrail.features.push(...features)

      console.log(
        "Updated trail features length:",
        existingTrail.features.length,
      )
    } else {
      console.log("No existing trail found")

      // If there is no existing trail, create a new one with the new features
      trailData[sourceId] = {
        type: "FeatureCollection",
        features: features,
      }

      console.log("New trail created with features length:", features.length)
    }

    // Update the trail on the map
    const sourceIdLine = `${sourceId}-line`
    const sourceIdCircles = `${sourceId}-circles`

    // Check if the line source exists, and create it if it doesn't
    if (!map.getSource(sourceIdLine)) {
      console.log("Line source does not exist, creating it")

      map.addSource(sourceIdLine, {
        type: "geojson",
        data: trailData[sourceId],
      })
      console.log("COLOR", vehicle, vehicle.vehicle_marker.color)

      map.addLayer({
        type: "line",
        source: sourceIdLine,
        id: `${sourceId}-line-background`,
        paint: {
          "line-color": vehicle.vehicle_marker.color,
          "line-width": 30,
          "line-opacity": 0.4,
        },
      })

      // Create a separate source and layer for each trail
      trailData[sourceId].features.forEach((feature, index) => {
        const trailId = `${sourceId}-trail-${index}`
        const trailSourceId = `${sourceId}-trail-${index}-line`
        console.log("Creating trail source and layer for", trailId)
        if (!map.getSource(trailSourceId)) {
          map.addSource(trailSourceId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [feature],
            },
          })
          map.addLayer({
            type: "line",
            source: trailSourceId,
            id: trailId,
            layout: {
              visibility: "none",
            },
            paint: {
              "line-color": vehicle.vehicle_marker.color,
              "line-width": 6,
              "line-dasharray": [0, 4, 3],
            },
          })
        } else {
          console.log("Trail source already exists, updating data for", trailId)
          map.getSource(trailSourceId).setData({
            type: "FeatureCollection",
            features: [feature],
          })
        }
      })
    } else {
      console.log("Line source exists, updating data")
      map.getSource(sourceIdLine).setData(trailData[sourceId])
      console.log("Source", trailData[sourceId])
      // Update the data for each trail source
      trailData[sourceId].features.forEach((feature, index) => {
        const trailSourceId = `${sourceId}-trail-${index}-line`
        console.log("Updating trail source data for", trailSourceId)

        if (map.getSource(trailSourceId)) {
          // If the trail source exists, update its data
          map.getSource(trailSourceId).setData({
            type: "FeatureCollection",
            features: [feature],
          })
          console.log("Trail source data updated")
        } else {
          // If the trail source doesn't exist, create it and set its data
          console.log("Trail source doesn't exist, creating it")
          map.addSource(trailSourceId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [feature],
            },
          })
          map.addLayer({
            type: "line",
            source: trailSourceId,
            id: `${sourceId}-trail-${index}`,
            layout: {
              visibility: "none",
            },
            paint: {
              "line-color": vehicle.vehicle_marker.color,
              "line-width": 6,
              "line-dasharray": [0, 4, 3],
            },
          })
          console.log("Trail source created and data set")
          animateDashArray(trailSourceId)
        }
      })
    }

    // Check if the circle source exists, and create it if it doesn't
    if (!map.getSource(sourceIdCircles)) {
      console.log("Circle source does not exist, creating it")

      map.addSource(sourceIdCircles, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      })

      map.addLayer({
        id: `${sourceId}-circles`,
        type: "circle",
        source: sourceIdCircles,
        paint: {
          "circle-color": vehicle.vehicle_marker.color,
          "circle-radius": 2,
          "circle-opacity": 0.8,
        },
      })
    } else {
      console.log("Circle source exists, updating data")
    }

    console.log("Setting trail data:", trailData[sourceId])

    map.getSource(sourceIdLine).setData(trailData[sourceId])

    const circleData = {
      type: "FeatureCollection",
      features: trailData[sourceId].features.flatMap((feature) => {
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

    console.log("Setting circle data:", circleData)

    map.getSource(sourceIdCircles).setData(circleData)
  }

  function animateDashArray(trailId) {
    const dashArraySequence = [
      [0, 4, 3],
      [0.5, 4, 2.5],
      [1, 4, 2],
      [1.5, 4, 1.5],
      [2, 4, 1],
      [2.5, 4, 0.5],
      [3, 4, 0],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ]

    let step = 0

    function animate(timestamp) {
      const newStep = parseInt((timestamp / 50) % dashArraySequence.length)

      if (newStep !== step) {
        map.setPaintProperty(trailId, "line-dasharray", dashArraySequence[step])
        step = newStep
      }

      requestAnimationFrame(animate)
    }

    animate(0)
  }

  function toggleAntLines() {
    console.log("Toggle ant lines mode:", $antLineConfigStore)
    console.log("Latest trails:", latestTrails)

    // Set visibility based on the selected option
    if ($antLineConfigStore.allTrails) {
      // Set all trails for all users to visible
      Object.keys(trailData).forEach((sourceId) => {
        trailData[sourceId].features.forEach((feature, index) => {
          const trailId = `${sourceId}-trail-${index}`
          map.setLayoutProperty(trailId, "visibility", "visible")
          animateDashArray(trailId)
        })
      })
    } else if ($antLineConfigStore.noTrails) {
      // Set all trails for all users to none
      Object.keys(trailData).forEach((sourceId) => {
        trailData[sourceId].features.forEach((feature, index) => {
          const trailId = `${sourceId}-trail-${index}`
          map.setLayoutProperty(trailId, "visibility", "none")
        })
      })
    } else if ($antLineConfigStore.latestTrail) {
      // Set latest trails to visible and the rest to none
      Object.keys(trailData).forEach((sourceId) => {
        const vehicleId = sourceId.split("-")[1]
        const latestTrailId = latestTrails[vehicleId]?.trailId

        trailData[sourceId].features.forEach((feature, index) => {
          const trailId = `${sourceId}-trail-${index}`
          const isLatestTrail = trailId === latestTrailId
          const visibility = isLatestTrail ? "visible" : "none"
          map.setLayoutProperty(trailId, "visibility", visibility)

          if (isLatestTrail) {
            animateDashArray(trailId)
          }
        })
      })
    } else if ($antLineConfigStore.userLatestTrail) {
      // Set user's latest trail to visible and the rest to none
      Object.keys(trailData).forEach((sourceId) => {
        const vehicleId = sourceId.split("-")[1]
        const latestTrailId = latestTrails[vehicleId]?.trailId
        const isUserTrail = sourceId.startsWith("user-")

        trailData[sourceId].features.forEach((feature, index) => {
          const trailId = `${sourceId}-trail-${index}`
          const isLatestTrail = trailId === latestTrailId
          const visibility = isUserTrail && isLatestTrail ? "visible" : "none"
          map.setLayoutProperty(trailId, "visibility", visibility)

          if (isUserTrail && isLatestTrail) {
            animateDashArray(trailId)
          }
        })
      })
    }

    // Check the visibility of all trail layers
    Object.keys(trailData).forEach((sourceId) => {
      trailData[sourceId].features.forEach((feature, index) => {
        const layerId = `${sourceId}-trail-${index}`
        const layerVisibility = map.getLayoutProperty(layerId, "visibility")
        console.log(`Visibility of ${layerId}:`, layerVisibility)
      })
    })
  }
</script>
