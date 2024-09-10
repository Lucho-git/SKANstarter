<script lang="ts">
  import { onMount } from "svelte"
  import * as Avatar from "$lib/components/ui/avatar"
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { toast } from "svelte-sonner"
  import VehicleIcons from "$lib/vehicles/index.js"
  import * as Tabs from "$lib/components/ui/tabs"
  import { page } from "$app/stores"
  import { enhance, applyAction } from "$app/forms"
  import { profileStore } from "../../../../stores/profileStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { mapActivityStore } from "../../../../stores/mapActivityStore"
  import { goto } from "$app/navigation"
  import Icon from "@iconify/svelte"

  let loading = true
  let activeTab = "navigate"

  $: currentUserId = $profileStore.id
  $: is_owner = $connectedMapStore.is_owner
  $: is_user = (profileId) => profileId === currentUserId

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

  function updateStores() {
    console.log("updating stores")
    connectedMapStore.set({
      id: null,
      map_name: null,
      master_user_id: null,
      owner: null,
      is_owner: false,
      masterSubscription: null,
      is_connected: false,
    })
    console.log($connectedMapStore)
    console.log($mapActivityStore)
    console.log($profileStore)
  }

  function kickUser(id: string) {
    mapActivityStore.update((store) => ({
      ...store,
      connected_profiles: store.connected_profiles.filter(
        (profile) => profile.id !== id,
      ),
      vehicle_states: store.vehicle_states.filter(
        (vehicle) => vehicle.vehicle_id !== id,
      ),
    }))
  }

  function handleLocate(profileId: string) {
    console.log("Locate button pressed for profile:", profileId)
    toast.info("Connecting to user", {
      description: "Location feature is not implemented yet",
    })
    goto(`/account/mapviewer?userId=${profileId}`)
  }

  function handleConnect(profileId: string) {
    console.log("Connect button pressed for profile:", profileId)

    goto(`/account/mapviewer?userId=${profileId}`)
  }
</script>

<div class="mt-0 rounded-lg bg-base-200 p-4 shadow-lg" style="z-index: 0;">
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
        class="flex items-center rounded-lg bg-base-100 p-4 shadow-md {is_user(
          profile.id,
        )
          ? 'border-2 border-primary'
          : ''}"
      >
        <div
          class="mr-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted"
        >
          {#if vehicle}
            <svelte:component
              this={getVehicleIcon(vehicle.vehicle_marker.type)}
              bodyColor={vehicle.vehicle_marker.bodyColor}
              size="80%"
            />
          {:else}
            <Icon
              icon="solar:chair-bold"
              width="40"
              height="40"
              style="color: black"
            />
          {/if}
        </div>
        <div class="flex-grow">
          <h4 class="font-bold">{profile.full_name}</h4>
          {#if vehicle}
            <p class="text-sm opacity-70">
              Last update: {getTimeSinceLastUpdate(vehicle.last_update)}
            </p>
          {:else}
            <p class="text-sm opacity-70">Hasn't selected vehicle</p>
          {/if}
        </div>
        {#if activeTab === "manage"}
          {#if is_user(profile.id)}
            <form
              method="POST"
              action="?/disconnectFromMap"
              class="m-auto"
              use:enhance={() => {
                return async ({ result }) => {
                  if (result.type === "success") {
                    updateStores()
                    toast.success("Disconnected from map", {
                      description: "You have successfully left the map",
                    })
                    goto("/account")
                  } else if (result.type === "failure") {
                    toast.error("Failed to disconnect", {
                      description: result.data?.message || "An error occurred",
                    })
                  }
                  await applyAction(result)
                }
              }}
            >
              <button class="btn btn-warning btn-sm" type="submit">
                Leave
              </button>
            </form>
          {:else}
            <form
              method="POST"
              action="?/kickUser"
              class="m-auto"
              use:enhance={() => {
                return async ({ result }) => {
                  if (result.type === "success") {
                    kickUser(profile.id)
                    toast.success("User kicked", {
                      description: `${profile.full_name} has been removed from the map`,
                    })
                  } else if (result.type === "failure") {
                    toast.error("Failed to kick user", {
                      description: result.data?.message || "An error occurred",
                    })
                  }
                  await applyAction(result)
                }
              }}
            >
              <input type="hidden" name="userId" value={profile.id} />
              <button
                class="btn {buttonClass} btn-sm"
                type="submit"
                disabled={!is_owner}
              >
                {buttonText}
              </button>
            </form>
          {/if}
        {:else}
          <button
            class="btn {buttonClass} btn-sm m-auto"
            class:btn-info={!vehicle}
            on:click={() =>
              vehicle ? handleLocate(profile.id) : handleConnect(profile.id)}
            disabled={!vehicle && !is_user(profile.id)}
          >
            {vehicle ? "Locate" : "Connect"}
          </button>
        {/if}
      </div>
    {/each}
    <!-- New invite box -->
    <div class="flex items-center rounded-lg p-4 shadow-md">
      <div
        class="mr-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted"
      >
        <Icon
          icon="solar:user-plus-rounded-bold"
          width="40"
          height="40"
          style="color: black"
        />
      </div>
      <div class="flex-grow">
        <h4 class="font-bold">New User</h4>
      </div>
      <button
        class="btn btn-outline btn-sm m-auto opacity-50"
        on:click={() => {
          // Add invite functionality here
          console.log("Invite button clicked")
          toast.info("Invite feature", {
            description:
              "Invite functionality not implemented yet, send users your Map Id for immediate connection",
          })
        }}
      >
        <Icon icon="gravity-ui:plus" width="20" height="20" />
      </button>
    </div>
  </div>
</div>
