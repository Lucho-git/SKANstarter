<script lang="ts">
  import { PUBLIC_SITE_NAME } from "$env/static/public"
  import PricePlanBox from "../../../components/PricePlanBox.svelte"
  import PricingFAQ from "./PricingFAQ.svelte"
  import PricingPlans from "../../../components/PricingPlans.svelte"

  let currentPlanId = ""
</script>

<svelte:head>
  <title>Pricing</title>
  <meta name="description" content="Pricing details for {PUBLIC_SITE_NAME}" />
</svelte:head>

<div class="min-h-[70vh] pb-8 pt-[5vh] px-4">
  <h1 class="text-3xl font-bold text-center">Pricing</h1>
  <h2 class="text-xl text-center text-slate-500 mt-1 pb-3">
    Get started totally free
  </h2>

  <PricingPlans {currentPlanId} />

  <!-- <PricingFAQ /> -->
</div>
