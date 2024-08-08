<script lang="ts">
  import { enhance } from "$app/forms"
  import SettingsModule from "../../settings/settings_module.svelte"

  export let data
  let { subscriptionData } = data
  let quantity = subscriptionData.stripeSubscription.quantity || 1
  let showUpdateSeatsModal = false
  let showChangePlanModal = false
  let showCancelModal = false

  $: interval = subscriptionData.stripeSubscription.plan.interval
  $: isYearly = interval === "year"

  function incrementSeats() {
    quantity += 1
  }

  function decrementSeats() {
    if (quantity > 1) quantity -= 1
  }

  function confirmUpdateSeats() {
    showUpdateSeatsModal = true
  }

  function confirmChangePlan() {
    showChangePlanModal = true
  }

  function confirmCancel() {
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
      class="btn btn-outline btn-sm {quantity <
      subscriptionData.stripeSubscription.quantity
        ? 'text-red-500'
        : ''}"
      on:click={decrementSeats}
      disabled={quantity === 1}
    >
      -
    </button>
    <span class="mx-4 text-lg font-bold text-black">
      {quantity}
      {quantity === 1 ? "seat" : "seats"}
    </span>
    <button
      class="btn btn-outline btn-sm bg-gradient-to-r from-secondary to-accent text-secondary-content hover:from-secondary-focus hover:to-accent-focus"
      on:click={incrementSeats}
    >
      +
    </button>
  </div>
  <button
    on:click={confirmUpdateSeats}
    class="btn w-full {quantity === subscriptionData.stripeSubscription.quantity
      ? 'btn-disabled'
      : quantity < subscriptionData.stripeSubscription.quantity
        ? 'btn-warning btn-outline'
        : 'bg-gradient-to-r from-secondary to-accent text-secondary-content hover:from-secondary-focus hover:to-accent-focus'}"
    disabled={quantity === subscriptionData.stripeSubscription.quantity}
  >
    {#if quantity < subscriptionData.stripeSubscription.quantity}
      Reduce {subscriptionData.stripeSubscription.quantity - quantity} seats
    {:else if quantity > subscriptionData.stripeSubscription.quantity}
      Add {quantity - subscriptionData.stripeSubscription.quantity} seats
    {:else}
      Modify number of seats
    {/if}
  </button>
</div>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">Change Billing Interval</h2>
  <button on:click={confirmChangePlan} class="btn btn-secondary w-full">
    Switch to {isYearly ? "Monthly" : "Yearly"} Billing
  </button>
</div>

<div class="card mt-8 max-w-xl p-6 shadow">
  <h2 class="mb-4 text-xl font-bold">Cancel Subscription</h2>
  <button on:click={confirmCancel} class="btn btn-error w-full"
    >Cancel Subscription</button
  >
</div>

{#if showUpdateSeatsModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirm Seat Update</h3>
      <p class="py-4">
        Are you sure you want to change your seat count to {quantity}?
      </p>
      <div class="modal-action">
        <form method="POST" action="?/updateSeats" use:enhance>
          <input type="hidden" name="quantity" value={quantity} />
          <button type="submit" class="btn btn-primary">Confirm</button>
        </form>
        <button class="btn" on:click={() => (showUpdateSeatsModal = false)}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}

{#if showChangePlanModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirm Billing Interval Change</h3>
      <p class="py-4">
        Are you sure you want to switch to {isYearly ? "Monthly" : "Yearly"} billing?
      </p>
      <div class="modal-action">
        <form method="POST" action="?/changePlan" use:enhance>
          <input
            type="hidden"
            name="interval"
            value={isYearly ? "monthly" : "yearly"}
          />
          <button type="submit" class="btn btn-primary">Confirm</button>
        </form>
        <button class="btn" on:click={() => (showChangePlanModal = false)}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}

{#if showCancelModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirm Subscription Cancellation</h3>
      <p class="py-4">
        Are you sure you want to cancel your subscription? This action cannot be
        undone.
      </p>
      <div class="modal-action">
        <form method="POST" action="?/cancelSubscription" use:enhance>
          <button type="submit" class="btn btn-error"
            >Confirm Cancellation</button
          >
        </form>
        <button class="btn" on:click={() => (showCancelModal = false)}
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}
