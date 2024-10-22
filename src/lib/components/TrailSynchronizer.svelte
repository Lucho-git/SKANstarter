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
  } from "$lib/stores/currentTrailStore"
  import EndTrailModal from "$lib/components/EndTrailModal.svelte"
  import OpenTrailModal from "$lib/components/OpenTrailModal.svelte"

  export let selectedOperation
  export let indexedDB

  let triggerEndTrail

  onMount(async () => {
    console.log("Trail Synchronizer Mounted")

    await checkOpenTrails()
    await fetchOperationTrails()
    startPeriodicSync()

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

    return () => {
      unsubscribeTrailing()
      unsubscribeCoordinateBuffer()
    }
  })

  async function processNewCoordinate(coordinateData) {
    console.log("Processing new coordinate:", coordinateData)
    const trailId = $currentTrailStore.id
    const dataToSave = {
      trail_id: trailId,
      coordinates: coordinateData.coordinates,
      timestamp: coordinateData.timestamp,
    }
    console.log("save-coordinate with data", dataToSave)
    try {
      const response = await fetch("/api/map-trails/save-coordinate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Coordinate saved successfully:", result)
      updateTrailPath(coordinateData)
    } catch (error) {
      console.error("Error saving coordinate:", error)
      await saveToIndexedDB(dataToSave)
    }

    // Clear the buffer after processing
    coordinateBufferStore.set(null)
  }

  async function saveToIndexedDB(coordinateData) {
    console.log("Saving coordinate to IndexedDB:", coordinateData)
    const transaction = indexedDB.transaction(["coordinates"], "readwrite")
    const store = transaction.objectStore("coordinates")
    const request = store.add({ ...coordinateData, synced: false })

    request.onerror = (event) => {
      console.error("Error saving to IndexedDB:", event.target.error)
    }

    request.onsuccess = (event) => {
      console.log("Coordinate saved to IndexedDB successfully")
    }
  }

  function startPeriodicSync() {
    console.log("Starting periodic sync")
    setInterval(syncUnsynedCoordinates, 60000) // Try to sync every minute
  }

  async function syncUnsynedCoordinates() {
    console.log("Syncing unsynced coordinates")
    const transaction = indexedDB.transaction(["coordinates"], "readwrite")
    const store = transaction.objectStore("coordinates")
    const request = store.getAll()

    request.onerror = (event) => {
      console.error("Error fetching unsynced coordinates:", event.target.error)
    }

    request.onsuccess = async (event) => {
      const unsynced = event.target.result.filter((coord) => !coord.synced)
      console.log(`Found ${unsynced.length} unsynced coordinates`)

      for (const coordinate of unsynced) {
        try {
          const response = await fetch("/api/map-trails/save-coordinate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(coordinate),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const result = await response.json()
          console.log("Coordinate synced successfully:", result)

          coordinate.synced = true
          store.put(coordinate)
        } catch (error) {
          console.error("Error syncing coordinate:", error)
        }
      }
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
        // console.group(`Trail ${index + 1}`)
        // console.log("Trail ID:", trail.id)
        // console.log("Vehicle ID:", trail.vehicle_id)
        // console.log("Operation ID:", trail.operation_id)
        // console.log("Start Time:", new Date(trail.start_time).toLocaleString())
        // console.log(
        //   "End Time:",
        //   trail.end_time
        //     ? new Date(trail.end_time).toLocaleString()
        //     : "Ongoing",
        // )
        // console.log("Trail Color:", trail.trail_color)
        // console.log("Trail Width:", trail.trail_width)
        // console.log(
        //   "Path Points:",
        //   trail.path && trail.path.coordinates
        //     ? trail.path.coordinates.length
        //     : 0,
        // )
        // console.groupEnd()
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
    console.log("Received new coordinate data:!!!", newCoordinateData)

    currentTrailStore.update((trail) => {
      if (trail) {
        const updatedPath = [...(trail.path || []), newCoordinateData]
        console.log("Updated path:", updatedPath)
        return { ...trail, path: updatedPath }
      }
      return trail
    })
    console.log("Received new coordinate data:", newCoordinateData)
    console.log("Updated currentTrail", $currentTrailStore)
  }
</script>

<EndTrailModal bind:triggerEndTrail />
<OpenTrailModal />
