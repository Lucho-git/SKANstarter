<script lang="ts">
  import { enhance } from "$app/forms"
  import SettingsModule from "../../settings/settings_module.svelte"
  import { Skeleton } from "$lib/components/ui/skeleton"

  export let data
  let { subscriptionData } = data
  let quantity = subscriptionData.stripeSubscription.quantity || 1
  let showSeatsModal = false
  let showBillingCycleModal = false
  let showCancelModal = false
  let loading = false
  let modalContent = null

  $: interval = subscriptionData.stripeSubscription.plan.interval
  $: isYearly = interval === "year"

  function incrementSeats() {
    quantity += 1
  }

  function decrementSeats() {
    if (quantity > 1) quantity -= 1
  }

  async function openSeatsModal() {
    showSeatsModal = true
    loading = true
    modalContent = null

    let formData = new FormData()
    formData.append("quantity", quantity.toString())
    formData.append("appliedDate", "later")

    const response = await fetch("?/getProratedChangePreview", {
      method: "POST",
      body: formData,
    })
    const result = await response.json()
    loading = false
    modalContent = result.data
  }

  function openBillingCycleModal() {
    showBillingCycleModal = true
  }

  function openCancelModal() {
    showCancelModal = true
  }
</script>

<svelte:head>
  <title>Manage Billing</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold">Manage Billing</h1>

<SettingsModule
  title="Current Subscription"
  editable={false}
  fields={[
    {
      id: "planName",
      label: "Current Plan",
      initialValue: subscriptionData.appSubscription.name,
    },
    {
      id: "planStatus",
      label: "Status",
      initialValue: subscriptionData.stripeSubscription.status,
    },
    {
      id: "interval",
      label: "Billing Interval",
      initialValue: isYearly ? "Yearly" : "Monthly",
    },
    {
      id: "nextBilling",
      label: "Next Billing Date",
      initialValue: new Date(
        subscriptionData.stripeSubscription.current_period_end * 1000,
      ).toLocaleDateString(),
    },
  ]}
  editButtonTitle="Home"
  editLink="/account"
/>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">Manage Seats</h2>
  <div class="mb-4 flex items-center justify-center">
    <button
      class="btn btn-outline btn-sm"
      on:click={decrementSeats}
      disabled={quantity === 1}
    >
      -
    </button>
    <span class="mx-4 text-lg font-bold text-black">
      {quantity}
      {quantity === 1 ? "seat" : "seats"}
    </span>
    <button class="btn btn-outline btn-sm" on:click={incrementSeats}>
      +
    </button>
  </div>
  <button
    on:click={openSeatsModal}
    class="btn w-full"
    disabled={quantity === subscriptionData.stripeSubscription.quantity}
  >
    Update Seats
  </button>
</div>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">Change Billing Interval</h2>
  <button on:click={openBillingCycleModal} class="btn btn-secondary w-full">
    Switch to {isYearly ? "Monthly" : "Yearly"} Billing
  </button>
</div>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">Cancel Subscription</h2>
  <button on:click={openCancelModal} class="btn btn-error w-full">
    Cancel Subscription
  </button>
</div>

{#if showSeatsModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirm Seat Update</h3>
      {#if loading}
        <div class="py-4">
          <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
          <Skeleton class="h-[20px] w-3/4 rounded-full" />
        </div>
      {:else if modalContent}
        <p class="py-4">{JSON.stringify(modalContent)}</p>
      {/if}
      <div class="modal-action">
        <form method="POST" action="?/updateSeats" use:enhance>
          <input type="hidden" name="quantity" value={quantity} />
          <button type="submit" class="btn btn-primary" disabled={loading}
            >Confirm</button
          >
        </form>
        <button class="btn" on:click={() => (showSeatsModal = false)}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}

{#if showBillingCycleModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Change Billing Cycle</h3>
      <div class="py-4">
        <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
        <Skeleton class="h-[20px] w-3/4 rounded-full" />
      </div>
      <div class="modal-action">
        <button class="btn" on:click={() => (showBillingCycleModal = false)}
          >Close</button
        >
      </div>
    </div>
  </div>
{/if}

{#if showCancelModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Cancel Subscription</h3>
      <div class="py-4">
        <Skeleton class="mb-2 h-[20px] w-full rounded-full" />
        <Skeleton class="h-[20px] w-3/4 rounded-full" />
      </div>
      <div class="modal-action">
        <button class="btn" on:click={() => (showCancelModal = false)}
          >Close</button
        >
      </div>
    </div>
  </div>
{/if}
