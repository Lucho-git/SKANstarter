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
  let triggerEndTrail

  onMount(async () => {
    console.log("Trail Synchronizer Mounted")

    // Check for open trails
    await checkOpenTrails()

    // Fetch user trails
    await fetchUserTrails()

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
      (newCoordinateData) => {
        if (newCoordinateData && $userVehicleTrailing) {
          updateTrailPath(newCoordinateData)
        }
      },
    )

    return () => {
      unsubscribeTrailing()
      unsubscribeCoordinateBuffer()
    }
  })

  async function getUserTrails(vehicle_id, operation_id) {
    try {
      const response = await fetch("/api/map-trails/get-user-trails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_id, operation_id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      console.log("Raw response:", text)

      try {
        const data = JSON.parse(text)
        return data.trails
      } catch (e) {
        console.error("Error parsing JSON:", e)
        throw new Error("Invalid JSON response from server")
      }
    } catch (error) {
      console.error("Error in getUserTrails:", error)
      throw error
    }
  }

  async function fetchUserTrails() {
    try {
        const trails = await getUserTrails(
            $userVehicleStore.vehicle_id,
            selectedOperation.id,
        )
        console.group("User Trails")
        console.log("Number of trails:", trails.length)
        trails.forEach((trail, index) => {
            console.group(`Trail ${index + 1}`)
            console.log("Trail ID:", trail.id)
            console.log("Vehicle ID:", trail.vehicle_id)
            console.log("Operation ID:", trail.operation_id)
            console.log("Start Time:", new Date(trail.start_time).toLocaleString())
            console.log(
                "End Time:",
                trail.end_time
                    ? new Date(trail.end_time).toLocaleString()
                    : "Ongoing",
            )
            console.log("Trail Color:", trail.trail_color)
            console.log("Trail Width:", trail.trail_width)
            console.log(
                "Path Points:",
                trail.path && trail.path.coordinates ? trail.path.coordinates.length : 0,
            )
            console.groupEnd()
        })
        console.groupEnd()
    } catch (error) {
        console.error("Error fetching user trails:", error)
        toast.error(`Failed to fetch user trails: ${error.message}`)
    }
}

  async function checkOpenTrails() {
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

      const { openTrail } = await response.json()

      if (openTrail) {
        console.log("Found open trail:", openTrail)
        currentTrailStore.set({
          ...openTrail,
          startTime: openTrail.start_time,
          color: openTrail.trail_color,
          width: openTrail.trail_width,
        })
        toast.info("Loaded existing Trail")
        showOpenTrailModal.set(true) // Open the modal
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
      path: [], // Initialize empty path
    })
    userVehicleTrailing.set(true)
  }

  function updateTrailPath(newCoordinateData) {
    currentTrailStore.update((trail) => {
      if (trail) {
        const updatedPath = [...(trail.path || []), newCoordinateData]
        console.log("Updated path:", updatedPath)
        //stub out save to local
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
