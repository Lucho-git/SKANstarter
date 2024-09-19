<script>
  import { onMount, onDestroy } from "svelte"
  import {
    userTrailStore,
    otherTrailStore,
    newUserTrail,
    newOtherTrail,
    antLineConfigStore,
  } from "../stores/trailDataStore"

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

  // Constants
  const MAX_DISTANCE = 1 // in kilometers
  const MAX_TIME_DIFF = 5 * 60 * 1000 // 3 minutes in milliseconds
  const TRAIL_MULTIPLIER = 2.5 // the amount we multiplying metres by to get trail units for our conversion approximation

  // Configuration object for trail properties
  const trailConfig = {
    solidLine: {
      width: 12,
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
          updateTrailLine(trail, `user-${vehicleId}`)
        })
        newUserTrail.set({}) // Clear the newUserTrail store after processing
      }
    })

    newOtherTrailUnsubscribe = newOtherTrail.subscribe((newTrail) => {
      if (Object.keys(newTrail).length > 0) {
        Object.entries(newTrail).forEach(([vehicleId, trail]) => {
          console.log("New other trail data received:", { vehicleId, trail })

          updateTrailLine(trail, `other-${vehicleId}`)
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
    trailData = {}
    latestTrails = {}

    console.log("Loading User Trail:", $userTrailStore)
    Object.entries($userTrailStore).forEach(([vehicleId, trail]) => {
      updateTrailLine(trail, `user-${vehicleId}`)
    })

    console.log("Loading Other Trail:", $otherTrailStore)
    Object.entries($otherTrailStore).forEach(([vehicleId, trail]) => {
      updateTrailLine(trail, `other-${vehicleId}`)
    })
  }

  function createTrailLayer(sourceId, layerId, opacity, dashArray = [1]) {
    console.log("Creating/updating trail layer:", {
      sourceId,
      layerId,
      opacity,
      dashArray,
    })

    const zoomDependentWidth = [
      "interpolate",
      ["exponential", 2],
      ["zoom"],
      10,
      ["*", ["*", ["get", "swath"], TRAIL_MULTIPLIER], ["^", 2, -6]],
      24,
      ["*", ["*", ["get", "swath"], TRAIL_MULTIPLIER], ["^", 2, 8]],
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

    console.log("Layer properties set:", {
      color: map.getPaintProperty(layerId, "line-color"),
      width: map.getPaintProperty(layerId, "line-width"),
      opacity: map.getPaintProperty(layerId, "line-opacity"),
      dashArray: map.getPaintProperty(layerId, "line-dasharray"),
    })
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

  function createCircleSource(sourceId, features) {
    const sourceIdCircles = `${sourceId}-circles`

    const circleData = generateCircleData(features)

    createTrailSource(sourceIdCircles, circleData)

    if (!map.getLayer(`${sourceId}-circles`)) {
      map.addLayer({
        id: `${sourceId}-circles`,
        type: "circle",
        source: sourceIdCircles,
        paint: {
          "circle-color": ["coalesce", ["get", "color"], "black"],
          "circle-radius": trailConfig.circle.radius,
          "circle-opacity": trailConfig.circle.opacity,
        },
      })
    }
  }

  function processTrailCoordinates(coordinates) {
    console.log(
      "Processing trail coordinates",
      { coordinates },
      coordinates.length,
    )

    const features = []
    let currentLine = []
    let startTimestamp, endTimestamp, color, swath

    for (let i = 0; i < coordinates.length; i++) {
      const currentPoint = coordinates[i].coordinates
        .slice(1, -1)
        .split(",")
        .map(parseFloat)
      const currentTimestamp = coordinates[i].timestamp
      color = coordinates[i].color || color
      swath = coordinates[i].swath || swath

      if (currentLine.length === 0) {
        startTimestamp = currentTimestamp
      }

      currentLine.push(currentPoint)
      endTimestamp = currentTimestamp

      if (
        i === coordinates.length - 1 ||
        (coordinates[i + 1] &&
          (turf.distance(
            turf.point(currentPoint),
            turf.point(
              coordinates[i + 1].coordinates
                .slice(1, -1)
                .split(",")
                .map(parseFloat),
            ),
          ) > MAX_DISTANCE ||
            coordinates[i + 1].timestamp - currentTimestamp > MAX_TIME_DIFF))
      ) {
        features.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: currentLine,
          },
          properties: {
            startTimestamp,
            endTimestamp,
            color,
            swath,
          },
        })
        currentLine = []
      }
    }

    console.log("Processed trail segments count:", features.length)
    return features
  }

  function updateTrailLine(trail, sourceId) {
    console.log("Updating trail line:", { trail, sourceId })
    const existingTrail = trailData[sourceId]
    const trailArray = Array.isArray(trail) ? trail : [trail]

    if (existingTrail) {
      console.log(`Existing trail found for ${sourceId}`, existingTrail)
      const lastSegment = existingTrail.latestSegment

      console.log("Last segment before combining:", lastSegment)

      const combinedCoordinates = [
        ...lastSegment.geometry.coordinates.map((coord) => ({
          coordinates: `(${coord[0]},${coord[1]})`,
          timestamp: lastSegment.properties.endTimestamp,
          color: lastSegment.properties.color,
        })),
        ...trailArray,
      ]

      console.log("Combined coordinates:", combinedCoordinates)

      const newSegments = processTrailCoordinates(
        combinedCoordinates,
        MAX_DISTANCE,
        MAX_TIME_DIFF,
      )

      if (newSegments.length > 0) {
        trailData[sourceId].features = [
          ...existingTrail.features.slice(0, -1),
          ...newSegments,
        ]

        trailData[sourceId].latestSegment = {
          geometry: newSegments[newSegments.length - 1].geometry,
          properties: {
            ...newSegments[newSegments.length - 1].properties,
            timestamp:
              newSegments[newSegments.length - 1].properties.endTimestamp,
          },
        }

        trailData[sourceId].lastProcessedTimestamp =
          newSegments[newSegments.length - 1].properties.endTimestamp

        updateLatestSegmentOnMap(sourceId, newSegments[newSegments.length - 1])
      }
    } else {
      const initialSegments = processTrailCoordinates(trailArray)
      trailData[sourceId] = {
        features: initialSegments,
        latestSegment: {
          geometry: initialSegments[initialSegments.length - 1].geometry,
          properties: {
            ...initialSegments[initialSegments.length - 1].properties,
            timestamp:
              initialSegments[initialSegments.length - 1].properties
                .endTimestamp,
          },
        },
        lastProcessedTimestamp:
          initialSegments[initialSegments.length - 1].properties.endTimestamp,
      }
      createInitialTrailOnMap(sourceId, trailData[sourceId].features)
    }
  }

  function updateLatestSegmentOnMap(sourceId, segment) {
    console.log("Updating segment", segment)
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
        trailConfig.solidLine.opacity,
        trailConfig.solidLine.dashArray,
      )
    }
  }

  function createInitialTrailOnMap(sourceId, features) {
    console.log(`Creating initial trail on map for ${sourceId}`, features)

    trailData[sourceId] = {
      features: features,
      latestSegment: features[features.length - 1],
      lastProcessedTimestamp:
        features[features.length - 1].properties.endTimestamp,
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
