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

    newUserTrailUnsubscribe = newUserTrail.subscribe((newTrail) => {
      if (Object.keys(newTrail).length > 0) {
        Object.entries(newTrail).forEach(([vehicleId, trail]) => {
          updateTrailLine(trail, $userVehicleStore, `user-${vehicleId}`)
        })
        newUserTrail.set({}) // Clear the newUserTrail store after processing
      }
    })

    newOtherTrailUnsubscribe = newOtherTrail.subscribe((newTrail) => {
      if (Object.keys(newTrail).length > 0) {
        Object.entries(newTrail).forEach(([vehicleId, trail]) => {
          const vehicle = $otherVehiclesStore.find(
            (v) => v.vehicle_id === vehicleId,
          )
          if (vehicle) {
            // updateTrailLine(trail, vehicle, `other-${vehicleId}`)
          } else {
            console.warn(`Vehicle not found for trail data: ${vehicleId}`)
          }
        })
        newOtherTrail.set({}) // Clear the newOtherTrail store after processing
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

  function createTrailSource(sourceId, data) {
    console.log("Creating trail source:", sourceId)
    console.log("Source data:", data)

    if (!map.getSource(sourceId)) {
      console.log("Adding source to the map:", sourceId)
      map.addSource(sourceId, {
        type: "geojson",
        data: data,
      })
    } else {
      console.log("Updating source data:", sourceId)
      map.getSource(sourceId).setData(data)
    }
  }

  function createTrailLayer(
    sourceId,
    layerId,
    color,
    width,
    opacity,
    dashArray = [1],
  ) {
    console.log("Creating trail layer:", layerId)

    if (!map.getLayer(layerId)) {
      console.log("Adding layer to the map:", layerId)
      map.addLayer({
        type: "line",
        source: sourceId,
        id: layerId,
        layout: {
          visibility: "visible",
        },
        paint: {
          "line-color": color,
          "line-width": width,
          "line-opacity": opacity,
          "line-dasharray": dashArray,
        },
      })
    } else {
      console.log("Layer already exists on the map:", layerId)
      map.setPaintProperty(layerId, "line-color", color)
      map.setPaintProperty(layerId, "line-width", width)
      map.setPaintProperty(layerId, "line-opacity", opacity)
      map.setPaintProperty(layerId, "line-dasharray", dashArray)
    }
  }

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

    if (currentLine.length > 0) {
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

    console.log("Trail GeoJSON:", geojson)

    // Store the trail data in the trailData object
    trailData[sourceId] = geojson

    // Create and add the trailLines and sources

    const sourceIdLine = `${sourceId}-line`
    const layerIdLineBackground = `${sourceId}-line-background`

    // Create the Solid Line

    createTrailSource(sourceIdLine, geojson)
    createTrailLayer(
      sourceIdLine,
      layerIdLineBackground,
      vehicle.vehicle_marker.color,
      30,
      0.4,
    )

    features.forEach((feature, index) => {
      const trailId = `${sourceId}-trail-${index}`
      const trailSourceId = `${sourceId}-trail-${index}-line`

      createTrailSource(trailSourceId, {
        type: "FeatureCollection",
        features: [feature],
      })

      createTrailLayer(
        trailSourceId,
        trailId,
        vehicle.vehicle_marker.color,
        6,
        0.8,
        [0, 4, 3],
      )

      // Update the latest trail information
      const vehicleId = sourceId.split("-")[1]
      if (index === features.length - 1) {
        latestTrails[vehicleId] = {
          sourceId: sourceId,
          trailId: trailId,
        }
      }
    })

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

    console.log("Creating circle source:", sourceIdCircles)
    createTrailSource(sourceIdCircles, geojsonCircles)

    console.log("Adding circle layer:", `${sourceId}-circles`)
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

    createTrailSource(sourceIdLine, trailData[sourceId])

    trailData[sourceId].features.forEach((feature, index) => {
      const trailSourceId = `${sourceId}-trail-${index}-line`
      const trailId = `${sourceId}-trail-${index}`

      createTrailSource(trailSourceId, {
        type: "FeatureCollection",
        features: [feature],
      })

      createTrailLayer(
        trailSourceId,
        trailId,
        vehicle.vehicle_marker.color,
        6,
        0.8,
        [0, 4, 3],
      )

      animateDashArray(trailId)
    })

    // Check if the circle source exists, and create it if it doesn't
    if (!map.getSource(sourceIdCircles)) {
      console.log("Circle source does not exist, creating it")

      createTrailSource(sourceIdCircles, {
        type: "FeatureCollection",
        features: [],
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

    createTrailSource(sourceIdCircles, circleData)
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
      })
    })
  }
</script>
