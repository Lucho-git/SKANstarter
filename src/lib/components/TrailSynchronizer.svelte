<!-- src/components/TrailSynchronizer.svelte -->
<script>
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"
  import {
    userVehicleStore,
    userVehicleTrailing,
  } from "../../stores/vehicleStore"
  import {
    showOpenTrailModal,
    showEndTrailModal,
    trailingButtonPressed,
  } from "../../stores/controlStore"
  import OpenTrailModal from "$lib/components/OpenTrailModal.svelte"
  import EndTrailModal from "$lib/components/EndTrailModal.svelte"

  export let selectedOperation
  let previousTrailingState = false
  let pendingTrailCreation = null
  let hasOpenTrail = false
  let currentTrail = null

  onMount(async () => {
    console.log("Trail Synchronizer Mounted")

    // Check for open trails on mount
    const vehicleId = $userVehicleStore.vehicle_id
    try {
      console.log("Checking for open trails...")
      const checkResponse = await fetch("/api/map-trails/check-open-trails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicle_id: vehicleId,
        }),
      })

      const checkData = await checkResponse.json()

      if (!checkResponse.ok) {
        throw new Error(checkData.error || "Failed to check for open trails")
      }

      hasOpenTrail = checkData.hasOpenTrail
      if (hasOpenTrail) {
        console.warn("An open trail already exists for this vehicle")
        currentTrail = {
          ...checkData.openTrail,
          startTime: checkData.openTrail.start_time,
          color: checkData.openTrail.trail_color,
          width: checkData.openTrail.trail_width,
        }
        showOpenTrailModal.set(true)
      }
    } catch (error) {
      console.error("Error checking for open trails:", error)
      toast.error(`Error checking for open trails: ${error.message}`)
    }

    return trailingButtonPressed.subscribe(async (isPressed) => {
      console.log("Trailing Button Pressed:", isPressed)
      if (isPressed && !$userVehicleTrailing) {
        await handleTrailCreation()
      } else if (!isPressed && $userVehicleTrailing) {
        await handleTrailEnd()
      }
    })
  })

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
      if (hasOpenTrail) {
        console.warn("An open trail already exists for this vehicle")
        pendingTrailCreation = { vehicleId, operationId }
        showOpenTrailModal.set(true)
        return
      }

      await createNewTrail(vehicleId, operationId)
    } catch (error) {
      console.error("Error handling trail creation:", error)
      toast.error(`Error creating trail: ${error.message}`)
      trailingButtonPressed.set(false)
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
    logTrailCreationInfo(createData.trail)
    hasOpenTrail = true
    currentTrail = {
      ...createData.trail,
      startTime: createData.trail.start_time,
      color: createData.trail.trail_color,
      width: createData.trail.trail_width,
    }
    userVehicleTrailing.set(true)
  }

  async function handleTrailEnd() {
    const vehicleId = $userVehicleStore.vehicle_id
    console.log("Attempting to end trail for vehicle:", vehicleId)
    console.log("Current Trail:", currentTrail)
    if (currentTrail) {
      const clientEndTime = new Date().toISOString()
      currentTrail = {
        ...currentTrail,
        endTime: clientEndTime,
      }
      showEndTrailModal.set(true)
    } else {
      console.error("No current trail to end")
      toast.error("No current trail to end")
      trailingButtonPressed.set(true)
    }
  }

  function logTrailCreationInfo(trail) {
    console.group("Trail Creation Information")
    console.log("Trail ID:", trail.id)
    console.log("Operation:", selectedOperation)
    console.log("Vehicle:", $userVehicleStore)
    console.log("Trailing State:", $userVehicleTrailing)
    console.log("Vehicle ID:", trail.vehicle_id)
    console.log("Operation ID:", trail.operation_id)
    console.log("Start Time:", trail.start_time)
    console.log("Trail Color:", trail.trail_color)
    console.log("Trail Width:", trail.trail_width)

    if ($userVehicleStore.coordinates) {
      console.log("Starting Coordinates:", $userVehicleStore.coordinates)
    }
    console.groupEnd()
  }

  function handleOpenTrailModalAction(event) {
    const { action } = event.detail

    if (action === "end") {
      handleTrailEnd()
      if (pendingTrailCreation) {
        createNewTrail(
          pendingTrailCreation.vehicleId,
          pendingTrailCreation.operationId,
        )
        pendingTrailCreation = null
      }
    } else if (action === "continue") {
      toast.info("Continuing with existing trail")
      userVehicleTrailing.set(true)
      trailingButtonPressed.set(true)
    }
    showOpenTrailModal.set(false)
  }

  async function handleEndTrailSubmit(event) {
    const submittedTrailInfo = event.detail
    console.log("Submitting trail:", submittedTrailInfo)

    try {
      const response = await fetch("/api/map-trails/close-trail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trail_id: currentTrail.id,
          trail_path: submittedTrailInfo.path, // Assuming you have a path in the submitted info
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to close trail")
      }

      console.log("Trail closed successfully:", data.trail)
      toast.success("Trail closed successfully")

      // Reset trail-related states
      currentTrail = null
      hasOpenTrail = false
      userVehicleTrailing.set(false)
      trailingButtonPressed.set(false)
    } catch (error) {
      console.error("Error closing trail:", error)
      toast.error(`Error closing trail: ${error.message}`)
      // You might want to keep the trail open if there's an error
      trailingButtonPressed.set(true)
    }
  }

  function handleEndTrailCancel() {
    // When cancelling, keep userVehicleTrailing true
    trailingButtonPressed.set(true)
  }
</script>

<OpenTrailModal on:action={handleOpenTrailModalAction} />
<EndTrailModal
  trailInfo={currentTrail}
  on:submit={handleEndTrailSubmit}
  on:cancel={handleEndTrailCancel}
/>
