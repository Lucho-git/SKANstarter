<script lang="ts">
  import { menuStore } from "../../../../stores/menuStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { supabase } from "$lib/supabaseClient"
  import { enhance } from "$app/forms"
  import { toast } from "svelte-sonner"

  let enteredMapId = ""
  let isValidMapId = false
  let userMaps = []

  async function checkMapIdValidity() {
    const { data: map, error } = await supabase
      .from("master_maps")
      .select("id")
      .eq("id", enteredMapId)
      .single()

    isValidMapId = !error && map !== null
  }

  function cancelConnectMap() {
    menuStore.update((store) => ({ ...store, showConnectModal: false }))
  }

  $: {
    if ($menuStore.showConnectModal) {
      supabase
        .from("master_maps")
        .select("id, map_name")
        .eq("master_user_id", $profileStore.id)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching user maps:", error)
          } else {
            userMaps = data
          }
        })
    }
  }
</script>

<div class="modal modal-open">
  <div class="modal-box mx-auto w-11/12 max-w-md px-4 py-2">
    <h3 class="mb-4 text-center text-lg font-bold">Connect to Master Map</h3>
    <form
      method="POST"
      action="?/connectToMap"
      use:enhance={({ formElement, formData, action, cancel }) => {
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
      }}
    >
      <div class="form-control mb-4">
        <label class="label" for="enteredMapId">
          <span class="label-text">Enter Master Map ID:</span>
        </label>
        <div class="relative">
          <input
            type="text"
            id="enteredMapId"
            name="mapId"
            placeholder="Master Map ID"
            class="input input-bordered w-full pr-16"
            bind:value={enteredMapId}
            on:input={checkMapIdValidity}
          />
          <button
            type="submit"
            class="btn btn-primary absolute right-0 top-0 rounded-l-none"
            class:btn-success={isValidMapId}
            disabled={!isValidMapId}
          >
            Connect
          </button>
        </div>
      </div>
    </form>

    {#if userMaps.length > 0}
      <ul class="menu rounded-box mb-4 w-full bg-base-100 p-2">
        {#each userMaps as map}
          <li>
            <form
              method="POST"
              action="?/connectToMap"
              use:enhance={({ formElement, formData, action, cancel }) => {
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
              }}
            >
              <input type="hidden" name="mapId" value={map.id} />
              <label class="flex cursor-pointer items-center justify-between">
                <span class="flex-grow text-center">{map.map_name}</span>
                <button type="submit" class="btn btn-primary btn-sm ml-4">
                  Connect
                </button>
              </label>
            </form>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="mb-4">No master maps found.</p>
    {/if}

    <div class="modal-action mb-6 flex flex-col sm:flex-row sm:justify-center">
      <button class="btn mb-2 sm:mb-0" on:click={cancelConnectMap}>
        Cancel
      </button>
    </div>
  </div>
</div>
