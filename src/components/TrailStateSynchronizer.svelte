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

  import { trailDataLoaded } from "../stores/loadedStore"
  import { writable } from "svelte/store"

  import { page } from "$app/stores"

  let unsubscribeUnsavedTrailData

  export let db
  let userId
  let masterMapId
  let channel

  let syncIntervalId = null

  const TRAIL_SYNC_INTERVAL_MIN = 30000 // 30 seconds
  const TRAIL_DATA_RETENTION_DAYS = 21

  onMount(async () => {
    console.log("Initializing TrailStateSynchronizer")

    const session = $page.data.session
    if (!session) {
      console.error("User not authenticated")
      return
    }

    userId = session.user.id

    // Retrieve the user's profile to get the master_map_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("master_map_id")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error retrieving user profile:", profileError)
      return
    }

    masterMapId = profile.master_map_id
    // Load initial trail data
    await loadTrailData()

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
            const { vehicle_id, coordinates, timestamp } = payload.new
            newOtherTrail.update((trails) => {
              if (!trails[vehicle_id]) {
                trails[vehicle_id] = []
              }
              trails[vehicle_id].push({ coordinates, timestamp })
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

      // Retrieve the user's profile to get the master_map_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("master_map_id")
        .eq("id", vehicleId)
        .single()

      if (profileError) {
        console.error("Error retrieving user profile:", profileError)
        return
      }

      const enrichedMarkers = markers.map((marker) => ({
        ...marker,
        id: `${vehicleId}_${marker.timestamp}`,
        timestamp: new Date(marker.timestamp).getTime(), // Convert to Unix timestamp
        vehicle_id: vehicleId,
        coordinates: `(${marker.coordinates.longitude},${marker.coordinates.latitude})`, // Format coordinates as a PostgreSQL POINT string
        master_map_id: masterMapId,
      }))

      // Attempt to insert the markers into the Supabase database
      const { data, error } = await supabase
        .from("trail_data")
        .insert(enrichedMarkers)
        .select("*")

      if (error) {
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

  async function loadTrailData() {
    let userTrailData = {}
    let otherTrailData = {}

    if (navigator.onLine) {
      // Load trail data from Supabase if online
      const { user: loadedUserTrailData, other: loadedOtherTrailData } =
        await loadTrailDataFromSupabase()
      userTrailData = loadedUserTrailData
      otherTrailData = loadedOtherTrailData
      //   console.log(
      //     "Trail data loaded from Supabase",
      //     userTrailData,
      //     otherTrailData,
      //   )
    }

    if (
      Object.keys(userTrailData).length === 0 &&
      Object.keys(otherTrailData).length === 0
    ) {
      // Load trail data from IndexedDB if Supabase data is empty or offline
      const { user: loadedUserTrailData, other: loadedOtherTrailData } =
        await loadTrailDataFromIndexedDB()
      userTrailData = loadedUserTrailData
      otherTrailData = loadedOtherTrailData
      console.log("Trail data loaded from IndexedDB")
    }

    // Update the userTrailStore and otherTrailStore with the loaded trail data
    userTrailStore.set(userTrailData)
    otherTrailStore.set(otherTrailData)
    trailDataLoaded.set(true)
  }

  async function loadTrailDataFromIndexedDB() {
    try {
      const retentionDate = getRetentionDate()
      const filteredTrailData = await db.TrailData.where("timestamp")
        .above(sevenDaysAgo)
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
      const retentionDate = getRetentionDate()

      const { data: userTrailData, error: userError } = await supabase
        .from("trail_data")
        .select("*")
        .eq("master_map_id", masterMapId)
        .eq("vehicle_id", userId)
        .gte("timestamp", retentionDate)
        .order("timestamp", { ascending: true })

      if (userError) {
        throw userError
      }

      const { data: otherTrailData, error: otherError } = await supabase
        .from("trail_data")
        .select("*")
        .eq("master_map_id", masterMapId)
        .neq("vehicle_id", userId)
        .gte("timestamp", retentionDate)
        .order("timestamp", { ascending: true })

      if (otherError) {
        throw otherError
      }

      // Group the trail data by vehicle ID
      const groupedUserTrailData = groupBy(userTrailData, "vehicle_id")
      const groupedOtherTrailData = groupBy(otherTrailData, "vehicle_id")

      return { user: groupedUserTrailData, other: groupedOtherTrailData }
    } catch (error) {
      console.error("Error loading trail data from Supabase:", error)
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

      const convertedData = unsyncedData.map((point) => ({
        id: point.id,
        vehicle_id: point.vehicle_id,
        timestamp: new Date(point.timestamp).getTime(), // Convert to Unix timestamp (milliseconds)
        coordinates: point.coordinates,
        master_map_id: point.master_map_id,
      }))

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
