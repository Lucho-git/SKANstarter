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

  let trailData = {
    // sourceId: { features: [...], latestSegment: {...}, lastProcessedTimestamp: timestamp }
  }
  let latestTrails = {}

  let animationFrameIds = {}

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
    console.log("Destroying TrailTracker")
    if (map) {
      map.off("style.load", loadTrailData)
    }
    if (antLineConfigUnsubscribe) antLineConfigUnsubscribe()
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
    console.log("Loading Trail Data")
    trailData = {}
    latestTrails = {}

    Object.entries($userTrailStore).forEach(([vehicleId, trail]) => {
      updateTrailLine(trail, $userVehicleStore, `user-${vehicleId}`)
    })

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
    width,
    opacity,
    dashArray = [1],
  ) {
    const zoomDependentWidth = [
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      10,
      ["*", width, ["^", 2, -6]],
      24,
      ["*", width, ["^", 2, 8]],
    ]

    if (!map.getLayer(layerId)) {
      map.addLayer({
        type: "line",
        source: sourceId,
        id: layerId,
        layout: {
          visibility: "visible",
        },
        paint: {
          "line-color": ["coalesce", ["get", "color"], "black"],
          "line-width": zoomDependentWidth,
          "line-opacity": opacity,
          "line-dasharray": dashArray,
        },
      })
    } else {
      map.setPaintProperty(layerId, "line-color", [
        "coalesce",
        ["get", "color"],
        "black",
      ])
      map.setPaintProperty(layerId, "line-width", zoomDependentWidth)
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

  function processTrailCoordinates(coordinates, maxDistance, maxTimeDiff) {
    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length === 0
    ) {
      console.error(
        "Invalid coordinates provided to processTrailCoordinates",
        coordinates,
      )
      return []
    }

    const features = []
    let currentLine = []
    let lastTimestamp = coordinates[0].timestamp
    let lastColor = coordinates[0].color

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
        const distance = turf.distance(
          turf.point(prevPoint),
          turf.point(currentPoint),
        )
        const timeDiff = currentTimestamp - lastTimestamp

        if (distance <= maxDistance && timeDiff <= maxTimeDiff) {
          currentLine.push(currentPoint)
        } else {
          // End the current segment and start a new one
          features.push({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: currentLine,
            },
            properties: {
              timestamp: lastTimestamp,
              color: lastColor || "black",
            },
          })
          currentLine = [currentPoint]
        }
      }

      lastTimestamp = currentTimestamp
      lastColor = coordinates[i].color
    }

    // Add the last segment
    if (currentLine.length > 0) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: currentLine,
        },
        properties: {
          timestamp: lastTimestamp,
          color: lastColor || "black",
        },
      })
    }

    return features
  }

  function updateTrailLine(trail, vehicle, sourceId) {
    const existingTrail = trailData[sourceId]
    const maxDistance = 1
    const maxTimeDiff = 3 * 60 * 1000

    // Ensure trail is always an array
    const trailArray = Array.isArray(trail) ? trail : [trail]

    if (existingTrail) {
      const lastSegment = existingTrail.latestSegment

      // Combine the last segment with the new trail point(s)
      const combinedCoordinates = [
        ...lastSegment.geometry.coordinates.map((coord) => ({
          coordinates: `(${coord[0]},${coord[1]})`,
          timestamp: lastSegment.properties.timestamp,
          color: lastSegment.properties.color,
        })),
        ...trailArray,
      ]

      const newSegments = processTrailCoordinates(
        combinedCoordinates,
        maxDistance,
        maxTimeDiff,
      )

      if (newSegments.length > 0) {
        trailData[sourceId].features = [
          ...existingTrail.features.slice(0, -1),
          ...newSegments,
        ]
        trailData[sourceId].latestSegment = newSegments[newSegments.length - 1]
        trailData[sourceId].lastProcessedTimestamp =
          newSegments[newSegments.length - 1].properties.timestamp

        // Update this line to use updateLatestSegmentOnMap
        updateLatestSegmentOnMap(sourceId, newSegments[newSegments.length - 1])
      }
    } else {
      // Initial load
      const initialSegments = processTrailCoordinates(
        trailArray,
        maxDistance,
        maxTimeDiff,
      )
      trailData[sourceId] = {
        features: initialSegments,
        latestSegment: initialSegments[initialSegments.length - 1],
        lastProcessedTimestamp:
          initialSegments[initialSegments.length - 1].properties.timestamp,
      }
      createInitialTrailOnMap(sourceId, trailData[sourceId].features)
    }
  }

  function updateLatestSegmentOnMap(sourceId, segment) {
    const sourceIdLine = `${sourceId}-line`

    // Update the entire trail data
    const updatedTrailData = {
      type: "FeatureCollection",
      features: trailData[sourceId].features,
    }

    createTrailSource(sourceIdLine, updatedTrailData)

    if (!map.getLayer(sourceIdLine)) {
      createTrailLayer(
        sourceIdLine,
        sourceIdLine,
        trailConfig.solidLine.width,
        trailConfig.solidLine.opacity,
        trailConfig.solidLine.dashArray,
      )
    }
  }

  function createInitialTrailOnMap(sourceId, features) {
    trailData[sourceId] = {
      features: features,
      latestSegment: features[features.length - 1],
      lastProcessedTimestamp:
        features[features.length - 1].properties.timestamp,
    }

    updateLatestSegmentOnMap(sourceId, features[features.length - 1])
  }

  function animateDashArray(trailId) {
    // const dashArraySequence = [
    //   [0, 4, 3],
    //   [0.5, 4, 2.5],
    //   [1, 4, 2],
    //   [1.5, 4, 1.5],
    //   [2, 4, 1],
    //   [2.5, 4, 0.5],
    //   [3, 4, 0],
    //   [0, 0.5, 3, 3.5],
    //   [0, 1, 3, 3],
    //   [0, 1.5, 3, 2.5],
    //   [0, 2, 3, 2],
    //   [0, 2.5, 3, 1.5],
    //   [0, 3, 3, 1],
    //   [0, 3.5, 3, 0.5],
    // ]
    // let step = 0
    // function animate(timestamp) {
    //   try {
    //     const newStep = parseInt((timestamp / 40) % dashArraySequence.length)
    //     if (newStep !== step && map && map.getLayer(trailId)) {
    //       map.setPaintProperty(
    //         trailId,
    //         "line-dasharray",
    //         dashArraySequence[step],
    //       )
    //       step = newStep
    //     }
    //     animationFrameIds[trailId] = requestAnimationFrame(animate)
    //   } catch (error) {
    //     // Silently stop the animation if an error occurs
    //     cancelAnimationFrame(animationFrameIds[trailId])
    //     delete animationFrameIds[trailId]
    //   }
    // }
    // animate(0)
  }

  function toggleAntLines() {
    // // Set visibility based on the selected option
    // if ($antLineConfigStore.allTrails) {
    //   // Set all trails for all users to visible
    //   Object.keys(trailData).forEach((sourceId) => {
    //     trailData[sourceId].features.forEach((feature, index) => {
    //       const trailId = `${sourceId}-trail-${index}`
    //       map.setLayoutProperty(trailId, "visibility", "visible")
    //       animateDashArray(trailId)
    //     })
    //   })
    // } else if ($antLineConfigStore.noTrails) {
    //   // Set all trails for all users to none
    //   Object.keys(trailData).forEach((sourceId) => {
    //     trailData[sourceId].features.forEach((feature, index) => {
    //       const trailId = `${sourceId}-trail-${index}`
    //       map.setLayoutProperty(trailId, "visibility", "none")
    //     })
    //   })
    // } else if ($antLineConfigStore.latestTrail) {
    //   // Set latest trails to visible and the rest to none
    //   Object.keys(trailData).forEach((sourceId) => {
    //     const vehicleId = sourceId.split("-")[1]
    //     const latestTrailId = latestTrails[vehicleId]?.trailId
    //     trailData[sourceId].features.forEach((feature, index) => {
    //       const trailId = `${sourceId}-trail-${index}`
    //       const isLatestTrail = trailId === latestTrailId
    //       const visibility = isLatestTrail ? "visible" : "none"
    //       map.setLayoutProperty(trailId, "visibility", visibility)
    //       if (isLatestTrail) {
    //         animateDashArray(trailId)
    //       }
    //     })
    //   })
    // } else if ($antLineConfigStore.userLatestTrail) {
    //   // Set user's latest trail to visible and the rest to none
    //   Object.keys(trailData).forEach((sourceId) => {
    //     const vehicleId = sourceId.split("-")[1]
    //     const latestTrailId = latestTrails[vehicleId]?.trailId
    //     const isUserTrail = sourceId.startsWith("user-")
    //     trailData[sourceId].features.forEach((feature, index) => {
    //       const trailId = `${sourceId}-trail-${index}`
    //       const isLatestTrail = trailId === latestTrailId
    //       const visibility = isUserTrail && isLatestTrail ? "visible" : "none"
    //       map.setLayoutProperty(trailId, "visibility", visibility)
    //       if (isUserTrail && isLatestTrail) {
    //         animateDashArray(trailId)
    //       }
    //     })
    //   })
    // }
    // // Check the visibility of all trail layers
    // Object.keys(trailData).forEach((sourceId) => {
    //   trailData[sourceId].features.forEach((feature, index) => {
    //     const layerId = `${sourceId}-trail-${index}`
    //     const layerVisibility = map.getLayoutProperty(layerId, "visibility")
    //   })
    // })
  }
</script>
