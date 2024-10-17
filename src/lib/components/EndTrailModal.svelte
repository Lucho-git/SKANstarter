<!-- src/components/EndTrailModal.svelte -->
<script>
  import { showEndTrailModal } from "../../stores/controlStore"
  import { createEventDispatcher } from "svelte"

  export let trailInfo = {
    startTime: null,
    endTime: null,
    duration: null,
    color: null,
    width: null,
  }

  const dispatch = createEventDispatcher()

  function handleCancel() {
    dispatch("cancel")
    showEndTrailModal.set(false)
  }

  function handleSubmit() {
    dispatch("submit", trailInfo)
    showEndTrailModal.set(false)
  }

  let timeDifference

  $: {
    if (trailInfo && trailInfo.startTime && trailInfo.endTime) {
      const start = new Date(trailInfo.startTime)
      const end = new Date(trailInfo.endTime)
      timeDifference = end - start
      trailInfo.duration = `${Math.floor(timeDifference / 3600000)}h ${Math.floor((timeDifference % 3600000) / 60000)}m ${Math.floor((timeDifference % 60000) / 1000)}s`
    }
  }
</script>

{#if $showEndTrailModal && trailInfo}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">End Trail Submission</h3>
      <div class="py-4">
        <p>
          <strong>Start Time (UTC):</strong>
          {trailInfo.startTime
            ? new Date(trailInfo.startTime).toUTCString()
            : "N/A"}
        </p>
        <p>
          <strong>End Time (UTC):</strong>
          {trailInfo.endTime
            ? new Date(trailInfo.endTime).toUTCString()
            : "N/A"}
        </p>
        <p><strong>Duration:</strong> {trailInfo.duration || "N/A"}</p>
        <p>
          <strong>Raw Time Difference (ms):</strong>
          {timeDifference || "N/A"}
        </p>
        <p>
          <strong>Trail Color:</strong>
          {#if trailInfo.color}
            <span
              class="inline-block h-4 w-4"
              style="background-color: {trailInfo.color};"
            ></span>
            {trailInfo.color}
          {:else}
            N/A
          {/if}
        </p>
        <p>
          <strong>Trail Width:</strong>
          {trailInfo.width ? `${trailInfo.width}px` : "N/A"}
        </p>
      </div>
      <div class="modal-action">
        <button class="btn btn-primary" on:click={handleSubmit}
          >Submit Trail</button
        >
        <button class="btn" on:click={handleCancel}>Cancel</button>
      </div>
    </div>
    <label class="modal-backdrop" on:click={handleCancel}>Close</label>
  </div>
{/if}
