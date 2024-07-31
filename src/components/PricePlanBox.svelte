<!-- PricePlanBox.svelte -->
<script lang="ts">
  import { writable } from "svelte/store"

  export let plan: any
  export let billingPeriod: "monthly" | "yearly"
  export let isCurrentPlan: boolean
  export let callToAction: string
  export let isDisabled: boolean
  export let useFullPrice: boolean
  export let annualDiscount: number

  const seats = writable(1)

  $: basePrice =
    typeof plan.price[billingPeriod] === "object"
      ? parseFloat(plan.price[billingPeriod].discounted.replace("$", ""))
      : parseFloat(plan.price[billingPeriod].replace("$", ""))

  $: originalPrice =
    typeof plan.price[billingPeriod] === "object"
      ? parseFloat(plan.price[billingPeriod].original.replace("$", ""))
      : basePrice

  $: hasDiscount =
    typeof plan.price[billingPeriod] === "object" &&
    plan.price[billingPeriod].discounted

  $: totalPrice = Math.round(basePrice * $seats).toString()
  $: totalOriginalPrice = Math.round(originalPrice * $seats).toString()

  function incrementSeats() {
    seats.update((n) => n + 1)
  }

  function decrementSeats() {
    seats.update((n) => (n > 1 ? n - 1 : 1))
  }
</script>

<div
  class="flex-none card card-bordered text-black shadow-xl flex-1 flex-grow min-w-[260px] max-w-[310px] p-6 {plan.style}"
>
  <div class="flex flex-col h-full">
    <div class="text-xl font-bold text-center flex items-center justify-center">
      {plan.name}
      {#if hasDiscount && billingPeriod === "yearly"}
        <div class="badge badge-primary ml-2">Save {annualDiscount}%</div>
      {/if}
    </div>
    <p class="mt-2 text-sm text-gray-500 leading-relaxed text-center">
      {plan.description}
    </p>

    <div class="mt-4 text-center">
      <div class="flex items-end justify-center">
        {#if plan.id === "free"}
          <span class="text-4xl font-bold">Free</span>
          <div class="flex flex-col ml-2 mb-1 text-xs text-gray-400">
            <span>no credit card</span>
            <span>required</span>
          </div>
        {:else if hasDiscount}
          <span class="text-lg text-gray-400 line-through mr-2">
            ${totalOriginalPrice}
          </span>
          <span class="text-4xl font-bold">
            ${totalPrice}
          </span>
          <div class="flex flex-col ml-2 mb-1 text-xs text-gray-500">
            <span>per month</span>
            <span
              >billed {billingPeriod === "monthly"
                ? "monthly"
                : "annually"}</span
            >
          </div>
        {:else}
          <span class="text-4xl font-bold">${totalPrice}</span>
          <div class="flex flex-col ml-2 mb-1 text-xs text-gray-500">
            <span>per month</span>
            <span
              >billed {billingPeriod === "monthly"
                ? "monthly"
                : "annually"}</span
            >
          </div>
        {/if}
      </div>
    </div>

    {#if plan.id !== "free"}
      <div class="flex items-center justify-center mt-4">
        <button
          class="btn btn-sm btn-outline bg-gradient-to-r from-secondary to-accent text-secondary-content hover:from-secondary-focus hover:to-accent-focus"
          on:click={decrementSeats}
          disabled={$seats === 1}
        >
          -
        </button>
        <span class="mx-4 text-lg font-bold">
          {$seats}
          {$seats === 1 ? "seat" : "seats"}
        </span>
        <button
          class="btn btn-sm btn-outline bg-gradient-to-r from-secondary to-accent text-secondary-content hover:from-secondary-focus hover:to-accent-focus"
          on:click={incrementSeats}
        >
          +
        </button>
      </div>
    {/if}

    <div class="my-4 border-t-2 border-gray-300 dark:border-gray-400"></div>

    <div class="text-sm text-gray-600 text-left">
      Plan Includes:
      <ul class="list-disc list-inside mt-2 space-y-1">
        {#each plan.features as feature}
          <li>{feature}</li>
        {/each}
      </ul>
    </div>

    <div class="mt-6 pt-4 flex-1 flex flex-row items-center">
      {#if isCurrentPlan}
        <div
          class="btn btn-outline btn-success no-animation w-[80%] mx-auto cursor-default"
        >
          Current Plan
        </div>
      {:else if plan.id === "free"}
        <a
          href="/account/subscribe/free_plan"
          class="btn btn-primary w-[80%] mx-auto"
        >
          {callToAction}
        </a>
      {:else}
        <a
          href={`/account/subscribe/${plan.stripe_price_id}?seats=${$seats}&discount=${!useFullPrice}`}
          class="btn btn-outline w-[80%] mx-auto bg-gradient-to-r from-secondary to-accent text-secondary-content hover:from-secondary-focus hover:to-accent-focus"
        >
          {callToAction}
        </a>
      {/if}
    </div>
  </div>
</div>
