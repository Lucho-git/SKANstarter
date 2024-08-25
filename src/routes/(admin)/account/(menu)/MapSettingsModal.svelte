<script lang="ts">
  import { menuStore } from "../../../../stores/menuStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { mapActivityStore } from "../../../../stores/mapActivityStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { enhance, applyAction } from "$app/forms"
  import { toast } from "svelte-sonner"
  import { goto } from "$app/navigation"

  let isRenaming = false
  let newMapNameInput = $connectedMapStore.map_name

  function cancelSettingsModal() {
    menuStore.update((store) => ({ ...store, showSettingsModal: false }))
  }

  function openRenameModal() {
    isRenaming = true
  }

  function cancelRenameMap() {
    isRenaming = false
    newMapNameInput = $connectedMapStore.map_name
  }

  function openDeleteConfirmationModal() {
    menuStore.update((store) => ({
      ...store,
      showDeleteConfirmationModal: true,
    }))
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
</script>

<div class="modal modal-open z-10">
  <div class="modal-box mx-auto w-11/12 max-w-md px-4 py-2">
    <h3 class="mb-4 text-center text-lg font-bold">Map Settings</h3>
    {#if $connectedMapStore.id}
      <div class="mb-4 rounded-lg border bg-base-200 bg-info p-4 text-black">
        <div>
          <span class="font-bold">Selected Map:</span>
          {$connectedMapStore.map_name}
        </div>
        <div class="my-2 text-left">
          <p class="mt-2">
            <strong>Owner:</strong>
            {$connectedMapStore.owner}
          </p>
        </div>
      </div>
      <div class="flex flex-col space-y-4">
        {#if isRenaming}
          <form
            method="POST"
            action="?/renameMap"
            use:enhance={() => {
              return async ({ result }) => {
                if (result.type === "success") {
                  isRenaming = false
                  toast.success("Map renamed successfully")
                } else {
                  toast.error("Failed to rename map")
                }
                await applyAction(result)
              }
            }}
          >
            <input type="hidden" name="mapId" value={$connectedMapStore.id} />
            <input
              type="text"
              name="newMapName"
              class="input input-bordered w-full"
              bind:value={newMapNameInput}
            />
            <div class="mt-2 flex space-x-2">
              <button type="submit" class="btn btn-success w-1/2">Save</button>
              <button
                type="button"
                class="btn btn-error w-1/2"
                on:click={cancelRenameMap}>Cancel</button
              >
            </div>
          </form>
        {:else}
          <button class="btn btn-info" on:click={openRenameModal}>
            Rename
          </button>
          <div class="flex space-x-2">
            <form
              method="POST"
              action="?/disconnectFromMap"
              class="w-full"
              use:enhance={() => {
                return async ({ result }) => {
                  if (result.type === "success") {
                    updateStores()
                    menuStore.update((store) => ({
                      ...store,
                      showSettingsModal: false,
                    }))
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
              <button type="submit" class="btn btn-warning w-full text-xs">
                Disconnect
              </button>
            </form>
            <button
              type="button"
              class="btn btn-error w-full text-xs"
              disabled={!$connectedMapStore.is_owner}
              on:click={openDeleteConfirmationModal}
            >
              Delete
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <p>No map connected</p>
    {/if}
    <div class="modal-action mt-6 flex flex-row flex-col justify-center">
      <button class="btn mb-2 sm:mb-0" on:click={cancelSettingsModal}>
        Close
      </button>
    </div>
  </div>
</div>
