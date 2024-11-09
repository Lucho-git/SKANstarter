<!-- src/components/TrailSynchronizer.svelte -->
<script>
  import { onMount, onDestroy } from "svelte"
  import { supabase } from "$lib/supabaseClient"
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
  import {
    historicalTrailStore,
    otherActiveTrailStore,
  } from "$lib/stores/otherTrailStore"
  import { profileStore } from "../../stores/profileStore"

  import EndTrailModal from "$lib/components/EndTrailModal.svelte"
  import OpenTrailModal from "$lib/components/OpenTrailModal.svelte"
  import TrailView from "$lib/components/TrailView.svelte"

  export let selectedOperation
  export let map

  let supabaseChannel
  let triggerEndTrail
  let syncIntervalId = null
  let areTrailsLoaded = false
  const SYNC_INTERVAL = 5000

  let cleanup = {
    trailingUnsubscribe: null,
    coordinateBufferUnsubscribe: null,
    unsavedCoordinatesUnsubscribe: null,
  }

  onMount(async () => {
    console.log("🚀 TrailSynchronizer: Initializing...")
    await checkOpenTrails()
    await checkOtherActiveTrails()
    await fetchOperationTrails()

    cleanup.trailingUnsubscribe = trailingButtonPressed.subscribe(
      async (isPressed) => {
        if (isPressed && !$userVehicleTrailing) {
          await handleTrailCreation()
        } else if ($userVehicleTrailing) {
          triggerEndTrail()
        }
      },
    )

    cleanup.coordinateBufferUnsubscribe = coordinateBufferStore.subscribe(
      (newCoordinateBuffer) => {
        if (
          newCoordinateBuffer &&
          newCoordinateBuffer.coordinates &&
          $userVehicleTrailing
        ) {
          processNewCoordinate(newCoordinateBuffer)
        }
      },
    )

    cleanup.unsavedCoordinatesUnsubscribe = unsavedCoordinatesStore.subscribe(
      (coordinates) => {
        if (coordinates.length > 0 && !syncIntervalId) {
          startPeriodicSync()
        } else if (coordinates.length === 0 && syncIntervalId) {
          stopPeriodicSync()
        }
      },
    )

    console.log("active trials", $otherActiveTrailStore)
    await subscribeToTrailChanges()

    await subscribeToTrailStreams()
    console.log("✅ TrailSynchronizer: Setup completed")
  })

  onDestroy(() => {
    console.log("🧹 TrailSynchronizer: Cleaning up resources")
    if (cleanup.trailingUnsubscribe) cleanup.trailingUnsubscribe()
    if (cleanup.coordinateBufferUnsubscribe)
      cleanup.coordinateBufferUnsubscribe()
    if (cleanup.unsavedCoordinatesUnsubscribe)
      cleanup.unsavedCoordinatesUnsubscribe()

    if (supabaseChannel) {
      supabaseChannel.unsubscribe()
    }

    stopPeriodicSync()
    trailingButtonPressed.set(false)
    userVehicleTrailing.set(false)
  })

  async function subscribeToTrailChanges() {
    const currentVehicleId = $userVehicleStore.vehicle_id
    console.log(
      "📡 TrailSynchronizer: Subscribing to trail changes of operation",
      selectedOperation.id,
      "and not vehicle:",
      currentVehicleId,
    )

    supabaseChannel = supabase
      .channel("trail_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trails",
          filter: `operation_id=eq.${selectedOperation.id}`,
        },
        handleTrailInsert,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trails",
          filter: `operation_id=eq.${selectedOperation.id}`,
        },
        handleTrailUpdate,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "trails",
          filter: `operation_id=eq.${selectedOperation.id}`,
        },
        handleTrailDelete,
      )
      .subscribe()

    function handleTrailInsert(payload) {
      if (!payload.new) return
      const trailData = payload.new
      // Filter out our own vehicle's trails
      if (trailData.vehicle_id === currentVehicleId) return
      console.log("🆕 New trail detected:", trailData.id)

      // Safety check for undefined or empty store
      if (!$otherActiveTrailStore?.length) {
        otherActiveTrailStore.set([])
      }

      otherActiveTrailStore.update((trails = []) => {
        return [
          ...trails,
          {
            id: trailData.id,
            vehicle_id: trailData.vehicle_id,
            operation_id: trailData.operation_id,
            start_time: trailData.start_time,
            end_time: trailData.end_time,
            task_id: trailData.task_id,
            trail_color: trailData.trail_color,
            trail_width: trailData.trail_width,
            path: [],
            detailed_path: trailData.detailed_path,
          },
        ]
      })
      console.log("active trails", $otherActiveTrailStore)
    }

    function handleTrailUpdate(payload) {
      console.log("🔄 Trail update detected:", payload)
      if (!payload.new) return
      const trailData = payload.new

      // Filter out our own vehicle's trails
      if (trailData.vehicle_id === currentVehicleId) return

      console.log("🔄 Trail update detected:", trailData.id)

      // Safety check for undefined or empty store
      if (!$otherActiveTrailStore?.length) {
        otherActiveTrailStore.set([])
      }

      otherActiveTrailStore.update((trails = []) => {
        const existingTrailIndex = trails.findIndex(
          (t) => t.id === trailData.id,
        )
        if (existingTrailIndex === -1) {
          return trails
        }

        const existingTrail = trails[existingTrailIndex]
        console.log("Updating existing trail:", trailData.id)

        // Convert the path data to GeoJSON LineString format
        const lineStringPath = {
          type: "LineString",
          coordinates: existingTrail.path.map((point) => [
            point.coordinates.longitude,
            point.coordinates.latitude,
          ]),
        }

        // Create the historical trail object
        const historicalTrail = {
          id: trailData.id,
          vehicle_id: trailData.vehicle_id,
          operation_id: trailData.operation_id,
          start_time: trailData.start_time,
          end_time: trailData.end_time,
          trail_color: trailData.trail_color,
          trail_width: trailData.trail_width,
          path: lineStringPath,
          detailed_path: trailData.detailed_path,
        }

        // Add to historical trail store
        historicalTrailStore.update((historicalTrails) => [
          ...historicalTrails,
          historicalTrail,
        ])

        // Remove from active trails
        return trails.filter((trail) => trail.id !== trailData.id)
      })
      console.log("active trails", $otherActiveTrailStore)
    }

    function handleTrailDelete(payload) {
      console.log("🗑️ Trail deletion detected:", payload)
      if (!payload.old) return

      const trailData = payload.old

      // Filter out our own vehicle's trails
      console.log(trailData.vehicle_id === currentVehicleId)
      if (trailData.vehicle_id === currentVehicleId) return

      console.log("🗑️ Trail deletion detected:", trailData.id)

      // Calculate duration in seconds
      const startTime = new Date(trailData.start_time)
      const endTime = new Date(trailData.end_time)
      const durationSeconds = Math.round((endTime - startTime) / 1000)

      // Add toast notification with more details
      toast.info(`Trail deleted by another user`, {
        description: `${trailData.trail_width}m ${trailData.trail_color.toLowerCase()} trail`,
      })

      // Check and remove from otherActiveTrailStore if present
      if ($otherActiveTrailStore?.length) {
        otherActiveTrailStore.update((trails = []) => {
          return trails.filter((trail) => trail.id !== trailData.id)
        })
      }

      // Check and remove from historicalTrailStore if present
      if ($historicalTrailStore?.length) {
        const isInHistorical = $historicalTrailStore.some(
          (trail) => trail.id === trailData.id,
        )

        if (isInHistorical) {
          historicalTrailStore.update((trails) =>
            trails.filter((trail) => trail.id !== trailData.id),
          )
        }
      }

      console.log("active trails", $otherActiveTrailStore)
    }
  }

  async function subscribeToTrailStreams() {
    console.log("📡 TrailSynchronizer: Subscribing to trail streams")
    supabaseChannel = supabase
      .channel("trail_stream_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trail_stream",
          filter: `operation_id=eq.${selectedOperation.id}`,
        },
        (payload) => {
          if (!payload.new) {
            return
          }

          const { trail_id, coordinate, timestamp } = payload.new

          // Safety check for undefined or empty store
          if (!$otherActiveTrailStore?.length) {
            return
          }

          // Check if trail_id exists in otherActiveTrailStore
          const isActiveTrail = $otherActiveTrailStore.some(
            (trail) => trail.id === trail_id,
          )
          if (!isActiveTrail) {
            return
          }

          otherActiveTrailStore.update((trails) => {
            return trails.map((trail) => {
              if (trail.id === trail_id) {
                return {
                  ...trail,
                  path: [
                    ...trail.path,
                    {
                      coordinates: {
                        latitude: coordinate.coordinates[1],
                        longitude: coordinate.coordinates[0],
                      },
                      timestamp,
                    },
                  ],
                }
              }
              return trail
            })
          })
        },
      )
      .subscribe()
  }

  function processNewCoordinate(coordinateData) {
    updateTrailPath(coordinateData)

    const coordinateWithTimestamp = {
      coordinates: coordinateData.coordinates,
      timestamp: coordinateData.timestamp,
    }

    unsavedCoordinatesStore.update((coords) => [
      ...coords,
      coordinateWithTimestamp,
    ])
    coordinateBufferStore.set(null)
  }

  function startPeriodicSync() {
    if (syncIntervalId) return

    console.log("🔄 TrailSynchronizer: Starting periodic sync")
    syncIntervalId = setInterval(() => {
      syncUnsavedCoordinates()
    }, SYNC_INTERVAL)
  }

  async function syncUnsavedCoordinates() {
    await sendBatch()
  }

  async function sendBatch() {
    const unsavedCoordinates = $unsavedCoordinatesStore

    if (unsavedCoordinates.length === 0) {
      return
    }

    const coordinatesToSend = [...unsavedCoordinates]
    unsavedCoordinatesStore.set([])

    try {
      const payload = {
        operation_id: selectedOperation.id,
        trail_id: $currentTrailStore.id,
        coordinates_batch: coordinatesToSend.map((coord) => ({
          coordinates: coord.coordinates,
          timestamp: coord.timestamp,
        })),
      }

      console.log(
        `📤 TrailSynchronizer: Sending batch of ${coordinatesToSend.length} coordinates`,
      )

      const response = await fetch("/api/map-trails/save-coordinate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await response.json()
      console.log(
        `✅ TrailSynchronizer: Successfully synced ${coordinatesToSend.length} coordinates`,
      )
    } catch (error) {
      console.log("❌ TrailSynchronizer: Failed to sync coordinates:", error)
      unsavedCoordinatesStore.update((coords) => [
        ...coordinatesToSend,
        ...coords,
      ])
    }
  }

  function stopPeriodicSync() {
    if (syncIntervalId) {
      console.log("⏹️ TrailSynchronizer: Stopping periodic sync")
      clearInterval(syncIntervalId)
      syncIntervalId = null
    }
  }

  async function getOperationTrails(operation_id) {
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

      try {
        const data = JSON.parse(text)
        return data.trails
      } catch (e) {
        throw new Error("Invalid JSON response from server")
      }
    } catch (error) {
      throw error
    }
  }

  async function fetchOperationTrails() {
    try {
      console.log("📥 TrailSynchronizer: Fetching operation trails")
      const trails = await getOperationTrails(selectedOperation.id)
      historicalTrailStore.set([])
      historicalTrailStore.update((currentTrails) => [
        ...currentTrails,
        ...trails,
      ])

      toast.success(`Loaded ${trails.length} trails`)
      areTrailsLoaded = true
      console.log(
        `✅ TrailSynchronizer: Loaded ${trails.length} historical trails`,
      )
    } catch (error) {
      console.error(
        "❌ TrailSynchronizer: Failed to fetch operation trails:",
        error,
      )
      toast.error(`Failed to fetch operation trails: ${error.message}`)
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
          vehicle_id: $profileStore.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to check for open trails")
      }

      const { openTrail, trailData } = await response.json()

      if (openTrail) {
        console.log("🔄 TrailSynchronizer: Found existing open trail")
        currentTrailStore.set({
          ...openTrail,
          start_time: openTrail.start_time,
          trail_color: openTrail.trail_color,
          trail_width: openTrail.trail_width,
          path: trailData || [],
        })

        toast.info("Loaded existing Trail")
        showOpenTrailModal.set(true)
      }
    } catch (error) {
      console.error("❌ TrailSynchronizer: Failed to check open trails:", error)
      toast.error("Failed to check for open trails")
    }
  }

  async function checkOtherActiveTrails() {
    try {
      const response = await fetch(
        "/api/map-trails/check-other-active-trails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation_id: selectedOperation.id,
            current_vehicle_id: $profileStore.id,
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to check for other active trails")
      }

      const { activeTrails } = await response.json()

      if (activeTrails && activeTrails.length > 0) {
        console.log(
          `📍 TrailSynchronizer: Found ${activeTrails.length} other active trails`,
        )
        const formattedTrails = activeTrails.map((trail) => ({
          id: trail.id,
          vehicle_id: trail.vehicle_id,
          operation_id: trail.operation_id,
          task_id: trail.task_id || null,
          start_time: trail.start_time,
          end_time: trail.end_time,
          trail_color: trail.trail_color,
          trail_width: trail.trail_width,
          path: trail.trailData || [],
          detailed_path: null,
        }))

        otherActiveTrailStore.set(formattedTrails)
      } else {
        otherActiveTrailStore.set([])
      }
    } catch (error) {
      console.error(
        "❌ TrailSynchronizer: Failed to check other active trails:",
        error,
      )
      toast.error("Failed to check for other active trails")
    }
  }

  async function handleTrailCreation() {
    const vehicleId = $userVehicleStore.vehicle_id

    try {
      await createNewTrail(vehicleId)
    } catch (error) {
      console.error("❌ TrailSynchronizer: Error creating trail:", error)
      toast.error(`Error creating trail: ${error.message}`)
    }
  }

  async function createNewTrail(vehicleId) {
    console.log("🆕 TrailSynchronizer: Creating new trail")
    const createResponse = await fetch("/api/map-trails/open-new-trail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicle_id: vehicleId,
        operation_id: selectedOperation.id,
        vehicle_info: $userVehicleStore,
      }),
    })

    const createData = await createResponse.json()

    if (!createResponse.ok) {
      throw new Error(createData.error || "Failed to create trail")
    }

    console.log("✅ TrailSynchronizer: New trail created successfully")
    toast.success("New trail created successfully")
    currentTrailStore.set({
      ...createData.trail,
      start_time: createData.trail.start_time,
      trail_color: createData.trail.trail_color,
      trail_width: createData.trail.trail_width,
      path: [],
    })
    userVehicleTrailing.set(true)
  }

  function updateTrailPath(newCoordinateData) {
    currentTrailStore.update((trail) => {
      if (trail) {
        const updatedPath = [...(trail.path || []), newCoordinateData]
        return { ...trail, path: updatedPath }
      }
      return trail
    })
  }
</script>

<EndTrailModal bind:triggerEndTrail />
<OpenTrailModal />

{#if areTrailsLoaded}
  <TrailView {map} />
{/if}
