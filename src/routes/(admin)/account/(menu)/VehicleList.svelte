<script lang="ts">
  import { onMount } from "svelte"
  import { DateTime } from "luxon"
  import InviteModal from "./InviteModal.svelte"
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

  function getTimeSinceLastUpdate(lastUpdate) {
    const updateTime = DateTime.fromISO(lastUpdate, { zone: "utc" })
    const now = DateTime.utc()

    console.log(`Input lastUpdate string: ${lastUpdate}`)
    console.log(
      `Parsed UTC time: ${updateTime.toFormat("yyyy-MM-dd HH:mm:ss")} UTC`,
    )
    console.log(`Current UTC time: ${now.toFormat("yyyy-MM-dd HH:mm:ss")} UTC`)

    // Use the toRelative method to get human-readable duration
    const timeDifference = updateTime.toRelative({ base: now })

    console.log(`Time difference: ${timeDifference}`)

    return timeDifference
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

  function handleLocate(profile: any) {
    toast.info(`Finding ${profile.full_name}`)

    if (profile.id === currentUserId) {
      goto(`/account/mapviewer`)
    } else {
      goto(`/account/mapviewer?vehicle=${profile.id}`)
    }
  }

  function handleConnect(profile: any) {
    toast.info(`Connecting as ${profile.full_name}`)

    if (profile.id === currentUserId) {
      goto(`/account/mapviewer`)
    }
  }
</script>

<div class="mt-0 rounded-lg bg-base-200 p-4 shadow-lg" style="z-index: 0;">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-2xl font-bold">People</h3>
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
              vehicle ? handleLocate(profile) : handleConnect(profile)}
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
        <h4 class="font-bold">Invite Person</h4>
      </div>
      <InviteModal />
    </div>
  </div>
</div>
