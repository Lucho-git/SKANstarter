<script lang="ts">
  import { enhance } from "$app/forms"
  import SettingsModule from "../../settings/settings_module.svelte"
  import ManageSeats from "./ManageSeats.svelte"
  import ChangeBillingInterval from "./ChangeBillingInterval.svelte"
  import CancelSubscription from "./CancelSubscription.svelte"

  export let data
  let { subscriptionData } = data
  //   console.log(data)

  $: interval = subscriptionData.stripeSubscription.plan.interval
  $: isYearly = interval === "year"
</script>

<svelte:head>
  <title>Manage Billing</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold">Manage Billing</h1>
<div class="alert alert-info mb-4 mt-2 w-4/5">
  <div>
    <h3 class="font-bold">
      Pricing Section is new, Contact us to handle it directly
    </h3>
    <div class="text-sm">
      If their are any issues or the pricing details seems wrong, please contact
      us at 0439405248, or send a message in the chat. We'll be happy to assist
      you.
    </div>
  </div>
</div>
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
      id: "quantity",
      label: "Quantity",
      initialValue:
        data.subscriptionData?.stripeSubscription?.quantity?.toString() ?? "1",
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
<!-- <ChangeBillingInterval {subscriptionData} /> -->
<CancelSubscription {subscriptionData} />
