<script lang="ts">
  import { menuStore } from "../../../../stores/menuStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { supabase } from "$lib/supabaseClient"
  import { enhance } from "$app/forms"
  import { toast } from "svelte-sonner"
  import { Link2, Map } from "lucide-svelte"

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
  <div class="modal-box mx-auto w-11/12 max-w-xl px-6 py-6">
    <h3 class="mb-6 text-center text-2xl font-bold text-primary">
      Connect to Map
    </h3>

    <!-- <div class="mb-4 flex items-center justify-center">
      <Link2 class="h-8 w-8 text-primary" />
    </div> -->

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
          <span class="label-text">Enter Map ID:</span>
        </label>
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

    {#if userMaps.length > 0}
      <div class="divider my-4">OR</div>
      <h4 class="mb-2 text-lg font-semibold">Your Maps</h4>
      <ul class="space-y-2">
        {#each userMaps as map, index}
          <li
            class={`rounded-xl ${index % 2 === 0 ? "bg-base-200" : "bg-base-300"}`}
          >
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
              <button
                type="submit"
                class="flex w-full items-center justify-between p-4 transition-colors hover:bg-base-100"
              >
                <span class="flex items-center font-medium">
                  <Map class="mr-2 h-4 w-4" />
                  {map.map_name}
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

    <div class="mt-6 flex justify-center">
      <button class="btn btn-ghost" on:click={cancelConnectMap}>
        Cancel
      </button>
    </div>
  </div>
</div>
