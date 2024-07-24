<!-- PricePlanBox.svelte -->
<script lang="ts">
  import { writable } from "svelte/store"

  export let plan: any
  export let billingPeriod: "daily" | "yearly"
  export let isCurrentPlan: boolean
  export let callToAction: string
  export let isDisabled: boolean
  export let useFullPrice: boolean

  const seats = writable(1)

  $: basePrice = plan.price[billingPeriod].discounted
    ? parseFloat(plan.price[billingPeriod].discounted.replace("$", ""))
    : parseFloat(plan.price[billingPeriod].replace("$", ""))

  $: originalPrice = plan.price[billingPeriod].original
    ? parseFloat(plan.price[billingPeriod].original.replace("$", ""))
    : basePrice

  $: totalPrice = (basePrice * $seats).toFixed(
    billingPeriod === "yearly" ? 0 : 2,
  )
  $: totalOriginalPrice = (originalPrice * $seats).toFixed(
    billingPeriod === "yearly" ? 0 : 2,
  )

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
    <div class="text-xl font-bold text-center">{plan.name}</div>
    <p class="mt-2 text-sm text-gray-500 leading-relaxed text-center">
      {plan.description}
    </p>

    <div class="mt-4 text-center">
      <div class="flex items-end justify-center">
        {#if plan.id === "free"}
          <span class="text-4xl font-bold">Free</span>
        {:else if plan.price[billingPeriod].discounted}
          <span class="text-lg text-gray-400 line-through mr-2">
            ${totalOriginalPrice}
          </span>
          <span class="text-4xl font-bold">
            ${totalPrice}
          </span>
        {:else}
          <span class="text-4xl font-bold">${totalPrice}</span>
        {/if}
        <span class="text-gray-400 ml-2 mb-1">
          {typeof plan.priceIntervalName === "string"
            ? plan.priceIntervalName
            : plan.priceIntervalName[billingPeriod]}
        </span>
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
        <span class="mx-4 text-lg font-bold"
          >{$seats} {$seats === 1 ? "seat" : "seats"}</span
        >
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
      {:else}
        <a
          href={isDisabled
            ? "#"
            : `/account/subscribe/${plan?.stripe_price_id ?? "free_plan"}?seats=${$seats}&discount=${!useFullPrice}`}
          class="btn btn-primary w-[80%] mx-auto"
          class:btn-disabled={isDisabled}
        >
          {callToAction}
        </a>
      {/if}
    </div>
  </div>
</div>
