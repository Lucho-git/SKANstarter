<script lang="ts">
  import { enhance } from "$app/forms"
  import { Skeleton } from "$lib/components/ui/skeleton"

  export let data
  let { subscriptionData, seatManagementInfo } = data
  let currentSeats = subscriptionData.stripeSubscription.quantity || 1
  let selectedSeats = currentSeats
  let showSeatsModal = false
  let loading = false
  let modalContent = null
  let importantInfo = null

  $: seatDifference = selectedSeats - currentSeats
  $: isIncreasing = seatDifference > 0
  $: isDecreasing = seatDifference < 0

  function incrementSeats() {
    selectedSeats += 1
  }

  function decrementSeats() {
    if (selectedSeats > 1) selectedSeats -= 1
  }

  async function openSeatsModal() {
    showSeatsModal = true
    loading = true
    modalContent = null
    importantInfo = null // Reset importantInfo

    let formData = new FormData()
    formData.append("quantity", selectedSeats.toString())
    formData.append("appliedDate", isIncreasing ? "now" : "later")
    console.log("applieddate", isIncreasing ? "now" : "later")
    try {
      const response = await fetch("?/getProratedChangePreview", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("Proration Preview:", result)
      console.log("Price info", seatManagementInfo)
      if (result.type === "success") {
        console.log("Parsing Data:", result.type)
        const parsedData = JSON.parse(result.data)
        const prorationPreview = JSON.parse(parsedData[3])[2]
        console.log("Parsed Data:", prorationPreview)
        modalContent = prorationPreview

        importantInfo = extractImportantInfo(prorationPreview, isIncreasing)

        console.log("Important Information:", importantInfo)
      }
    } catch (error) {
      console.error("Error fetching proration preview:", error)
    } finally {
      loading = false
    }
  }

  function extractImportantInfo(prorationPreview, isIncreasing) {
    const lines = prorationPreview.lines.data

    const currentSeats = lines[0].quantity
    const newSeats = lines[1].quantity
    const anchorDate = new Date(lines[0].period.end * 1000)
    const daysUntilAnchor = Math.ceil(
      (lines[0].period.end - lines[0].period.start) / (24 * 60 * 60),
    )
    const futureCost = lines[2].amount / 100
    const immediateCharge = isIncreasing
      ? (lines[0].amount + lines[1].amount) / 100
      : 0
    const billingCycle = lines[0].price.recurring.interval
    console.log("IsIncreasing?", isIncreasing)
    const nextPaymentDate = isIncreasing ? anchorDate : new Date()
    const currency = lines[0].currency

    return {
      currentSeats,
      newSeats,
      billingCycle: billingCycle === "year" ? "annual" : "monthly",
      currency,
      changeAppliedDate: isIncreasing ? "immediately" : "on next billing date",
      immediateCharge,
      futureCost,
      anchorDate: anchorDate.toISOString().split("T")[0],
      daysUntilAnchor,
      isIncreasing,
      nextPaymentDate: nextPaymentDate.toISOString().split("T")[0],
      lineItems: lines.map((item) => ({
        description: item.description,
        amount: item.amount / 100,
        proration: item.proration,
      })),
    }
  }
</script>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">Manage Seats</h2>
  <div class="mb-4 flex items-center justify-center">
    <button
      class="btn btn-outline btn-sm {isDecreasing ? 'text-red-500' : ''}"
      on:click={decrementSeats}
      disabled={selectedSeats === 1}
    >
      -
    </button>
    <span class="mx-4 text-lg font-bold text-black">
      {selectedSeats}
      {selectedSeats === 1 ? "seat" : "seats"}
    </span>
    <button
      class="btn btn-outline btn-sm {isIncreasing
        ? 'bg-gradient-to-r from-secondary to-accent text-secondary-content hover:from-secondary-focus hover:to-accent-focus'
        : ''}"
      on:click={incrementSeats}
    >
      +
    </button>
  </div>
  <button
    on:click={openSeatsModal}
    class="btn w-full {seatDifference === 0
      ? 'btn-disabled'
      : isDecreasing
        ? 'btn-warning btn-outline'
        : 'bg-gradient-to-r from-secondary to-accent text-secondary-content hover:from-secondary-focus hover:to-accent-focus'}"
    disabled={seatDifference === 0}
  >
    {#if isDecreasing}
      Reduce {Math.abs(seatDifference)} seats
    {:else if isIncreasing}
      Add {seatDifference} seats
    {:else}
      Modify number of seats
    {/if}
  </button>
</div>

{#if showSeatsModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="mb-4 text-xl font-bold">Confirm Seat Update</h3>
      {#if loading}
        <div class="py-4">
          <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
          <Skeleton class="h-[20px] w-3/4 rounded-full" />
        </div>
      {:else if importantInfo}
        <div class="space-y-4">
          <p>
            You are updating your subscription from <span class="font-semibold"
              >{importantInfo.currentSeats}</span
            >
            to
            <span class="text-lg font-semibold"
              >{importantInfo.newSeats} seat{importantInfo.newSeats > 1
                ? "s"
                : ""}</span
            >.
          </p>
          <div class="rounded-lg bg-base-200 p-4">
            <h4 class="mb-2 font-semibold">Immediate Changes:</h4>
            {#if importantInfo.isIncreasing}
              <p>
                You will be upgraded to {importantInfo.newSeats} seats and be charged
                <span class="font-bold text-primary"
                  >${Math.ceil(importantInfo.immediateCharge)}
                  {importantInfo.currency}</span
                >
              </p>
              <p class="text-sm text-base-content/70">
                This fee covers the additional seat{importantInfo.newSeats -
                  importantInfo.currentSeats >
                1
                  ? "s"
                  : ""} for {importantInfo.daysUntilAnchor} days.
              </p>
            {:else}
              <p class="text-lg">
                Continued access to your <span class="font-bold"
                  >{importantInfo.currentSeats}</span
                >
                seats for {importantInfo.daysUntilAnchor} more days
              </p>
              <p class="text-sm text-base-content/70">
                No charges will be applied for reducing seats.
              </p>
            {/if}
          </div>
          <div class="rounded-lg bg-base-200 p-4">
            <h4 class="mb-2 font-semibold">Future Billing:</h4>
            <p>
              On <span class="font-semibold">{importantInfo.anchorDate}</span>,
              your new {importantInfo.billingCycle} subscription cost will be
              <span class="font-bold text-primary"
                >${Math.ceil(importantInfo.futureCost)}
                {importantInfo.currency}</span
              >.
            </p>
            <p class="text-sm text-base-content/70">
              This will be your new {importantInfo.billingCycle} rate unless further
              changes are made.
            </p>
          </div>
        </div>
      {:else}
        <p class="py-4 text-error">
          Unable to load preview information. Please try again.
        </p>
      {/if}
      <div class="modal-action mt-6">
        {#if importantInfo}
          <form method="POST" action="?/updateSeats" use:enhance>
            <input
              type="hidden"
              name="quantity"
              value={importantInfo.newSeats}
            />
            <button type="submit" class="btn btn-primary" disabled={loading}
              >Confirm Update</button
            >
          </form>
        {/if}
        <button
          class="btn btn-outline"
          on:click={() => (showSeatsModal = false)}>Cancel</button
        >
      </div>
    </div>
  </div>
{/if}
