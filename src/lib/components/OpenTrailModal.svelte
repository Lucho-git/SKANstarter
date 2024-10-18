<!-- src/components/OpenTrailModal.svelte -->
<script>
  import {
    showOpenTrailModal,
    showEndTrailModal,
  } from "../../stores/controlStore"
  import { currentTrailStore } from "$lib/stores/currentTrailStore"
  import { userVehicleTrailing } from "../../stores/vehicleStore"

  function closeModal() {
    showOpenTrailModal.set(false)
  }

  function handleEndCurrentTrail() {
    const clientEndTime = new Date().toISOString()
    currentTrailStore.update((store) => ({
      ...store,
      endTime: clientEndTime,
    }))
    userVehicleTrailing.set(false)
    showOpenTrailModal.set(false)
    showEndTrailModal.set(true)
  }

  function handleContinueCurrentTrail() {
    userVehicleTrailing.set(true)
    closeModal()
  }
</script>

{#if $showOpenTrailModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Open Trail Detected</h3>
      <p class="py-4">
        An open trail already exists for this vehicle. What would you like to
        do?
      </p>
      <div class="modal-action">
        <button class="btn btn-primary" on:click={handleEndCurrentTrail}>
          End Current Trail
        </button>
        <button class="btn" on:click={handleContinueCurrentTrail}>
          Continue Current Trail
        </button>
      </div>
    </div>
    <label class="modal-backdrop" on:click={closeModal}>Close</label>
  </div>
{/if}
