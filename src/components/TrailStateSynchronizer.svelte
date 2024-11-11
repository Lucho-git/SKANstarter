<!-- TrailStateSynchronizer.svelte -->

<script>
  import { onMount, onDestroy } from "svelte"
  import { supabase } from "../lib/supabaseClient"
  import {
    userTrailStore,
    otherTrailStore,
    unsavedTrailStore,
    newUserTrail,
    newOtherTrail,
  } from "../stores/trailDataStore"

  import { userVehicleStore } from "../stores/vehicleStore"

  import { trailDataLoaded } from "../stores/loadedStore"
  import { writable } from "svelte/store"

  import { page } from "$app/stores"
  import { simplifyPath } from "./pathSimplification" // We'll create this file
  import { toast } from "svelte-sonner"
  import * as turf from "@turf/turf"

  const SIMPLIFICATION_TOLERANCE = 0.0000035 // Adjust as needed
  let unsubscribeUnsavedTrailData

  export let db
  let userId
  let masterMapId
  let channel

  let syncIntervalId = null

  const TRAIL_SYNC_INTERVAL_MIN = 30000 // 30 seconds
  const TRAIL_DATA_RETENTION_DAYS = 300

  onMount(async () => {
    console.log("Initializing TrailStateSynchronizer")

    const session = $page.data.session
    if (!session) {
      console.error("User not authenticated")
      return
    }

    userId = session.user.id

    // Retrieve the user's profile to get the master_map_id
    // const { data: profile, error: profileError } = await supabase
    //   .from("profiles")
    //   .select("master_map_id")
    //   .eq("id", userId)
    //   .single()

    // if (profileError) {
    //   console.error("Error retrieving user profile:", profileError)
    //   return
    // }

    masterMapId = profile.master_map_id
    // Load initial trail data
    await loadTrailDataWithToast()

    // Subscribe to changes in the unsavedMarkers store
    unsubscribeUnsavedTrailData = unsavedTrailStore.subscribe(
      async (markers) => {
        if (markers.length > 0) {
          await processUnsavedMarkers(markers)
        }
      },
    )

    const unsyncedData = await db.TrailData.filter(
      (point) => point.synced === false,
    ).toArray()
    if (unsyncedData.length > 0) {
      console.log("Unsynced data found on mount. Starting sync scheduler.")
      startSyncScheduler()
    } else {
      console.log("No unsynced data found on mount.")
    }

    // Subscribe to real-time updates from the trail_data table
    channel = supabase
      .channel("trail_data_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trail_data",
          filter: `master_map_id=eq.${masterMapId}`,
        },
        (payload) => {
          // Handle the real-time updates for other vehicles' trails
          if (payload.new.vehicle_id !== userId) {
            // Update was made by another vehicle
            const { vehicle_id, coordinates, timestamp, color, swath } =
              payload.new
            newOtherTrail.update((trails) => {
              if (!trails[vehicle_id]) {
                trails[vehicle_id] = []
              }
              trails[vehicle_id].push({ coordinates, timestamp, color, swath })
              return trails
            })
          }
        },
      )
      .subscribe()
  })

  onDestroy(() => {
    // Unsubscribe from the unsavedMarkers store
    if (unsubscribeUnsavedTrailData) {
      unsubscribeUnsavedTrailData()
    }

    if (syncIntervalId) {
      console.log("Clearing sync interval on component destroy.")
      clearInterval(syncIntervalId)
    }

    if (channel) {
      supabase.removeChannel(channel)
    }
  })

  function startSyncScheduler() {
    if (!syncIntervalId) {
      console.log("Starting sync scheduler.")
      syncIntervalId = setInterval(
        syncUnsyncedDataWithServer,
        TRAIL_SYNC_INTERVAL_MIN,
      )
    }
  }

  async function processUnsavedMarkers(markers) {
    try {
      const session = $page.data.session
      if (!session) {
        console.error("User not authenticated")
        return
      }

      const vehicleId = session.user.id

      console.log("Processing unsaved markers:", markers)

      const enrichedMarkers = markers.map((marker) => ({
        ...marker,
        id: `${vehicleId}_${marker.timestamp}`,
        timestamp: new Date(marker.timestamp).getTime(),
        vehicle_id: vehicleId,
        coordinates: `(${marker.coordinates.longitude},${marker.coordinates.latitude})`,
        master_map_id: masterMapId,
        color: marker.color || "black",
        swath: marker.swath || 12,
      }))

      console.log("Saving new trail marker:", enrichedMarkers)

      // Attempt to insert the markers into the Supabase database
      const { data, error } = await supabase
        .from("trail_data")
        .insert(enrichedMarkers)
        .select("*")

      if (error) {
        console.log("Error inserting markers into Supabase:", error)
        console.error("Error inserting markers into Supabase:", error)
        // If the Supabase request fails or takes too long, add the markers to IndexedDB with synced set to false
        await saveMarkersToIndexedDB(enrichedMarkers, false)
        console.log("Unsynced data added. Starting sync scheduler.")
        startSyncScheduler()
      } else {
        console.log("Markers inserted into Supabase:", data)
        // If the Supabase request is successful, add the markers to IndexedDB with synced set to true
        await saveMarkersToIndexedDB(enrichedMarkers, true)
      }

      // Add the unsaved markers to userTrailStore
      userTrailStore.update((userTrail) => {
        if (!userTrail[vehicleId]) {
          userTrail[vehicleId] = []
        }
        console.log("Adding markers to userTrailStore:", enrichedMarkers)
        userTrail[vehicleId].push(...enrichedMarkers)
        return userTrail
      })

      newUserTrail.update((newTrail) => {
        if (!newTrail[vehicleId]) {
          newTrail[vehicleId] = []
        }
        console.log("Adding markers to newUserTrail:", enrichedMarkers)
        newTrail[vehicleId].push(...enrichedMarkers)
        return newTrail
      })

      // Clear the unsavedTrailStore after processing the markers
      unsavedTrailStore.set([])
    } catch (error) {
      console.error("Error processing unsaved markers:", error)
    }
  }

  async function saveMarkersToIndexedDB(markers, synced) {
    console.log("Saving markers to IndexedDB with synced set to", markers)
    try {
      const updatedMarkers = markers.map((marker) => ({
        ...marker,
        synced: synced,
      }))

      console.log(
        `Saving markers to IndexedDB with synced set to ${synced}:`,
        updatedMarkers,
      )

      await db.TrailData.bulkPut(updatedMarkers)
      //   logIndexedDBData()
    } catch (error) {
      console.error("Error storing markers in IndexedDB:", error)
    }
  }

  function logIndexedDBData() {
    db.TrailData.toArray()
      .then((data) => {
        console.log("IndexedDB TrailData:", data)
      })
      .catch((error) => {
        console.error("Error retrieving data from IndexedDB:", error)
      })
  }

  async function loadTrailDataWithToast() {
    return toast.promise(
      loadTrailData(),
      {
        loading: "Loading trail data...",
        success: (data) => {
          const userPoints = countTotalPoints(data.userTrailData)
          const otherPoints = countTotalPoints(data.otherTrailData)
          return `Trail data loaded. Trail points: ${userPoints + otherPoints}`
        },
        error:
          "Failed to load trail data. This may be due to a large amount of trail data. We're working on optimizations.",
      },
      {
        duration: 5000, // Adjust as needed
      },
    )
  }

  // Modify your loadTrailData function to return the data
  async function loadTrailData() {
    let userTrailData = {}
    let otherTrailData = {}

    if (navigator.onLine) {
      const { user: loadedUserTrailData, other: loadedOtherTrailData } =
        await loadTrailDataFromSupabase()
      userTrailData = loadedUserTrailData
      otherTrailData = loadedOtherTrailData
    }

    if (
      Object.keys(userTrailData).length === 0 &&
      Object.keys(otherTrailData).length === 0
    ) {
      const { user: loadedUserTrailData, other: loadedOtherTrailData } =
        await loadTrailDataFromIndexedDB()
      userTrailData = loadedUserTrailData
      otherTrailData = loadedOtherTrailData
    }

    console.log("Before simplification:")
    console.log("User trail points:", countTotalPoints(userTrailData))
    console.log("Other trail points:", countTotalPoints(otherTrailData))

    userTrailData = simplifyTrailData(userTrailData, SIMPLIFICATION_TOLERANCE)
    otherTrailData = simplifyTrailData(otherTrailData, SIMPLIFICATION_TOLERANCE)

    console.log("After simplification:")
    console.log("User trail points:", countTotalPoints(userTrailData))
    console.log("Other trail points:", countTotalPoints(otherTrailData))

    userTrailStore.set(userTrailData)
    otherTrailStore.set(otherTrailData)
    trailDataLoaded.set(true)

    return { userTrailData, otherTrailData }
  }
  function simplifyTrailData(trailData, tolerance) {
    return Object.fromEntries(
      Object.entries(trailData).map(([vehicleId, trail]) => [
        vehicleId,
        simplifyPath(trail, tolerance),
      ]),
    )
  }

  function countTotalPoints(trailData) {
    return Object.values(trailData).reduce(
      (total, trail) => total + trail.length,
      0,
    )
  }

  function calculateTrailLength(trailData) {
    let totalLength = 0
    Object.values(trailData).forEach((trail) => {
      const coordinates = trail.map((point) => {
        const [longitude, latitude] = point.coordinates
          .replace("(", "")
          .replace(")", "")
          .split(",")
          .map(Number)
        return [longitude, latitude]
      })
      const line = turf.lineString(coordinates)
      totalLength += turf.length(line, { units: "kilometers" })
    })
    return totalLength
  }

  async function loadTrailDataFromIndexedDB() {
    try {
      const retentionDate = getRetentionDate()
      const filteredTrailData = await db.TrailData.where("timestamp")
        .above(retentionDate)
        .and((point) => point.master_map_id === retentionDate)
        .toArray()

      // Sort the filtered trail data by timestamp in ascending order
      const sortedTrailData = filteredTrailData.sort(
        (a, b) => a.timestamp - b.timestamp,
      )

      // Group the sorted trail data by vehicle ID
      const groupedUserTrailData = groupBy(
        sortedTrailData.filter((point) => point.vehicle_id === userId),
        "vehicle_id",
      )
      const groupedOtherTrailData = groupBy(
        sortedTrailData.filter((point) => point.vehicle_id !== userId),
        "vehicle_id",
      )

      return { user: groupedUserTrailData, other: groupedOtherTrailData }
    } catch (error) {
      console.error("Error loading trail data from IndexedDB:", error)
      return { user: {}, other: {} }
    }
  }

  async function loadTrailDataFromSupabase() {
    try {
      const response = await fetch("/api/map-trails/load-map-trails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ masterMapId }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch trail data")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error loading trail data from server:", error)
      return { user: {}, other: {} }
    }
  }

  // Helper function to group an array of objects by a specific property
  function groupBy(array, property) {
    return array.reduce((acc, obj) => {
      const key = obj[property]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    }, {})
  }
  function getRetentionDate() {
    return Date.now() - TRAIL_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000
  }

  async function syncUnsyncedDataWithServer() {
    try {
      console.log("Syncing unsynced data with server")

      const unsyncedData = await db.TrailData.filter(
        (point) => point.synced === false,
      ).toArray()

      if (unsyncedData.length === 0) {
        console.log(
          "No unsynced data found in IndexedDB. Stopping sync scheduler.",
        )
        clearInterval(syncIntervalId)
        syncIntervalId = null
        return
      }

      console.log("Unsynced data found:", unsyncedData)

      const convertedData = unsyncedData.map(({ synced, ...point }) => point)

      console.log("Sending unsynced data to Supabase:", convertedData)
      const { data, error } = await supabase
        .from("trail_data")
        .upsert(convertedData)

      if (error) {
        console.error("Error inserting data into Supabase:", error)
        throw error
      }

      console.log("Data synced with server:", data)

      const syncedData = unsyncedData.map((point) => ({
        ...point,
        synced: true,
      }))

      await db.TrailData.bulkPut(syncedData)
      console.log("Synced flag updated in IndexedDB")
    } catch (error) {
      console.error("Error syncing unsynced data with server:", error)
    }
  }
</script>
