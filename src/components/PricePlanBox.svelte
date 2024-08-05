<script lang="ts">
  import { writable } from "svelte/store"

  export let plan: any
  export let billingPeriod: "monthly" | "yearly"
  export let isCurrentPlan: boolean
  export let callToAction: string
  export let useFullPrice: boolean
  export let annualDiscount: number
  export let additionalDiscountActive: boolean

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

  $: displayPrice =
    billingPeriod === "yearly" && plan.price.yearly.discounted
      ? additionalDiscountActive
        ? (basePrice * 0.5).toFixed(2)
        : basePrice.toFixed(2)
      : basePrice.toFixed(2)

  $: totalPrice = (parseFloat(displayPrice) * $seats).toFixed(2)
  $: totalOriginalPrice = (originalPrice * $seats).toFixed(2)

  function incrementSeats() {
    seats.update((n) => n + 1)
  }

  function decrementSeats() {
    seats.update((n) => (n > 1 ? n - 1 : 1))
  }
</script>

<div
  class="flex-none card card-bordered text-black shadow-xl flex-1 flex-grow min-w-[280px] max-w-[340px] p-6 {plan.style}"
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

    <div class="mt-4 mb-2 flex flex-col items-center">
      {#if plan.id !== "free" && billingPeriod === "yearly" && additionalDiscountActive}
        <div class="flex justify-center items-center">
          <div class="badge badge-secondary">Extra 50% OFF</div>
          <a
            href="https://safestyle.com.au/"
            target="_blank"
            rel="noopener noreferrer"
            class="badge badge-accent ml-2 relative text-black"
          >
            $500 SafeStyle raffle
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 absolute top-0 right-0 -mt-1 -mr-1 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
        <div class="badge badge-info mt-2">Founding Member Status</div>
      {/if}
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
