<!-- src/components/TrailSynchronizer.svelte -->
<script>
  import { onMount, createEventDispatcher } from "svelte"
  import { toast } from "svelte-sonner"
  import {
    userVehicleStore,
    userVehicleTrailing,
  } from "../../stores/vehicleStore"
  import {
    trailingButtonPressed,
    showOpenTrailModal,
  } from "../../stores/controlStore"
  import {
    currentTrailStore,
    coordinateBufferStore,
    unsavedCoordinatesStore,
  } from "$lib/stores/currentTrailStore"
  import EndTrailModal from "$lib/components/EndTrailModal.svelte"
  import OpenTrailModal from "$lib/components/OpenTrailModal.svelte"

  export let selectedOperation

  let triggerEndTrail
  let syncIntervalId = null
  const SYNC_INTERVAL = 30000 // 1 minute

  onMount(async () => {
    console.log("Trail Synchronizer Mounted")

    await checkOpenTrails()
    await fetchOperationTrails()

    const unsubscribeTrailing = trailingButtonPressed.subscribe(
      async (isPressed) => {
        console.log("Trailing Button Pressed:", isPressed)
        if (isPressed && !$userVehicleTrailing) {
          await handleTrailCreation()
        } else if ($userVehicleTrailing) {
          console.log("Ending Trail Called")
          console.log("Current trail store", $currentTrailStore)
          triggerEndTrail()
        }
      },
    )

    const unsubscribeCoordinateBuffer = coordinateBufferStore.subscribe(
      async (newCoordinateBuffer) => {
        console.log("BUFFER", newCoordinateBuffer)
        if (
          newCoordinateBuffer &&
          newCoordinateBuffer.coordinates &&
          $userVehicleTrailing
        ) {
          await processNewCoordinate(newCoordinateBuffer)
        }
      },
    )

    const unsubscribeUnsavedCoordinates = unsavedCoordinatesStore.subscribe(
      (coordinates) => {
        if (coordinates.length > 0 && !syncIntervalId) {
          startPeriodicSync()
        } else if (coordinates.length === 0 && syncIntervalId) {
          stopPeriodicSync()
        }
      },
    )

    return () => {
      unsubscribeTrailing()
      unsubscribeCoordinateBuffer()
      unsubscribeUnsavedCoordinates()
      stopPeriodicSync()
    }
  })

  async function processNewCoordinate(coordinateData) {
    console.log("Processing new coordinate:", coordinateData)

    // Always update the trail path immediately
    updateTrailPath(coordinateData)

    // Prepare the data
    const coordinateWithTimestamp = {
      coordinates: coordinateData.coordinates,
      timestamp: coordinateData.timestamp,
    }

    try {
      const response = await fetch("/api/map-trails/save-coordinate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trail_id: $currentTrailStore.id,
          ...coordinateWithTimestamp,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Coordinate saved successfully:", result)
    } catch (error) {
      // Handle offline errors more gracefully
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_INTERNET_DISCONNECTED")
      ) {
        console.log(
          "Device appears to be offline, queuing coordinate for later sync",
        )
      } else {
        console.error("Error saving coordinate:", error)
      }

      // Add to unsaved store for later sync
      unsavedCoordinatesStore.add(coordinateWithTimestamp)
    } finally {
      // Always clear the buffer
      coordinateBufferStore.set(null)
    }
  }

  function startPeriodicSync() {
    if (syncIntervalId) {
      console.log("Sync already running, skipping...")
      return
    }
    console.log("Starting periodic sync")
    syncIntervalId = setInterval(syncUnsavedCoordinates, SYNC_INTERVAL)
    syncUnsavedCoordinates() // Immediate first sync
  }

  function stopPeriodicSync() {
    if (syncIntervalId) {
      clearInterval(syncIntervalId)
      syncIntervalId = null
    }
  }

  async function syncUnsavedCoordinates() {
    if (!$unsavedCoordinatesStore.length) return

    console.log(
      "Attempting to sync unsaved coordinates:",
      $unsavedCoordinatesStore.length,
    )
    const coordinates = [...$unsavedCoordinatesStore]
    const successfulSyncs = []

    for (const coordinate of coordinates) {
      try {
        const response = await fetch("/api/map-trails/save-coordinate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trail_id: $currentTrailStore.id,
            coordinates: coordinate.coordinates,
            timestamp: coordinate.timestamp,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log("Coordinate synced successfully:", result)
        successfulSyncs.push(coordinate)
      } catch (error) {
        // Handle offline errors gracefully
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("ERR_INTERNET_DISCONNECTED")
        ) {
          console.log("Device offline, will retry sync later")
          // Stop trying to sync other coordinates if we're offline
          break
        } else {
          console.error(`Error syncing coordinate: ${error.message}`)
        }
      }
    }

    if (successfulSyncs.length > 0) {
      console.log(`Successfully synced ${successfulSyncs.length} coordinates`)
      unsavedCoordinatesStore.remove(successfulSyncs)
    } else {
      console.log("No coordinates were successfully synced this attempt")
    }
  }

  async function getOperationTrails(operation_id) {
    console.log("Fetching operation trails for operation:", operation_id)
    try {
      const response = await fetch("/api/map-trails/get-operation-trails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation_id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      console.log("Raw response:", text)

      try {
        const data = JSON.parse(text)
        console.log("Parsed operation trails:", data.trails)
        return data.trails
      } catch (e) {
        console.error("Error parsing JSON:", e)
        throw new Error("Invalid JSON response from server")
      }
    } catch (error) {
      console.error("Error in getOperationTrails:", error)
      throw error
    }
  }

  async function fetchOperationTrails() {
    console.log("Fetching operation trails")
    try {
      const trails = await getOperationTrails(selectedOperation.id)
      console.group("Operation Trails")
      console.log("Number of trails:", trails.length)
      trails.forEach((trail, index) => {
        console.log(`Trail ${index + 1}:`, trail)
      })
      console.groupEnd()
    } catch (error) {
      console.error("Error fetching operation trails:", error)
      toast.error(`Failed to fetch operation trails: ${error.message}`)
    }
  }

  async function checkOpenTrails() {
    console.log("Checking for open trails")
    try {
      const response = await fetch("/api/map-trails/check-open-trails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicle_id: $userVehicleStore.vehicle_id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to check for open trails")
      }

      const { openTrail, trailData } = await response.json()

      if (openTrail) {
        console.log("Found open trail:", openTrail)
        console.log("Associated trail data:", trailData)

        currentTrailStore.set({
          ...openTrail,
          startTime: openTrail.start_time,
          color: openTrail.trail_color,
          width: openTrail.trail_width,
          path: trailData || [],
        })

        toast.info("Loaded existing Trail")
        showOpenTrailModal.set(true)
      } else {
        console.log("No open trails found")
      }
    } catch (error) {
      console.error("Error checking for open trails:", error)
      toast.error("Failed to check for open trails")
    }
  }

  async function handleTrailCreation() {
    const vehicleId = $userVehicleStore.vehicle_id
    const operationId = selectedOperation.id

    console.log(
      "Attempting to create trail for vehicle:",
      vehicleId,
      "in operation:",
      operationId,
    )

    try {
      await createNewTrail(vehicleId, operationId)
    } catch (error) {
      console.error("Error handling trail creation:", error)
      toast.error(`Error creating trail: ${error.message}`)
    }
  }

  async function createNewTrail(vehicleId, operationId) {
    console.log("Creating new trail...")
    const createResponse = await fetch("/api/map-trails/open-new-trail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicle_id: vehicleId,
        operation_id: operationId,
        vehicle_info: $userVehicleStore,
      }),
    })

    const createData = await createResponse.json()

    if (!createResponse.ok) {
      throw new Error(createData.error || "Failed to create trail")
    }

    console.log("New trail created successfully:", createData.trail)
    toast.success("New trail created successfully")
    currentTrailStore.set({
      ...createData.trail,
      startTime: createData.trail.start_time,
      color: createData.trail.trail_color,
      width: createData.trail.trail_width,
      path: [],
    })
    userVehicleTrailing.set(true)
  }

  function updateTrailPath(newCoordinateData) {
    console.log("Received new coordinate data:", newCoordinateData)

    currentTrailStore.update((trail) => {
      if (trail) {
        const updatedPath = [...(trail.path || []), newCoordinateData]
        console.log("Updated path:", updatedPath)
        return { ...trail, path: updatedPath }
      }
      return trail
    })
    console.log("Updated currentTrail", $currentTrailStore)
  }
</script>

<EndTrailModal bind:triggerEndTrail />
<OpenTrailModal />
