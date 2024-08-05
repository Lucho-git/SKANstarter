<script lang="ts">
  import { getContext, onMount } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings/settings_module.svelte"
  import PricingFAQ from "../../../../(marketing)/pricing/PricingFAQ.svelte"
  import PricingPlans from "../../../../../components/PricingPlans.svelte"

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
  <PricingPlans {currentPlanId} />

  <div class="w-full max-w-4xl mx-auto mb-6">
    <div
      class="alert bg-gradient-to-r from-secondary to-accent text-secondary-content"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-current shrink-0 w-6 h-6"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path></svg
      >
      <div>
        <h3 class="font-bold">Limited Time Offer: Launch Week Sale!</h3>
        <div class="text-sm">
          Enjoy special pricing for the next 7 days during our launch week. This
          is the best price we will ever offer, don't miss out! Deal Ends
          Tuesday.
        </div>
      </div>
    </div>
  </div>
  <!-- <PricingFAQ /> -->

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
