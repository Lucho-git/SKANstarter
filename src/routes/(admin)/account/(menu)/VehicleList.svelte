<script lang="ts">
  import { onMount } from "svelte"
  import * as Avatar from "$lib/components/ui/avatar"
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { toast } from "svelte-sonner"
  import VehicleIcons from "../../../../components/SVG/index.js"
  import * as Tabs from "$lib/components/ui/tabs"
  import { page } from "$app/stores"
  import { enhance } from "$app/forms"
  import { profileStore } from "../../../../stores/profileStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { mapActivityStore } from "../../../../stores/mapActivityStore"

  let loading = true
  let activeTab = "navigate"

  $: currentUserId = $profileStore.id
  $: isOwner = $connectedMapStore.is_current_user_owner

  $: buttonClass = activeTab === "manage" ? "btn-error" : "btn-primary"
  $: buttonText = activeTab === "manage" ? "Kick" : "Locate"

  $: sortedProfiles = $mapActivityStore.connected_profiles.sort((a, b) => {
    if (a.id === currentUserId) return -1
    if (b.id === currentUserId) return 1
    const aVehicle = $mapActivityStore.vehicle_states.find(
      (v) => v.vehicle_id === a.id,
    )
    const bVehicle = $mapActivityStore.vehicle_states.find(
      (v) => v.vehicle_id === b.id,
    )
    if (aVehicle && !bVehicle) return -1
    if (!aVehicle && bVehicle) return 1
    if (aVehicle && bVehicle) {
      return (
        new Date(bVehicle.last_update).getTime() -
        new Date(aVehicle.last_update).getTime()
      )
    }
    return 0
  })

  onMount(() => {
    loading = false
    console.log("mapActivityStore", $mapActivityStore)
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

  function handleButtonClick(action: string, profileName: string) {
    let message = ""
    let description = ""

    switch (action) {
      case "Locate":
        message = "Locating vehicle"
        description = `Attempting to locate ${profileName}`
        break
      case "Leave":
        message = "Leaving map"
        description = "Preparing to disconnect from the current map"
        break
      case "Kick":
        message = "Kicking user"
        description = `Attempting to remove ${profileName} from the map`
        break
      case "Connect":
        message = "Connecting vehicle"
        description = `Attempting to connect vehicle for ${profileName}`
        break
    }

    toast.info(message, {
      description: description + " (Feature not yet implemented)",
    })
    console.log(
      "Button clicked",
      action,
      profileName,
      currentUserId,
      $mapActivityStore,
    )
  }
</script>

<div class="mt-4 rounded-lg bg-base-200 p-4 shadow-lg" style="z-index: 0;">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-2xl font-bold">Active Users</h3>
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
    {#each sortedProfiles as profile}
      {@const vehicle = $mapActivityStore.vehicle_states.find(
        (v) => v.vehicle_id === profile.id,
      )}
      <div
        class="flex items-center rounded-lg bg-base-100 p-4 shadow-md {profile.id ===
        currentUserId
          ? 'border-2 border-primary'
          : ''}"
      >
        <div
          class="mr-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted"
        >
          {#if vehicle}
            <svelte:component
              this={getVehicleIcon(vehicle.vehicle_marker.type)}
              color={vehicle.vehicle_marker.color}
              size="80%"
            />
          {:else}
            <ion-icon name="add-circle" style="font-size: 2rem;"></ion-icon>
          {/if}
        </div>
        <div>
          <h4 class="font-bold">{profile.full_name}</h4>
          {#if vehicle}
            <p class="text-sm opacity-70">
              Last update: {getTimeSinceLastUpdate(vehicle.last_update)}
            </p>
          {:else}
            <p class="text-sm opacity-70">No vehicle connected</p>
          {/if}
        </div>
        {#if activeTab === "manage"}
          <button
            class="btn {profile.id === currentUserId
              ? 'btn-warning'
              : buttonClass} btn-sm ml-auto"
            disabled={!isOwner && profile.id !== currentUserId}
            on:click={() =>
              handleButtonClick(
                profile.id === currentUserId ? "Leave" : "Kick",
                profile.full_name,
              )}
          >
            {profile.id === currentUserId ? "Leave" : buttonText}
          </button>
        {:else}
          <button
            class="btn {buttonClass} btn-sm ml-auto"
            class:btn-info={!vehicle}
            on:click={() =>
              handleButtonClick(
                vehicle ? "Locate" : "Connect",
                profile.full_name,
              )}
          >
            {vehicle ? "Locate" : "Connect"}
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
