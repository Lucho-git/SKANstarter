<script lang="ts">
  import { getContext, onMount } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings/settings_module.svelte"
  import PricingModule from "../../../../(marketing)/pricing/pricing_module.svelte"
  import PricePlanBox from "../../../../(marketing)/pricing/PricePlanBox.svelte"
  import PricingFAQ from "../../../../(marketing)/pricing/PricingFAQ.svelte"

  import {
    pricingPlans,
    defaultPlanId,
  } from "../../../../(marketing)/pricing/pricing_plans"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("billing")

  export let data

  let currentPlanId = data.currentPlanId ?? defaultPlanId
  let currentPlanName = pricingPlans.find(
    (x) => x.id === data.currentPlanId,
  )?.name

  onMount(() => {
    // Log messages to the browser's console
    data.logMessages.forEach((message) => {
      console.log(message)
    })
  })
</script>

<svelte:head>
  <title>Billing</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6 text-center">
  {data.isActiveCustomer ? "Billing" : "Select a Plan"}
</h1>

{#if !data.isActiveCustomer}
  <div class="mt-12 flex flex-col lg:flex-row gap-10 justify-center flex-wrap">
    {#each pricingPlans as plan}
      <PricePlanBox
        {plan}
        isCurrentPlan={plan.id === currentPlanId}
        isHighlighted={plan.id === currentPlanId}
        callToAction="Sold Out"
        isDisabled={plan.id === "enterprise" || plan.id === "pro"}
      />
    {/each}
  </div>

  <PricingFAQ />

  {#if data.hasEverHadSubscription}
    <div class="mt-10">
      <a href="/account/billing/manage" class="link">View past invoices</a>
    </div>
  {/if}
{:else}
  <SettingsModule
    title="Subscription"
    editable={false}
    fields={[
      {
        id: "plan",
        label: "Current Plan",
        initialValue: currentPlanName || "",
      },
    ]}
    editButtonTitle="Manage Subscripton"
    editLink="/account/billing/manage"
  />
{/if}
