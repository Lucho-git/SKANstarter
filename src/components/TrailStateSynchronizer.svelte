<!-- TrailStateSynchronizer.svelte -->

<script>
  import { onMount, onDestroy } from "svelte"
  import { supabase } from "../lib/supabaseClient"
  import {
    userTrailStore,
    otherTrailStore,
    unsavedMarkers,
  } from "../stores/trailDataStore"

  import { page } from "$app/stores"

  let unsubscribeUserTrailData
  let unsubscribeOtherTrailData
  let unsubscribeUnsavedMarkers

  export let db

  onMount(async () => {
    console.log("Initializing TrailStateSynchronizer")

    // Load initial trail data
    await loadTrailData()

    // Subscribe to changes in the userTrailStore
    unsubscribeUserTrailData = userTrailStore.subscribe(
      async (userTrailData) => {
        await syncTrailDataWithServer(userTrailData)
        console.log("User Trail Store:", userTrailData)
      },
    )

    // Subscribe to changes in the otherTrailStore
    unsubscribeOtherTrailData = otherTrailStore.subscribe((otherTrailData) => {
      console.log("Other Trail Store:", otherTrailData)
    })

    // Subscribe to changes in the unsavedMarkers store
    unsubscribeUnsavedMarkers = unsavedMarkers.subscribe(async (markers) => {
      if (markers.length > 0) {
        await saveUnsavedMarkersToIndexedDB(markers)
      }
    })
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
    if (unsubscribeUnsavedMarkers) {
      unsubscribeUnsavedMarkers()
    }
  })

  async function saveUnsavedMarkersToIndexedDB(markers) {
    try {
      const session = $page.data.session
      if (!session) {
        console.error("User not authenticated")
        return
      }

      const userId = session.user.id

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

      const masterMapId = profile.master_map_id

      const enrichedMarkers = markers.map((marker) => ({
        id: `${userId}_${marker.timestamp}`, // Generate a unique 'id' for each marker
        ...marker,
        user_id: userId,
        master_map_id: masterMapId,
        synced: false,
      }))

      console.log("Saving unsaved markers to IndexedDB:", enrichedMarkers)

      // Store the enriched location data in the database
      console.log("Storing location data in IndexedDB", enrichedMarkers)
      db.TrailData.bulkPut(enrichedMarkers)
        .then(() => {
          console.log("Location data stored in IndexedDB")
          logIndexedDBData() // Call the function to log the stored data
        })
        .catch((error) => {
          console.error("Error storing location data in IndexedDB:", error)
        })

      // Clear the unsavedMarkers store after saving to IndexedDB
      unsavedMarkers.set([])
    } catch (error) {
      console.error("Error saving unsaved markers to IndexedDB:", error)
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
    }

    if (userTrailData.length === 0 && otherTrailData.length === 0) {
      // Load trail data from IndexedDB if Supabase data is empty or offline
      const { user: loadedUserTrailData, other: loadedOtherTrailData } =
        await loadTrailDataFromIndexedDB()
      userTrailData = loadedUserTrailData
      otherTrailData = loadedOtherTrailData
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
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const { data, error } = await supabase
        .from("trail_data")
        .select("*")
        .gte("timestamp", sevenDaysAgo.toISOString())

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
        user_id: point.vehicleId,
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

      // Store the synced user trail data points in IndexedDB for offline access
      await db.TrailData.bulkPut(syncedUserTrailData)
    } catch (error) {
      console.error("Error syncing user trail data with server:", error)
    }
  }
</script>
