<script lang="ts">
  import { PUBLIC_SITE_NAME } from "$env/static/public"
  import PricePlanBox from "../../../../components/PricePlanBox.svelte"
  import PricingFAQ from "./PricingFAQ.svelte"
  import PricingPlans from "../../../../components/PricingPlans.svelte"

  let currentPlanId = ""
</script>

<svelte:head>
  <title>Pricing</title>
  <meta name="description" content="Pricing details for {PUBLIC_SITE_NAME}" />
</svelte:head>

<div class="min-h-[70vh] px-4 pb-8 pt-[5vh]">
  <h1 class="text-center text-3xl font-bold">Pricing</h1>
  <h2 class="mt-1 pb-3 text-center text-xl text-slate-500">
    Get started totally free
  </h2>

  <PricingPlans {currentPlanId} />

  <!-- <PricingFAQ /> -->
</div>
