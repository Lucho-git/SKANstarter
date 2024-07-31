<!-- PricingPlans.svelte -->
<script lang="ts">
  import { writable } from "svelte/store"
  import PricePlanBox from "./PricePlanBox.svelte"
  import { slide } from "svelte/transition"

  export let currentPlanId: string | null = null

  const billingPeriod = writable("monthly")
  const useFullPrice = writable(false)
  const discountPriceId = "price_1PdxlUK3At0l0k1Hu6tlYnHe"
  const fullPriceId = "price_1PdxlVK3At0l0k1HoEgkFynm"

  $: stripe_price_id = $useFullPrice ? fullPriceId : discountPriceId

  const pricingPlans = [
    {
      id: "free",
      name: "🚜SKAN Member",
      description:
        "Join an existing map as an operator, or test out our features free",
      price: { monthly: "Free", yearly: "Free" },
      priceIntervalName: "no credit card required",
      stripe_price_id: null,
      features: [
        "Join other maps with unlimited resources",

        "1 Map Creation",
        "100 active pin drops",
        "100 000 Trail tokens",
        "Real time location updates",
      ],
      style: "bg-gray-100 border-gray-200",
    },
    {
      id: "pro",
      name: "⭐ SKAN Owner",
      description:
        "Invite other users to your map, completely adjustable # of seats",
      price: {
        monthly: "$45",
        yearly: { original: "$45", discounted: "$29" },
      },
      priceIntervalName: { monthly: "per month", yearly: "per year" },
      stripe_price_id: "price_1PdxlVK3At0l0k1HoEgkFynm",
      stripe_product_id: "prod_QUxgzq6c3meKyZ",
      features: [
        "Invite others to share your map",
        "Customizable # of seats",
        "Unlimited map creation",
        "Unlimited pin drops",
        "Unlimited Trail credits",
        "All vehicles unlocked",
      ],
      style: "bg-blue-100 border-blue-300",
    },
  ]

  $: annualDiscount = pricingPlans.some(
    (plan) =>
      plan.price.yearly &&
      plan.price.yearly.discounted &&
      plan.price.yearly.original,
  )
    ? Math.round(
        parseFloat(
          pricingPlans[1].price.yearly.original.replace("$", "") /
            parseFloat(
              pricingPlans[1].price.yearly.discounted.replace("$", ""),
            ),
        ) *
          100 -
          100,
      )
    : 0

  function toggleBillingPeriod() {
    billingPeriod.update((current) =>
      current === "monthly" ? "yearly" : "monthly",
    )
  }

  function toggleFullPrice() {
    useFullPrice.update((current) => !current)
    console.log("useFullPrice", stripe_price_id)
  }
</script>

<div class="w-full my-8">
  <!-- <div class="flex justify-center mb-8">
    <label class="label cursor-pointer">
      <span class="label-text mr-2">Support the boys at full price</span>
      <input
        type="checkbox"
        class="checkbox checkbox-primary"
        checked={$useFullPrice}
        on:change={toggleFullPrice}
      />
    </label>
  </div> -->

  <div class="flex justify-center mb-8">
    <button
      type="button"
      class="bg-gray-300 p-1 rounded-full flex items-center cursor-pointer relative"
      on:click={toggleBillingPeriod}
      on:keydown={(e) => e.key === "Enter" && toggleBillingPeriod()}
      aria-label="Toggle billing period"
      role="switch"
      aria-checked={$billingPeriod === "yearly"}
    >
      {#key $billingPeriod}
        <div
          class="absolute bg-primary w-32 h-8 rounded-full"
          style="transform: translateX({$billingPeriod === 'yearly'
            ? '100%'
            : '0'});"
          transition:slide={{ duration: 300 }}
        ></div>
      {/key}
      <span
        class="w-32 h-8 text-sm rounded-full flex items-center justify-center relative z-10"
        class:text-white={$billingPeriod === "monthly"}
      >
        Monthly
      </span>
      <span
        class="w-32 h-8 text-sm rounded-full flex items-center justify-center relative z-10"
        class:text-white={$billingPeriod === "yearly"}
      >
        Annually
        {#if annualDiscount > 0}
          <span class="badge badge-secondary absolute -top-3 -right-4 text-xs">
            Save {annualDiscount}%
          </span>
        {/if}
      </span>
    </button>
  </div>

  <div
    class="mt-12 flex flex-col lg:flex-row gap-10 justify-center items-center flex-wrap"
  >
    {#each pricingPlans as plan}
      <PricePlanBox
        {plan}
        billingPeriod={$billingPeriod}
        isCurrentPlan={plan.id === currentPlanId}
        callToAction={plan.id === "free" ? "Get Started" : "Upgrade"}
        isDisabled={plan.id === "enterprise"}
        useFullPrice={$useFullPrice}
        {annualDiscount}
      />
    {/each}
  </div>
</div>
