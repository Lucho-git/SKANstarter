<script lang="ts">
  import PricingSection from "$lib/components/PricingSection.svelte"

  export let currentPlanId: string | null = null

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

  // For the promotion banner (if needed)
  const additionalDiscountActive = false
</script>

<!-- Main pricing section -->
<div class="container mx-auto px-4">
  <div class="py-16">
    <h1 class="mb-4 text-center text-4xl font-bold">Price Plans</h1>
    <p class="mb-8 text-center text-lg text-base-content/80">
      Start for free, upgrade when you're ready
    </p>

    <PricingSection
      freePlanName="AgSKAN Free"
      freePlanDescription="Join an existing map as an operator"
      proPlanName="AgSKAN Pro"
      proPlanDescription="Share your map"
      {currentPlanId}
      stripePriceIds={{
        monthly: "price_1PkkO8K3At0l0k1HqvxEEBw2",
        yearly: {
          full: "price_1PdxlVK3At0l0k1HoEgkFynm",
          discount: "price_1PdxlUK3At0l0k1Hu6tlYnHe",
        },
      }}
      useFullPrice={true}
      additionalDiscountActive={false}
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
