<script lang="ts">
  import { getContext, onMount } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings/settings_module.svelte"
  import PricingSection from "$lib/components/PricingSection.svelte"

  // Get admin section context
  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("billing")

  export let data

  // Stripe price IDs
  const STRIPE_PRICE_IDS = {
    monthly: "price_1PkkO8K3At0l0k1HqvxEEBw2",
    yearly: {
      full: "price_1PdxlVK3At0l0k1HoEgkFynm",
      discount: "price_1PdxlUK3At0l0k1Hu6tlYnHe",
    },
  }

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

  let currentPlanId = data.currentPlanId ?? "free"
  let currentPlanName =
    data.subscriptionData?.appSubscription?.name ?? "Free Plan"

  const additionalDiscountActive = false // For promotional periods

  onMount(() => {
    // Log messages to the browser's console
    data.logMessages?.forEach((message) => {
      console.log(message)
    })
  })
</script>

<svelte:head>
  <title>Billing</title>
</svelte:head>

{#if !data.isActiveCustomer}
  <div class="container mx-auto px-4">
    <div class="py-2">
      <h1 class="mb-4 text-center text-4xl font-bold">Select a Plan</h1>

      <PricingSection
        freePlanName="🚜 SKAN Member"
        freePlanDescription="Join an existing map as an operator, or test out our features free"
        proPlanName="⭐ SKAN Founder"
        proPlanDescription="Invite other users to your map, completely adjustable # of seats"
        {freePlanFeatures}
        {proPlanFeatures}
        {currentPlanId}
        stripePriceIds={STRIPE_PRICE_IDS}
        useFullPrice={true}
        {additionalDiscountActive}
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
