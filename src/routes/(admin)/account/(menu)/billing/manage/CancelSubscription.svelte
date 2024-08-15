<script lang="ts">
  import { enhance } from "$app/forms"
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { toast } from "svelte-sonner"

  export let subscriptionData
  $: isScheduledForCancellation =
    subscriptionData.stripeSubscription.cancel_at_period_end

  let showCancelModal = false
  let loading = false
  let cancelResult = null

  function openCancelModal() {
    showCancelModal = true
    loading = false
    cancelResult = null
    console.log("Subscription Data:", subscriptionData)
  }
</script>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">
    {isScheduledForCancellation
      ? "Subscription Cancellation"
      : "Cancel Subscription"}
  </h2>
  <button
    on:click={openCancelModal}
    class="btn w-full"
    class:btn-error={!isScheduledForCancellation}
    class:btn-success={isScheduledForCancellation}
  >
    {isScheduledForCancellation
      ? "Reverse Cancellation"
      : "Cancel Subscription"}
  </button>
</div>

{#if showCancelModal}
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="mb-6 text-2xl font-bold">
        {isScheduledForCancellation
          ? "Reverse Subscription Cancellation"
          : "Cancel Subscription"}
      </h3>
      {#if loading}
        <div class="py-4">
          <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
          <Skeleton class="h-[20px] w-3/4 rounded-full" />
        </div>
      {:else if cancelResult}
        <p class="mb-4 rounded-lg bg-base-200 p-4">
          {cancelResult.message}
        </p>
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
              {isScheduledForCancellation
                ? "Reversal Information:"
                : "Cancellation Information:"}
            </h4>
            {#if isScheduledForCancellation}
              <p class="mb-4">If you reverse the cancellation:</p>
              <ul class="list-disc space-y-2 pl-6">
                <li>Your subscription will continue without interruption.</li>
                <li>You'll retain access to all current features and seats.</li>
                <li>
                  Your next billing date will remain {new Date(
                    subscriptionData.stripeSubscription.current_period_end *
                      1000,
                  ).toLocaleDateString()}.
                </li>
                <li>Regular billing will resume on this date.</li>
              </ul>
            {:else}
              <p class="mb-4">If you proceed with cancellation:</p>
              <ul class="list-disc space-y-2 pl-6">
                <li>
                  Your current subscription will remain active until
                  <span class="font-bold">
                    {new Date(
                      subscriptionData.stripeSubscription.current_period_end *
                        1000,
                    ).toLocaleDateString()}
                  </span>.
                </li>
                <li>
                  You'll continue to have access to your current number of seats
                  and features during this period.
                </li>
                <li>
                  After the end date, your account will be moved to the free
                  tier plan.
                </li>
                <li>No further charges will be incurred after cancellation.</li>
              </ul>
            {/if}
          </div>
        </div>
      {/if}
      <div class="modal-action mt-6">
        {#if !cancelResult}
          <form
            method="POST"
            action={isScheduledForCancellation
              ? "?/reverseSubscriptionCancellation"
              : "?/cancelSubscription"}
            use:enhance={({ form, data, action, cancel }) => {
              loading = true
              return async ({ result, update }) => {
                cancelResult = result.data
                await update()
                loading = false
                if (cancelResult.success) {
                  toast.success(
                    isScheduledForCancellation
                      ? "Cancellation reversed successfully"
                      : "Subscription cancelled successfully",
                  )
                } else {
                  toast.error(
                    isScheduledForCancellation
                      ? "Failed to reverse cancellation"
                      : "Failed to cancel subscription",
                  )
                }
              }
            }}
          >
            <button
              type="submit"
              class="btn"
              class:btn-error={!isScheduledForCancellation}
              class:btn-success={isScheduledForCancellation}
              disabled={loading}
            >
              {isScheduledForCancellation
                ? "Confirm Reversal"
                : "Confirm Cancellation"}
            </button>
          </form>
        {/if}
        <button
          class="btn btn-outline"
          on:click={() => {
            if (cancelResult && cancelResult.success) {
              window.location.reload()
            } else {
              showCancelModal = false
              cancelResult = null
            }
          }}
        >
          {cancelResult && cancelResult.success ? "Refresh Page" : "Close"}
        </button>
      </div>
    </div>
  </div>
{/if}
