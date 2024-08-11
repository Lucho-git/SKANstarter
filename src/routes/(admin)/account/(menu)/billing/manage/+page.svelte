<script lang="ts">
  import { enhance } from "$app/forms"
  import SettingsModule from "../../settings/settings_module.svelte"
  import ManageSeats from "./ManageSeats.svelte"
  import ChangeBillingInterval from "./ChangeBillingInterval.svelte"
  import CancelSubscription from "./CancelSubscription.svelte"

  export let data
  let { subscriptionData } = data
  console.log(data)

  $: interval = subscriptionData.stripeSubscription.plan.interval
  $: isYearly = interval === "year"
</script>

<svelte:head>
  <title>Manage Billing</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold">Manage Billing</h1>

<SettingsModule
  title="Current Subscription"
  editable={false}
  fields={[
    {
      id: "planName",
      label: "Current Plan",
      initialValue: subscriptionData.appSubscription.name,
    },
    {
      id: "planStatus",
      label: "Status",
      initialValue: subscriptionData.stripeSubscription.status,
    },
    {
      id: "interval",
      label: "Billing Interval",
      initialValue: isYearly ? "Yearly" : "Monthly",
    },
    {
      id: "nextBilling",
      label: "Next Billing Date",
      initialValue: new Date(
        subscriptionData.stripeSubscription.current_period_end * 1000,
      ).toLocaleDateString(),
    },
  ]}
  editButtonTitle="Home"
  editLink="/account"
/>

<ManageSeats {data} />
<ChangeBillingInterval {subscriptionData} />
<CancelSubscription {subscriptionData} />
