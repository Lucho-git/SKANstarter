<script lang="ts">
  import { getContext, onMount } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings/settings_module.svelte"
  import PricingFAQ from "../../../../(marketing)/pricing/PricingFAQ.svelte"
  import PricingPlans from "../../../../../components/PricingPlans.svelte"
  import AlertBanner from "../../../../../components/AlertBanner.svelte"

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

<h1 class="mb-6 text-center text-2xl font-bold">
  {data.isActiveCustomer ? "Billing" : "Select a Plan"}
</h1>

{#if !data.isActiveCustomer}
  <PricingPlans {currentPlanId} />

  <AlertBanner
    title="Limited Time Offer: Launch Week Sale!"
    description="Enjoy special pricing for the next 7 days during our launch week. This is the best price we will ever offer, don't miss out! Deal Ends Tuesday."
  />
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
        id: "planName",
        label: "Current Plan",
        initialValue:
          data.subscriptionData?.appSubscription?.name ?? "Free Plan",
      },
      {
        id: "planStatus",
        label: "Status",
        initialValue:
          data.subscriptionData?.stripeSubscription?.status ?? "N/A",
      },
      {
        id: "quantity",
        label: "Quantity",
        initialValue:
          data.subscriptionData?.stripeSubscription?.quantity?.toString() ??
          "1",
      },
      ...(data.subscriptionData?.stripeSubscription?.plan?.interval
        ? [
            {
              id: "interval",
              label: "Billing Interval",
              initialValue:
                data.subscriptionData.stripeSubscription.plan.interval ===
                "year"
                  ? "Annually"
                  : "Monthly",
            },
          ]
        : []),
      {
        id: "nextBilling",
        label: "Next Billing Date",
        initialValue: data.subscriptionData?.stripeSubscription
          ?.current_period_end
          ? new Date(
              data.subscriptionData.stripeSubscription.current_period_end *
                1000,
            ).toLocaleDateString()
          : "N/A",
      },
    ]}
    editButtonTitle="Manage Subscription"
    editLink="/account/billing/manage"
  />
{/if}
