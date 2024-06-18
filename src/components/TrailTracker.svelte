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

  export let map

  let newUserTrailUnsubscribe
  let newOtherTrailUnsubscribe
  let antLineConfigUnsubscribe

  let trailData = {}
  let latestTrails = {}

  // Configuration object for trail properties
  const trailConfig = {
    solidLine: {
      width: 30,
      opacity: 0.4,
      dashArray: [1],
    },
    dashedLine: {
      width: 6,
      opacity: 0.8,
      dashArray: [0, 4, 3],
    },
    circle: {
      radius: 2,
      opacity: 0.8,
    },
  }

  onMount(() => {
    console.log("Mounting TrailTracker")

    loadTrailData()

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
            updateTrailLine(trail, vehicle, `other-${vehicleId}`)
          } else {
            console.warn(`Vehicle not found for trail data: ${vehicleId}`)
          }
        })
        newOtherTrail.set({}) // Clear the newOtherTrail store after processing
      }
    })
    antLineConfigUnsubscribe = antLineConfigStore.subscribe(toggleAntLines)

    // Listen to the 'style.load' event
    map.on("style.load", loadTrailData)
  })

  onDestroy(() => {
    if (antLineConfigUnsubscribe) {
      antLineConfigUnsubscribe()
    }

    map.off("style.load", recreateTrailData)

    console.log("Destroying TrailTracker")
  })

  function createTrailSource(sourceId, data) {
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: data,
      })
    } else {
      map.getSource(sourceId).setData(data)
    }
  }

  function loadTrailData() {
    trailData = {}
    latestTrails = {}

    console.log("Loading User Trail:", $userTrailStore)
    Object.entries($userTrailStore).forEach(([vehicleId, trail]) => {
      updateTrailLine(trail, $userVehicleStore, `user-${vehicleId}`)
    })

    console.log("Loading Other Trail:", $otherTrailStore)
    Object.entries($otherTrailStore).forEach(([vehicleId, trail]) => {
      const vehicle = $otherVehiclesStore.find(
        (v) => v.vehicle_id === vehicleId,
      )
      if (vehicle) {
        updateTrailLine(trail, vehicle, `other-${vehicleId}`)
      } else {
        console.warn(`Vehicle not found for trail data: ${vehicleId}`)
      }
    })
  }

  function createTrailLayer(
    sourceId,
    layerId,
    color,
    width,
    opacity,
    dashArray = [1],
  ) {
    if (!map.getLayer(layerId)) {
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
      map.setPaintProperty(layerId, "line-color", color)
      map.setPaintProperty(layerId, "line-width", width)
      map.setPaintProperty(layerId, "line-opacity", opacity)
      map.setPaintProperty(layerId, "line-dasharray", dashArray)
    }
  }

  // Function to generate circle data from trail features
  function generateCircleData(features) {
    return {
      type: "FeatureCollection",
      features: features.flatMap((feature) => {
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
  }

  function createCircleSource(sourceId, features, vehicle) {
    const sourceIdCircles = `${sourceId}-circles`

    const circleData = generateCircleData(features)

    createTrailSource(sourceIdCircles, circleData)

    if (!map.getLayer(`${sourceId}-circles`)) {
      map.addLayer({
        id: `${sourceId}-circles`,
        type: "circle",
        source: sourceIdCircles,
        paint: {
          "circle-color": vehicle.vehicle_marker.color,
          "circle-radius": trailConfig.circle.radius,
          "circle-opacity": trailConfig.circle.opacity,
        },
      })
    }
  }

  // Function to process trail coordinates and generate features
  function processTrailCoordinates(coordinates, maxDistance, maxTimeDiff) {
    const features = []
    let currentLine = []

    for (let i = 0; i < coordinates.length; i++) {
      const currentPoint = coordinates[i].coordinates
        .slice(1, -1)
        .split(",")
        .map(parseFloat)
      const currentTimestamp = coordinates[i].timestamp

      if (currentLine.length === 0) {
        currentLine.push(currentPoint)
      } else {
        const prevPoint = currentLine[currentLine.length - 1]
        const prevTimestamp = coordinates[i - 1].timestamp

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
            properties: {
              timestamp: coordinates[i - 1].timestamp,
            },
          })
          currentLine = [currentPoint]
        }
      }
    }

    // Handle the last feature separately
    if (currentLine.length > 0) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: currentLine,
        },
        properties: {
          timestamp: coordinates[coordinates.length - 1].timestamp, // Set the timestamp value for the last feature
        },
      })
    }

    return features
  }

  function updateTrailLine(trail, vehicle, sourceId) {
    // Retrieve the existing trail data from trailData
    const existingTrail = trailData[sourceId]

    const maxDistance = 1
    const maxTimeDiff = 60 * 60 * 1000

    if (existingTrail) {
      // Combine the existing trail data with the new trail data
      const combinedTrail = [
        ...existingTrail.features.flatMap((feature) =>
          feature.geometry.coordinates.map((coordinate, index) => ({
            coordinates: `(${coordinate[0]},${coordinate[1]})`,
            timestamp: feature.properties.timestamp,
          })),
        ),
        ...trail,
      ]

      // Process the combined trail data using processTrailCoordinates
      const newFeatures = processTrailCoordinates(
        combinedTrail,
        maxDistance,
        maxTimeDiff,
      )

      // Update the existing trail with the new features
      trailData[sourceId].features = newFeatures
    } else {
      // If there is no existing trail, create a new one with the new trail data
      const newFeatures = processTrailCoordinates(
        trail,
        maxDistance,
        maxTimeDiff,
      )

      trailData[sourceId] = {
        type: "FeatureCollection",
        features: newFeatures,
      }

      // Create the solid line for the new trail
      const sourceIdLine = `${sourceId}-line`
      const layerIdLineBackground = `${sourceId}-line-background`

      createTrailSource(sourceIdLine, trailData[sourceId])
      createTrailLayer(
        sourceIdLine,
        layerIdLineBackground,
        vehicle.vehicle_marker.color,
        trailConfig.solidLine.width,
        trailConfig.solidLine.opacity,
        trailConfig.solidLine.dashArray,
      )
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
        trailConfig.dashedLine.width,
        trailConfig.dashedLine.opacity,
        trailConfig.dashedLine.dashArray,
      )

      animateDashArray(trailId)

      // Update the latest trail information
      const vehicleId = sourceId.split("-")[1]
      latestTrails[vehicleId] = {
        sourceId: sourceId,
        trailId: trailId,
      }
    })

    // Create or update the circle source
    createCircleSource(sourceId, trailData[sourceId].features, vehicle)
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
      const newStep = parseInt((timestamp / 60) % dashArraySequence.length)

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
