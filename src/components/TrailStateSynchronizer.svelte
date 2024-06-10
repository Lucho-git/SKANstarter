<!-- TrailStateSynchronizer.svelte -->

<script>
  import { onMount, onDestroy } from "svelte"
  import { supabase } from "../lib/supabaseClient"
  import {
    userTrailStore,
    otherTrailStore,
    unsavedTrailStore,
  } from "../stores/trailDataStore"

  import { page } from "$app/stores"

  let unsubscribeUserTrailData
  let unsubscribeOtherTrailData
  let unsubscribeUnsavedTrailData

  export let db

  onMount(async () => {
    console.log("Initializing TrailStateSynchronizer")

    // Load initial trail data
    await loadTrailData()

    // Subscribe to changes in the otherTrailStore
    unsubscribeUserTrailData = userTrailStore.subscribe((userTrailData) => {
      console.log("User Trail Store:", userTrailData)
    })

    // Subscribe to changes in the otherTrailStore
    unsubscribeOtherTrailData = otherTrailStore.subscribe((otherTrailData) => {
      console.log("Other Trail Store:", otherTrailData)
    })

    // Subscribe to changes in the unsavedMarkers store
    unsubscribeUnsavedTrailData = unsavedTrailStore.subscribe(
      async (markers) => {
        if (markers.length > 0) {
          await processUnsavedMarkers(markers)
        }
      },
    )
  })

  onDestroy(() => {
    // Unsubscribe from the userTrailStore
    if (unsubscribeUserTrailData) {
      unsubscribeUserTrailData()
    }

    // Unsubscribe from the otherTrailStore
    if (unsubscribeOtherTrailData) {
      unsubscribeOtherTrailData()
    }

    // Unsubscribe from the unsavedMarkers store
    if (unsubscribeUnsavedTrailData) {
      unsubscribeUnsavedTrailData()
    }
  })

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

      const masterMapId = profile.master_map_id

      const enrichedMarkers = markers.map((marker) => ({
        ...marker,
        id: `${vehicleId}_${marker.timestamp}`,
        timestamp: new Date(marker.timestamp).getTime(), // Convert to Unix timestamp

        vehicle_id: vehicleId,
        coordinates: `(${marker.coordinates.longitude},${marker.coordinates.latitude})`, // Format coordinates as a PostgreSQL POINT string
        master_map_id: masterMapId,
      }))

      console.log("Inserting markers into Supabase:", enrichedMarkers)
      // Attempt to insert the markers into the Supabase database
      const { data, error } = await supabase
        .from("trail_data")
        .insert(enrichedMarkers)

      if (error) {
        console.error("Error inserting markers into Supabase:", error)
        // If the Supabase request fails or takes too long, add the markers to IndexedDB with synced set to false
        await saveMarkersToIndexedDB(enrichedMarkers, false)
      } else {
        console.log("Markers inserted into Supabase:", data)
        // If the Supabase request is successful, add the markers to IndexedDB with synced set to true
        await saveMarkersToIndexedDB(enrichedMarkers, true)
      }

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
      console.log("Markers stored in IndexedDB")
      logIndexedDBData()
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
    let userTrailData = []
    let otherTrailData = []

    if (navigator.onLine) {
      // Load trail data from Supabase if online
      const { user: loadedUserTrailData, other: loadedOtherTrailData } =
        await loadTrailDataFromSupabase()
      userTrailData = loadedUserTrailData
      otherTrailData = loadedOtherTrailData
      console.log("Trail data loaded from Supabase:", userTrailData)
    }

    if (userTrailData.length === 0 && otherTrailData.length === 0) {
      // Load trail data from IndexedDB if Supabase data is empty or offline
      const { user: loadedUserTrailData, other: loadedOtherTrailData } =
        await loadTrailDataFromIndexedDB()
      userTrailData = loadedUserTrailData
      otherTrailData = loadedOtherTrailData
      console.log("Trail data loaded from IndexedDB:", userTrailData)
    }

    // Update the userTrailStore and otherTrailStore with the loaded trail data points
    userTrailStore.set(userTrailData)
    otherTrailStore.set(otherTrailData)
  }

  async function loadTrailDataFromIndexedDB() {
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

      const filteredTrailData = await db.TrailData.where("timestamp")
        .above(sevenDaysAgo)
        .toArray()

      const userTrailData = filteredTrailData.filter(
        (point) => point.vehicleId === $userTrailStore.userId,
      )
      const otherTrailData = filteredTrailData.filter(
        (point) => point.vehicleId !== $userTrailStore.userId,
      )

      return { user: userTrailData, other: otherTrailData }
    } catch (error) {
      console.error("Error loading trail data from IndexedDB:", error)
      return { user: [], other: [] }
    }
  }

  async function loadTrailDataFromSupabase() {
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

      const { data, error } = await supabase
        .from("trail_data")
        .select("*")
        .gte("timestamp", sevenDaysAgo)

      if (error) {
        throw error
      }

      const userTrailData = data.filter(
        (point) => point.user_id === $userTrailStore.userId,
      )
      const otherTrailData = data.filter(
        (point) => point.user_id !== $userTrailStore.userId,
      )

      return { user: userTrailData, other: otherTrailData }
    } catch (error) {
      console.error("Error loading trail data from Supabase:", error)
      return { user: [], other: [] }
    }
  }

  async function syncTrailDataWithServer(userTrailData) {
    try {
      // Filter out the unsynced user trail data points
      const unsyncedUserTrailData = userTrailData.filter(
        (point) => !point.synced,
      )

      if (unsyncedUserTrailData.length === 0) {
        return
      }

      // Convert the unsynced user trail data points to match the Supabase table structure
      const convertedUserTrailData = unsyncedUserTrailData.map((point) => ({
        vehicle_id: point.vehicleId,
        timestamp: new Date(point.timestamp).toISOString(),
        location: `(${point.coordinates.longitude},${point.coordinates.latitude})`,
        synced: point.synced,
      }))

      // Send the unsynced user trail data points to the Supabase database
      const { data, error } = await supabase
        .from("trail_data")
        .insert(convertedUserTrailData)

      if (error) {
        throw error
      }

      // Update the synced flag for successfully synced user trail data points
      const syncedUserTrailData = unsyncedUserTrailData.map((point) => ({
        ...point,
        synced: true,
      }))

      // Update the userTrailStore with the synced user trail data points
      userTrailStore.update((userTrailData) => {
        const updatedUserTrailData = userTrailData.map((point) => {
          const syncedPoint = syncedUserTrailData.find(
            (syncedPoint) => syncedPoint.id === point.id,
          )
          return syncedPoint || point
        })
        return updatedUserTrailData
      })

      console.log()

      // Store the synced user trail data points in IndexedDB for offline access
      await db.TrailData.bulkPut(syncedUserTrailData)
    } catch (error) {
      console.error("Error syncing user trail data with server:", error)
    }
  }
</script>
