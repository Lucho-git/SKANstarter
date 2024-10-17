<!-- src/components/OpenTrailModal.svelte -->
<script>
  import { showOpenTrailModal } from "../../stores/controlStore"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  function closeModal() {
    showOpenTrailModal.set(false)
  }

  function handleAction(action) {
    dispatch("action", { action })
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
        <button class="btn btn-primary" on:click={() => handleAction("end")}
          >End Current Trail</button
        >
        <button class="btn" on:click={() => handleAction("continue")}
          >Continue Current Trail</button
        >
      </div>
    </div>
    <label class="modal-backdrop" on:click={closeModal}>Close</label>
  </div>
{/if}
