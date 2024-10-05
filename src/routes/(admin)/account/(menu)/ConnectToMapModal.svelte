<script lang="ts">
  import { menuStore } from "../../../../stores/menuStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { supabase } from "$lib/supabaseClient"
  import { enhance } from "$app/forms"
  import { toast } from "svelte-sonner"
  import { Link2, Map, Clock, X } from "lucide-svelte"

  let enteredMapId = ""
  let isValidMapId = false
  let userMaps = []
  let recentMaps = []

  async function checkMapIdValidity() {
    const { data: map, error } = await supabase
      .from("master_maps")
      .select("id")
      .eq("id", enteredMapId)
      .single()

    isValidMapId = !error && map !== null
  }

  function closeModal() {
    menuStore.update((store) => ({ ...store, showConnectModal: false }))
  }

  async function fetchRecentMaps() {
    if ($profileStore.recent_maps && $profileStore.recent_maps.length > 0) {
      const { data, error } = await supabase
        .from("master_maps")
        .select(
          `
            id, 
            map_name, 
            master_user_id,
            profiles:master_user_id(full_name)
          `,
        )
        .in("id", $profileStore.recent_maps)

      if (!error && data) {
        recentMaps = $profileStore.recent_maps
          .map((id) => {
            const map = data.find((m) => m.id === id)
            return map
              ? {
                  ...map,
                  owner_name:
                    map.master_user_id === $profileStore.id
                      ? "You"
                      : map.profiles.full_name,
                }
              : undefined
          })
          .filter((map) => map !== undefined)
      } else {
        console.error("Error fetching recent maps:", error)
      }
    }
  }

  $: {
    if ($menuStore.showConnectModal) {
      supabase
        .from("master_maps")
        .select(
          `
            id, 
            map_name, 
            master_user_id,
            profiles:master_user_id(full_name)
          `,
        )
        .eq("master_user_id", $profileStore.id)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching user maps:", error)
          } else {
            userMaps = (data || []).map((map) => ({
              ...map,
              owner_name: "You",
            }))
          }
        })

      fetchRecentMaps()
    }
  }

  function handleEnhance({ formElement, formData, action, cancel }) {
    return async ({ result, update }) => {
      if (result.type === "success") {
        toast.promise(
          update().then(() => {
            menuStore.update((store) => ({
              ...store,
              showConnectModal: false,
            }))
            return "You have successfully joined the map"
          }),
          {
            loading: "Connecting to map...",
            success: (data) => data,
            error: (error) => `Error: ${error.message}`,
          },
        )
      } else {
        toast.error("Failed to connect to map", {
          description: result.data?.message || "An error occurred",
        })
      }
    }
  }
</script>

<div class="modal modal-open">
  <div class="modal-box relative mx-auto w-11/12 max-w-xl px-6 py-6">
    <button
      class="btn btn-circle btn-sm absolute right-2 top-2"
      on:click={closeModal}
    >
      <X class="h-4 w-4" />
    </button>

    <h2 class="mb-6 text-center text-3xl font-bold text-primary">
      Connect to Map
    </h2>

    <form method="POST" action="?/connectToMap" use:enhance={handleEnhance}>
      <div class="form-control mb-4">
        <label class="label" for="enteredMapId">
          <span class="label-text text-lg font-semibold">Enter Map ID:</span>
        </label>
        <p class="mb-2 text-sm text-gray-600">
          Paste the Map ID here to connect to an existing map.
        </p>
        <div class="flex">
          <input
            type="text"
            id="enteredMapId"
            name="mapId"
            placeholder="Map ID"
            class="input input-bordered flex-grow"
            bind:value={enteredMapId}
            on:input={checkMapIdValidity}
          />
          <button
            type="submit"
            class="btn btn-primary ml-2"
            class:btn-success={isValidMapId}
            disabled={!isValidMapId}
          >
            Connect
          </button>
        </div>
      </div>
    </form>

    {#if recentMaps.length > 0}
      <div class="divider my-6">
        <span class="text-xl font-bold text-primary">Recent Maps</span>
      </div>
      <p class="mb-4 text-sm text-gray-600">
        Select a map you've recently connected to:
      </p>
      <ul class="space-y-2">
        {#each recentMaps as map, index}
          <li
            class={`rounded-xl ${index % 2 === 0 ? "bg-base-200" : "bg-base-300"}`}
          >
            <form
              method="POST"
              action="?/connectToMap"
              use:enhance={handleEnhance}
            >
              <input type="hidden" name="mapId" value={map.id} />
              <button
                type="submit"
                class="flex w-full items-center justify-between p-4 transition-colors hover:bg-base-100"
              >
                <span class="flex flex-col items-start">
                  <span class="flex items-center font-medium">
                    <Map class="mr-2 h-4 w-4" />
                    {map.map_name}
                  </span>
                  <span class="text-sm text-gray-500"
                    >Owner: {map.owner_name}</span
                  >
                </span>
                <Link2 class="h-8 w-8 text-primary" />
              </button>
            </form>
          </li>
        {/each}
      </ul>
    {/if}

    {#if userMaps.length > 0}
      <div class="divider my-6">
        <span class="text-xl font-bold text-primary">Your Maps</span>
      </div>
      <p class="mb-4 text-sm text-gray-600">
        Select one of your own maps to connect:
      </p>
      <ul class="space-y-2">
        {#each userMaps as map, index}
          <li
            class={`rounded-xl ${index % 2 === 0 ? "bg-base-200" : "bg-base-300"}`}
          >
            <form
              method="POST"
              action="?/connectToMap"
              use:enhance={handleEnhance}
            >
              <input type="hidden" name="mapId" value={map.id} />
              <button
                type="submit"
                class="flex w-full items-center justify-between p-4 transition-colors hover:bg-base-100"
              >
                <span class="flex flex-col items-start">
                  <span class="flex items-center font-medium">
                    <Map class="mr-2 h-4 w-4" />
                    {map.map_name}
                  </span>
                </span>
                <Link2 class="h-8 w-8 text-primary" />
              </button>
            </form>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="mt-4 text-center text-gray-600">No master maps found.</p>
    {/if}

    <div class="mt-8 flex justify-center">
      <button class="btn btn-ghost" on:click={closeModal}> Cancel </button>
    </div>
  </div>
</div>
