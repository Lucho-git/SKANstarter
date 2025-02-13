<script lang="ts">
  import PricingSection from "$lib/components/PricingSection.svelte"

  export let data

  let currentPlanId = data.currentPlanId ?? "free"
</script>

<svelte:head>
  <title>Billing</title>
</svelte:head>

<div class="container mx-auto px-4">
  <div class="py-2">
    <h1 class="mb-4 text-center text-4xl font-bold">Select a Plan</h1>
    <PricingSection currentPlanId="none" useFullPrice={true} />
  </div>
</div>
