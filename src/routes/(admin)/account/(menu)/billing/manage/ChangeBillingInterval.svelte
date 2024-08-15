<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { enhance } from "$app/forms"
  import { toast } from "svelte-sonner"

  export let subscriptionData

  let showBillingCycleModal = false
  let loading = false
  let previewData = null
  let updateResult = null

  $: interval = subscriptionData.stripeSubscription.plan.interval
  $: isYearly = interval === "year"

  async function openBillingCycleModal() {
    showBillingCycleModal = true
    loading = true
    previewData = null

    let formData = new FormData()
    formData.append("interval", isYearly ? "month" : "year")
    console.log("Switching to ", isYearly ? "month" : "year")
    try {
      const response = await fetch("?/getIntervalChangePreview", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("Interval Change Preview:", result)

      if (result.type === "success") {
        previewData = JSON.parse(result.data)
        console.log("Preview Data:", previewData)

        previewData = JSON.parse(previewData[3])
        console.log("Proration Preview:", previewData)
      } else {
        throw new Error(result.error || "Failed to fetch preview")
      }
    } catch (error) {
      console.error("Error fetching interval change preview:", error)
    } finally {
      loading = false
    }
  }

  async function handleConfirm(event) {
    event.preventDefault()
    loading = true

    const formData = new FormData()
    formData.append("interval", previewData.newBillingCycle)
    formData.append("trialEnd", previewData.currentAnchorDate.toString())

    try {
      const response = await fetch("?/changeInterval", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      updateResult = result

      if (result.success) {
        toast.success("Billing cycle updated successfully")
        showBillingCycleModal = false
        // Optionally, refresh the page or update the subscription data
      } else {
        toast.error(`Failed to update billing cycle: ${result.error}`)
      }
    } catch (error) {
      console.error("Error updating billing cycle:", error)
      toast.error("An unexpected error occurred")
    } finally {
      loading = false
    }
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
    <div class="modal-box max-w-2xl">
      {#if updateResult}
        {#if updateResult.success}
          <h3 class="mb-6 text-2xl font-bold">
            Billing Cycle Updated Successfully
          </h3>
          <div class="space-y-4">
            {#if updateResult.discountApplied}
              <p class="rounded-lg bg-info/20 p-4">
                A discount has been applied to your subscription.
              </p>
            {/if}
          </div>
        {:else}
          <h3 class="mb-6 text-2xl font-bold">Update Failed</h3>
          <p class="mb-4 rounded-lg bg-error/20 p-4">{updateResult.error}</p>
          {#if updateResult.code === "card_declined"}
            <p class="rounded-lg bg-base-200 p-4">
              Your card was declined. Please update your payment method and try
              again.
            </p>
          {:else if updateResult.code === "insufficient_funds"}
            <p class="rounded-lg bg-base-200 p-4">
              Your card has insufficient funds. Please use a different payment
              method.
            </p>
          {/if}
        {/if}
      {:else}
        <h3 class="mb-6 text-2xl font-bold">Billing Cycle Change Preview</h3>
        {#if loading}
          <div class="py-4">
            <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
            <Skeleton class="h-[20px] w-3/4 rounded-full" />
          </div>
        {:else if previewData}
          <div class="space-y-6">
            <div class="rounded-lg bg-base-200 p-6">
              <h4 class="mb-3 text-lg font-semibold">
                Existing Payment Period:
              </h4>
              <p class="mb-2">
                Continue using your plan from now until <span class="font-bold"
                  >{new Date(
                    previewData.currentAnchorDate,
                  ).toLocaleDateString()}</span
                >.
              </p>
              <p class="text-sm text-base-content/70">
                Your current plan remains active during this period at no
                additional cost.
              </p>
            </div>

            <div class="rounded-lg bg-base-200 p-6">
              <h4 class="mb-3 text-lg font-semibold">New Billing Details:</h4>
              <p class="mb-4">
                Starting <span class="font-bold"
                  >{new Date(
                    previewData.currentAnchorDate,
                  ).toLocaleDateString()}</span
                >, your new {previewData.newBillingCycle}ly billing cycle
                begins:
              </p>
              <div class="mb-4 grid grid-cols-2 gap-4">
                <div class="rounded bg-base-100 p-3">
                  <p class="text-sm">
                    Current {previewData.currentBillingCycle}ly rate
                  </p>
                  <p class="text-lg font-bold">
                    ${previewData.currentPriceWithoutDiscount.toFixed(2)}
                  </p>
                </div>
                <div class="rounded bg-base-100 p-3">
                  <p class="text-sm">
                    New {previewData.newBillingCycle}ly rate
                  </p>
                  <p class="text-lg font-bold">
                    ${previewData.newPriceWithoutDiscount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div class="border-t pt-4">
                <p class="text-center font-semibold">Monthly Cost Comparison</p>
                <div class="mt-2 flex items-center justify-between">
                  <span>Current monthly rate:</span>
                  <span class="font-bold">
                    <span class="inline-block rounded bg-base-300 px-2 py-1">
                      ${previewData.currentPricePerMonth.toFixed(2)}
                    </span>
                  </span>
                </div>
                <div class="mt-2 flex items-center justify-between">
                  <span>New monthly rate:</span>
                  <span class="font-bold">
                    <span class="inline-block rounded bg-base-300 px-2 py-1">
                      ${previewData.newPricePerMonth.toFixed(2)}
                    </span>
                  </span>
                </div>
                <p
                  class="text-md mt-4 flex items-center justify-center text-center"
                >
                  {previewData.newPricePerMonth >
                  previewData.currentPricePerMonth
                    ? "Increase"
                    : "Savings"} of
                  <span
                    class="mx-2 inline-block rounded bg-base-300 px-2 py-1 font-bold"
                    class:text-red-500={previewData.newPricePerMonth >
                      previewData.currentPricePerMonth}
                    class:text-primary={previewData.newPricePerMonth <=
                      previewData.currentPricePerMonth}
                  >
                    ${Math.abs(
                      previewData.newPricePerMonth -
                        previewData.currentPricePerMonth,
                    ).toFixed(2)}
                  </span>
                  {previewData.currency.toUpperCase()} per month
                  <span
                    class="badge badge-lg ml-2"
                    class:badge-error={previewData.newPricePerMonth >
                      previewData.currentPricePerMonth}
                    class:badge-success={previewData.newPricePerMonth <=
                      previewData.currentPricePerMonth}
                  >
                    {Math.abs(
                      ((previewData.newPricePerMonth -
                        previewData.currentPricePerMonth) /
                        previewData.currentPricePerMonth) *
                        100,
                    ).toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        {:else}
          <p class="py-4 text-error">
            Unable to load preview data. Please try again.
          </p>
        {/if}
      {/if}
      <div class="modal-action mt-6">
        {#if !updateResult && previewData}
          <form
            method="POST"
            action="?/changeInterval"
            use:enhance={({ form, data, action, cancel }) => {
              return async ({ result, update }) => {
                updateResult = result.data
                await update()
              }
            }}
          >
            <input
              type="hidden"
              name="interval"
              value={previewData.newBillingCycle}
            />
            <input
              type="hidden"
              name="trialEnd"
              value={Math.floor(
                new Date(previewData.currentAnchorDate).getTime() / 1000,
              )}
            />
            <button type="submit" class="btn btn-primary" disabled={loading}>
              Confirm New Billing Cycle
            </button>
          </form>
        {/if}
        <button
          class="btn btn-outline"
          on:click={() => {
            if (updateResult && updateResult.success) {
              window.location.reload()
            } else {
              showBillingCycleModal = false
              updateResult = null
            }
          }}
        >
          {updateResult && updateResult.success ? "Refresh Page" : "Close"}
        </button>
      </div>
    </div>
  </div>
{/if}
