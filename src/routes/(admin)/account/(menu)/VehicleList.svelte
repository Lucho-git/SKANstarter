<script lang="ts">
  import { onMount } from "svelte"
  import * as Avatar from "$lib/components/ui/avatar"
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { toast } from "svelte-sonner"
  import VehicleIcons from "../../../../components/SVG/index.js"
  import * as Tabs from "$lib/components/ui/tabs"
  import { page } from "$app/stores"

  export let vehicles: Array<{
    full_name: string
    user_id: string
    last_update: string
    vehicle_marker: {
      type: string
      color: string
      size: string
    }
  }> | null = null

  export let isOwner: boolean

  let loading = true
  let activeTab = "navigate"

  $: currentUserId = $page.data.session?.user.id

  $: buttonClass = activeTab === "manage" ? "btn-error" : "btn-primary"
  $: buttonText = activeTab === "manage" ? "Kick" : "Go to"

  $: sortedVehicles =
    vehicles?.sort((a, b) => {
      if (a.user_id === currentUserId) return -1
      if (b.user_id === currentUserId) return 1
      return (
        new Date(b.last_update).getTime() - new Date(a.last_update).getTime()
      )
    }) || []

  onMount(() => {
    loading = false
  })

  function getTimeSinceLastUpdate(lastUpdate: string) {
    const now = new Date()
    const updateTime = new Date(lastUpdate)
    const diffInSeconds = Math.floor(
      (now.getTime() - updateTime.getTime()) / 1000,
    )

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  function getVehicleIcon(type: string) {
    return VehicleIcons[type] || VehicleIcons.SimpleTractor
  }

  function handleButtonClick() {
    toast.info("Coming soon", {
      description: "This feature is not yet implemented.",
    })
    console.log("Button clicked", currentUserId, vehicles)
  }
</script>

<div class="mt-4 rounded-lg bg-base-200 p-4 shadow-lg" style="z-index: 0;">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-2xl font-bold">Active Vehicles</h3>
    <Tabs.Root
      value={activeTab}
      onValueChange={(value) => (activeTab = value)}
      class="rounded-lg bg-gray-100 p-1 shadow-inner"
    >
      <Tabs.List class="flex">
        <Tabs.Trigger
          value="navigate"
          class="rounded-md px-4 py-2 text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
        >
          Navigate
        </Tabs.Trigger>
        <Tabs.Trigger
          value="manage"
          class="rounded-md px-4 py-2 text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
        >
          Manage
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  </div>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
    {#each sortedVehicles as vehicle}
      <div
        class="flex items-center rounded-lg bg-base-100 p-4 shadow-md {vehicle.user_id ===
        currentUserId
          ? 'border-2 border-primary'
          : ''}"
      >
        <div
          class="mr-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted"
        >
          <svelte:component
            this={getVehicleIcon(vehicle.vehicle_marker.type)}
            color={vehicle.vehicle_marker.color}
            size="80%"
          />
        </div>
        <div>
          <h4 class="font-bold">{vehicle.full_name}</h4>
          <p class="text-sm opacity-70">
            Last update: {getTimeSinceLastUpdate(vehicle.last_update)}
          </p>
        </div>
        {#if activeTab === "manage"}
          <button
            class="btn {vehicle.user_id === currentUserId
              ? 'btn-warning'
              : buttonClass} btn-sm ml-auto"
            disabled={!isOwner && vehicle.user_id !== currentUserId}
            on:click={handleButtonClick}
          >
            {vehicle.user_id === currentUserId ? "Leave" : buttonText}
          </button>
        {:else}
          <button
            class="btn {buttonClass} btn-sm ml-auto"
            on:click={handleButtonClick}
          >
            {buttonText}
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
