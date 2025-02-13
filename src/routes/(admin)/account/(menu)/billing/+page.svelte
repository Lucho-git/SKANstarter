<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings/settings_module.svelte"
  import PricingSection from "$lib/components/PricingSection.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("billing")

  export let data

  let currentPlanId = data.currentPlanId ?? "free"
  let currentPlanName =
    data.subscriptionData?.appSubscription?.name ?? "Free Plan"
</script>

<svelte:head>
  <title>Billing</title>
</svelte:head>

{#if !data.isActiveCustomer}
  <div class="container mx-auto px-4">
    <div class="py-2">
      <h1 class="mb-4 text-center text-4xl font-bold">Select a Plan</h1>
      <PricingSection {currentPlanId} />
    </div>

    {#if data.hasEverHadSubscription}
      <div class="mt-10">
        <a href="/account/billing/manage" class="link">View past invoices</a>
      </div>
    {/if}
  </div>
{:else}
  <div class="container mx-auto px-4">
    <h1 class="mb-6 text-center text-2xl font-bold">Billing</h1>

    <SettingsModule
      title="Subscription"
      editable={false}
      fields={[
        {
          id: "planName",
          label: "Current Plan",
          initialValue: currentPlanName,
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
  </div>
{/if}
