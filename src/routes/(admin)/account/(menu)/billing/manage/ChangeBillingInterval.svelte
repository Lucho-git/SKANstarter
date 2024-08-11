<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton"

  export let subscriptionData

  let showBillingCycleModal = false
  let loading = false

  $: interval = subscriptionData.stripeSubscription.plan.interval
  $: isYearly = interval === "year"

  function openBillingCycleModal() {
    showBillingCycleModal = true
    loading = true
    // Simulating an API call
    setTimeout(() => {
      loading = false
    }, 2000)
  }
</script>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">Change Billing Interval</h2>
  <button on:click={openBillingCycleModal} class="btn btn-secondary w-full">
    Switch to {isYearly ? "Monthly" : "Yearly"} Billing
  </button>
</div>

{#if showBillingCycleModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Change Billing Cycle</h3>
      {#if loading}
        <div class="py-4">
          <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
          <Skeleton class="h-[20px] w-3/4 rounded-full" />
        </div>
      {:else}
        <p class="py-4">Billing cycle change preview will be displayed here.</p>
      {/if}
      <div class="modal-action">
        <button class="btn btn-primary" disabled={loading}>Confirm</button>
        <button class="btn" on:click={() => (showBillingCycleModal = false)}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}
