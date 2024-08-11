<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton"

  export let subscriptionData

  let showCancelModal = false
  let loading = false

  function openCancelModal() {
    showCancelModal = true
    loading = true
    // Simulating an API call
    setTimeout(() => {
      loading = false
    }, 2000)
  }
</script>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">Cancel Subscription</h2>
  <button on:click={openCancelModal} class="btn btn-error w-full">
    Cancel Subscription
  </button>
</div>

{#if showCancelModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Cancel Subscription</h3>
      {#if loading}
        <div class="py-4">
          <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
          <Skeleton class="h-[20px] w-3/4 rounded-full" />
        </div>
      {:else}
        <p class="py-4">
          Subscription cancellation details will be displayed here.
        </p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-error" disabled={loading}
          >Confirm Cancellation</button
        >
        <button class="btn" on:click={() => (showCancelModal = false)}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}
