<script lang="ts">
  import PricePlanBox from "../../../../components/PricePlanBox.svelte"
  import PricingFAQ from "../../../(marketing)/pricing/PricingFAQ.svelte"
  import PricingPlans from "../../../../components/PricingPlans.svelte"

  let currentPlanId = ""
</script>

<svelte:head>
  <title>Select a Plan</title>
</svelte:head>

<div
  class="text-center content-center mb-12 mt-4 flex items-center place-content-center"
>
  <div class="flex flex-col w-full px-6">
    <div>
      <h1 class="text-2xl font-bold mb-6">Select a Plan</h1>
      <div
        class="mt-0 flex flex-col lg:flex-row gap-10 justify-center flex-wrap"
      >
        <PricingPlans {currentPlanId} />
      </div>
    </div>
  </div>
</div>

<PricingFAQ />
