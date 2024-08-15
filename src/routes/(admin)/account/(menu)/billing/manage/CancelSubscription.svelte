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

  function handleConfirm() {
    // Handle confirmation logic here
    console.log(subscriptionData)
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
    <div class="modal-box max-w-2xl">
      <h3 class="mb-6 text-2xl font-bold">Cancel Subscription</h3>
      {#if loading}
        <div class="py-4">
          <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
          <Skeleton class="h-[20px] w-3/4 rounded-full" />
        </div>
      {:else}
        <div class="space-y-6">
          <div class="rounded-lg bg-base-200 p-6">
            <h4 class="mb-3 text-lg font-semibold">
              Current Subscription Details:
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded bg-base-100 p-3">
                <p class="text-sm">Plan</p>
                <p class="text-lg font-bold">
                  {subscriptionData.appSubscription.name}
                </p>
              </div>
              <div class="rounded bg-base-100 p-3">
                <p class="text-sm">Billing Cycle</p>
                <p class="text-lg font-bold">
                  {subscriptionData.stripeSubscription.plan.interval}ly
                </p>
              </div>
              <div class="rounded bg-base-100 p-3">
                <p class="text-sm">Number of Seats</p>
                <p class="text-lg font-bold">
                  {subscriptionData.stripeSubscription.quantity}
                </p>
              </div>
              <div class="rounded bg-base-100 p-3">
                <p class="text-sm">Current Period End</p>
                <p class="text-lg font-bold">
                  {new Date(
                    subscriptionData.stripeSubscription.current_period_end *
                      1000,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-lg bg-base-200 p-6">
            <h4 class="mb-3 text-lg font-semibold">
              Cancellation Information:
            </h4>
            <p class="mb-4">If you proceed with cancellation:</p>
            <ul class="list-disc space-y-2 pl-6">
              <li>
                Your current subscription will remain active until <span
                  class="font-bold"
                  >{new Date(
                    subscriptionData.stripeSubscription.current_period_end *
                      1000,
                  ).toLocaleDateString()}</span
                >.
              </li>
              <li>
                You'll continue to have access to your current number of seats
                and features during this period.
              </li>
              <li>
                After the end date, your account will be moved to the free tier
                plan.
              </li>
              <li>No further charges will be incurred after cancellation.</li>
            </ul>
          </div>
        </div>
      {/if}
      <div class="modal-action mt-6">
        <button
          class="btn btn-error"
          on:click={handleConfirm}
          disabled={loading}>Confirm Cancellation</button
        >
        <button
          class="btn btn-outline"
          on:click={() => (showCancelModal = false)}>Close</button
        >
      </div>
    </div>
  </div>
{/if}
