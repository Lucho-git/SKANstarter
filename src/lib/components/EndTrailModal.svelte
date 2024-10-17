<!-- src/components/EndTrailModal.svelte -->
<script>
  import {
    showEndTrailModal,
    trailingButtonPressed,
  } from "../../stores/controlStore"
  import {
    userVehicleTrailing,
    userVehicleStore,
  } from "../../stores/vehicleStore"
  import { currentTrailStore } from "$lib/stores/currentTrailStore"
  import { toast } from "svelte-sonner"

  let timeDifference
  let duration
  let currentTime

  $: if ($showEndTrailModal && $currentTrailStore) {
    currentTime = new Date()
    timeDifference = currentTime - new Date($currentTrailStore.startTime)
    duration = formatDuration(timeDifference)
  }

  //todo do a comparison of the trail data width and color compared to the vehicles current width and color on submission, Allow the user to pick between them.

  function formatDuration(ms) {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  function handleEndTrailCancel() {
    showEndTrailModal.set(false)
    userVehicleTrailing.set(true)
  }

  async function handleSubmit() {
    if (!$currentTrailStore) {
      toast.error("No active trail to close")
      return
    }

    try {
      const clientEndTime = new Date().toISOString()
      currentTrailStore.update((store) => ({
        ...store,
        endTime: clientEndTime,
      }))

      const response = await fetch("/api/map-trails/close-trail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trail_id: $currentTrailStore.id,
          trail_path: $currentTrailStore.path,
          end_time: clientEndTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to close trail")
      }

      toast.success("Trail closed successfully")

      // Reset trail-related states
      currentTrailStore.set(null)
      userVehicleTrailing.set(false)
      trailingButtonPressed.set(false)
    } catch (error) {
      console.error("Error closing trail:", error)
      toast.error(`Error closing trail: ${error.message}`)
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
    <div class="modal-box">
      <h3 class="text-lg font-bold">End Trail Submission</h3>
      <div class="py-4">
        <p>
          <strong>Start Time (UTC):</strong>
          {new Date($currentTrailStore.startTime).toUTCString()}
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
            style="background-color: {$currentTrailStore.color};"
          ></span>
          {$currentTrailStore.color}
        </p>
        <p><strong>Trail Width:</strong> {$currentTrailStore.width}px</p>
      </div>
      <div class="modal-action">
        <button class="btn btn-primary" on:click={handleSubmit}
          >Submit Trail</button
        >
        <button class="btn" on:click={handleEndTrailCancel}>Continue</button>
      </div>
    </div>
    <label
      class="modal-backdrop"
      for="end-trail-modal"
      on:click={handleEndTrailCancel}>Close</label
    >
  </div>
{/if}
