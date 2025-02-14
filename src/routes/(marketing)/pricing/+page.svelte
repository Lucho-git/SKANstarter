<script lang="ts">
  import PricingSection from "$lib/components/PricingSection.svelte"
  export let currentPlanId: string | null = null
</script>

<div class="container mx-auto px-4">
  <div class="py-16">
    <h1 class="mb-4 text-center text-4xl font-bold">Price Plans</h1>
    <p class="mb-8 text-center text-lg text-base-content/80">
      Start for free, upgrade when you're ready
    </p>

    <PricingSection
      {currentPlanId}
      defaultInterval="monthly"
      ignoreUrlParams={true}
    />
  </div>
</div>
