<script lang="ts">
  import { getContext, onMount } from "svelte"
  import type { Writable } from "svelte/store"
  import PricingSection from "$lib/components/PricingSection.svelte"

  export let data

  // Stripe price IDs
  const STRIPE_PRICE_IDS = {
    monthly: "price_1PkkO8K3At0l0k1HqvxEEBw2",
    yearly: {
      full: "price_1PdxlVK3At0l0k1HoEgkFynm",
      discount: "price_1PdxlUK3At0l0k1Hu6tlYnHe",
    },
  }

  // Custom feature lists for SKAN
  const freePlanFeatures = [
    "Join other maps with unlimited resources",
    "1 Map Creation",
    "100 active pin drops",
    "100,000 Trail tokens",
    "Real time location updates",
  ]

  const proPlanFeatures = [
    "Invite others to share your map",
    "Customizable number of seats",
    "Unlimited map creation",
    "Unlimited pin drops",
    "Unlimited Trail credits",
    "All vehicles unlocked",
  ]

  let currentPlanId = data.currentPlanId ?? "free"
  let currentPlanName =
    data.subscriptionData?.appSubscription?.name ?? "Free Plan"

  const additionalDiscountActive = false // For promotional periods

  onMount(() => {
    // Log messages to the browser's console
    data.logMessages?.forEach((message) => {
      console.log(message)
    })
  })
</script>

<svelte:head>
  <title>Billing</title>
</svelte:head>

<div class="container mx-auto px-4">
  <div class="py-2">
    <h1 class="mb-4 text-center text-4xl font-bold">Select a Plan</h1>

    <PricingSection
      freePlanName="AgSKAN Free"
      freePlanDescription="Join an existing map as an operator, or test out our features free"
      proPlanName="AgSKAN Pro"
      proPlanDescription="Invite other users to your map, completely adjustable # of seats"
      {freePlanFeatures}
      {proPlanFeatures}
      currentPlanId="none"
      stripePriceIds={STRIPE_PRICE_IDS}
      useFullPrice={true}
      {additionalDiscountActive}
    />
  </div>

  {#if additionalDiscountActive}
    <div class="mt-8 text-center">
      <div
        class="inline-block rounded-lg bg-secondary/10 px-4 py-2 text-secondary-content"
      >
        <span class="font-semibold">Limited Time Offer:</span>
        Get an additional 50% off annual plans!
      </div>
    </div>
  {/if}
</div>
