<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "./settings_module.svelte"
  import { PUBLIC_APP_VERSION } from "$env/static/public"

  import FloatingChat from "../../../../../components/FloatingChat.svelte"
  import EdgeFunction from "../../../../../components/EdgeFunction.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  export let data
  let { session, profile, subscriptionData } = data
  const APP_VERSION = PUBLIC_APP_VERSION || "unknown"
</script>

<svelte:head>
  <title>Settings</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold">Settings</h1>

<SettingsModule
  title="Profile"
  editable={false}
  fields={[
    { id: "fullName", label: "Name", initialValue: profile?.full_name ?? "" },
    {
      id: "companyName",
      label: "Company Name",
      initialValue: profile?.company_name ?? "",
    },
    {
      id: "website",
      label: "Company Website",
      initialValue: profile?.website ?? "",
    },
  ]}
  editButtonTitle="Edit Profile"
  editLink="/account/settings/edit_profile"
/>

<SettingsModule
  title="Email"
  editable={false}
  fields={[{ id: "email", initialValue: session?.user?.email || "" }]}
  editButtonTitle="Change Email"
  editLink="/account/settings/change_email"
/>

<SettingsModule
  title="Password"
  editable={false}
  fields={[{ id: "password", initialValue: "••••••••••••••••" }]}
  editButtonTitle="Change Password"
  editLink="/account/settings/change_password"
/>

<SettingsModule
  title="Subscription"
  editable={false}
  fields={[
    {
      id: "planName",
      label: "Current Plan",
      initialValue: data.subscriptionData?.appSubscription?.name ?? "Free Plan",
    },
    {
      id: "planStatus",
      label: "Status",
      initialValue: data.subscriptionData?.stripeSubscription?.status ?? "N/A",
    },
    {
      id: "quantity",
      label: "Quantity",
      initialValue:
        data.subscriptionData?.stripeSubscription?.quantity?.toString() ?? "1",
    },
    ...(data.subscriptionData?.stripeSubscription?.plan?.interval
      ? [
          {
            id: "interval",
            label: "Billing Interval",
            initialValue:
              data.subscriptionData.stripeSubscription.plan.interval === "year"
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
            data.subscriptionData.stripeSubscription.current_period_end * 1000,
          ).toLocaleDateString()
        : "N/A",
    },
  ]}
  editButtonTitle="Manage Subscription"
  editLink="/account/billing/manage"
/>

<SettingsModule
  title="App Version"
  editable={false}
  dangerous={true}
  fields={[{ id: "version", initialValue: APP_VERSION }]}
  editButtonTitle="Delete Account"
  editLink="/account/settings/delete_account"
/>

<FloatingChat />
<!-- <EdgeFunction /> -->
