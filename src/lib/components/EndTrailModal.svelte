<!-- src/components/EndTrailModal.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { Trash2 } from "lucide-svelte"
  import {
    showEndTrailModal,
    trailingButtonPressed,
  } from "../../stores/controlStore"
  import {
    userVehicleTrailing,
    userVehicleStore,
  } from "../../stores/vehicleStore"
  import {
    currentTrailStore,
    unsavedTrailsStore,
    unsavedCoordinatesStore,
    type Trail,
  } from "$lib/stores/currentTrailStore"
  import { toast } from "svelte-sonner"

  let timeDifference: number
  let duration: string
  let currentTime: Date
  let syncInterval: number
  let showDeleteConfirm = false

  onMount(() => {
    if ($unsavedTrailsStore.length > 0) {
      startPeriodicSync()
    }
  })

  onDestroy(() => {
    if (syncInterval) clearInterval(syncInterval)
  })

  $: if ($showEndTrailModal && $currentTrailStore) {
    currentTime = new Date()
    timeDifference =
      currentTime.getTime() - new Date($currentTrailStore.start_time).getTime()
    duration = formatDuration(timeDifference)
  }

  async function deleteTrail(trail_id: string) {
    try {
      const response = await fetch("/api/map-trails/delete-trail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trail_id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await response.json()
      toast.success("Trail deleted successfully")

      // Reset all states
      currentTrailStore.set(null)
      userVehicleTrailing.set(false)
      trailingButtonPressed.set(false)
      showEndTrailModal.set(false)
      showDeleteConfirm = false
    } catch (error) {
      console.error("Error deleting trail:", error)
      toast.error("Failed to delete trail")
    }
  }

  function formatDuration(ms: number): string {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  function startPeriodicSync() {
    syncInterval = setInterval(syncUnsavedTrails, 30000)
  }

  async function syncUnsavedTrails() {
    if (!$unsavedTrailsStore.length) {
      clearInterval(syncInterval)
      return
    }

    console.log(
      "Attempting to sync unsaved trails:",
      $unsavedTrailsStore.length,
    )

    for (const trailData of $unsavedTrailsStore) {
      try {
        const response = await fetch("/api/map-trails/close-trail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trailData),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        await response.json()
        unsavedTrailsStore.remove(trailData)
        unsavedCoordinatesStore.clear()
        toast.success(`Successfully synced trail ${trailData.trail_id}`)
      } catch (error) {
        console.error(`Error syncing trail: ${error.message}`)

        if (
          !error.message.includes("Failed to fetch") &&
          !error.message.includes("ERR_INTERNET_DISCONNECTED")
        ) {
          unsavedTrailsStore.remove(trailData)
          toast.error(
            `Failed to sync trail ${trailData.trail_id}: ${error.message}`,
          )
        }
      }
    }

    if ($unsavedTrailsStore.length === 0) {
      clearInterval(syncInterval)
    }
  }

  function handleEndTrailCancel() {
    showEndTrailModal.set(false)
    userVehicleTrailing.set(true)
    showDeleteConfirm = false
  }

  function handleDeleteClick() {
    showDeleteConfirm = true
  }

  function handleDeleteCancel() {
    showDeleteConfirm = false
  }

  async function handleConfirmDelete() {
    if ($currentTrailStore) {
      await deleteTrail($currentTrailStore.id)
    }
  }

  async function handleSubmit() {
    if (!$currentTrailStore) {
      toast.error("No active trail to close")
      return
    }

    const pathData = $currentTrailStore.path.map((point) => ({
      latitude: point.coordinates.latitude,
      longitude: point.coordinates.longitude,
    }))

    // Check if the path is empty or has only one coordinate
    if (pathData.length === 0 || pathData.length === 1) {
      const message =
        pathData.length === 0 ? "empty trail" : "trail with only one coordinate"
      toast.info(`Deleting ${message}`)
      await deleteTrail($currentTrailStore.id)
      return
    }

    const trailData = {
      trail_id: $currentTrailStore.id,
      path: pathData,
    }

    try {
      const response = await fetch("/api/map-trails/close-trail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trailData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to close trail")
      }

      toast.success("Trail closed successfully")

      // Clear unsaved coordinates
      unsavedCoordinatesStore.clear()

      // Reset trail-related states
      currentTrailStore.set(null)
      userVehicleTrailing.set(false)
      trailingButtonPressed.set(false)
    } catch (error) {
      console.error("Error closing trail:", error)

      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_INTERNET_DISCONNECTED")
      ) {
        toast.error(
          "Device appears to be offline. Trail will be saved when connection is restored.",
        )
        unsavedTrailsStore.add(trailData)
        startPeriodicSync()
      } else {
        toast.error(`Error closing trail: ${error.message}`)
      }

      // Reset trail-related states even if save fails
      currentTrailStore.set(null)
      userVehicleTrailing.set(false)
      trailingButtonPressed.set(false)
    }

    showEndTrailModal.set(false)
  }

  export function triggerEndTrail() {
    console.log("End trail event received in EndTrailModal")
    showEndTrailModal.set(true)
  }
</script>

{#if $showEndTrailModal && $currentTrailStore}
  <div class="modal modal-open">
    {#if showDeleteConfirm}
      <div class="modal-box">
        <h3 class="text-lg font-bold text-red-600">Confirm Delete Trail</h3>
        <div class="py-4">
          <p>
            Are you sure you want to delete this trail? This action cannot be
            undone.
          </p>
        </div>
        <div class="modal-action">
          <button class="btn btn-error" on:click={handleConfirmDelete}>
            Confirm Delete
          </button>
          <button class="btn" on:click={handleDeleteCancel}>Cancel</button>
        </div>
      </div>
    {:else}
      <div class="modal-box">
        <h3 class="text-lg font-bold">End Trail Submission</h3>
        <div class="py-4">
          <p>
            <strong>Start Time (UTC):</strong>
            {new Date($currentTrailStore.start_time).toUTCString()}
          </p>
          <p>
            <strong>Current Time (UTC):</strong>
            {currentTime.toUTCString()}
          </p>
          <p><strong>Duration:</strong> {duration}</p>
          <p><strong>Raw Time Difference (ms):</strong> {timeDifference}</p>
          <p>
            <strong>Trail Color:</strong>
            <span
              class="inline-block h-4 w-4"
              style="background-color: {$currentTrailStore.trail_color};"
            ></span>
            {$currentTrailStore.trail_color}
          </p>
          <p>
            <strong>Trail Width:</strong>
            {$currentTrailStore.trail_width}px
          </p>
          <p>
            <strong>Number of Coordinates:</strong>
            {$currentTrailStore.path.length}
          </p>

          {#if $unsavedTrailsStore.length > 0}
            <div class="mt-4 rounded bg-yellow-100 p-4">
              <p class="text-yellow-800">
                There are {$unsavedTrailsStore.length} unsaved trails pending sync
              </p>
            </div>
          {/if}
        </div>
        <div class="modal-action flex justify-between">
          <button class="btn btn-square btn-error" on:click={handleDeleteClick}>
            <Trash2 size={20} />
          </button>
          <div>
            <button class="btn btn-primary ml-2" on:click={handleSubmit}>
              Submit Trail
            </button>
            <button class="btn ml-2" on:click={handleEndTrailCancel}
              >Continue</button
            >
          </div>
        </div>
      </div>
    {/if}
    <label
      class="modal-backdrop"
      for="end-trail-modal"
      on:click={handleEndTrailCancel}>Close</label
    >
  </div>
{/if}
