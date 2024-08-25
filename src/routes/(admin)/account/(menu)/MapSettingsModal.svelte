<script lang="ts">
  import { menuStore } from "../../../../stores/menuStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { mapActivityStore } from "../../../../stores/mapActivityStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { enhance, applyAction } from "$app/forms"
  import { toast } from "svelte-sonner"
  import { goto } from "$app/navigation"
  import { Edit, Save, X, LogOut, Trash2, X as Close } from "lucide-svelte"

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

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
>
  <div class="w-full max-w-md rounded-lg bg-base-100 p-6 shadow-xl">
    <h3 class="mb-6 text-center text-2xl font-bold text-primary">
      Map Settings
    </h3>
    {#if $connectedMapStore.id}
      <div
        class="mb-6 rounded-lg bg-info/20 p-4 text-base-content shadow-inner dark:bg-info/40"
      >
        <div class="mb-2 text-lg font-semibold text-primary">
          {$connectedMapStore.map_name}
        </div>
        <div class="text-sm text-base-content/70 dark:text-base-content/90">
          Owned by <span class="font-medium">{$connectedMapStore.owner}</span>
        </div>
      </div>
      <div class="space-y-4">
        {#if isRenaming}
          <form
            method="POST"
            action="?/renameMap"
            use:enhance={() => {
              return async ({ result }) => {
                if (result.type === "success") {
                  isRenaming = false
                  connectedMapStore.update((store) => ({
                    ...store,
                    map_name: newMapNameInput,
                  }))
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
            <div class="mt-4 flex space-x-2">
              <button type="submit" class="btn btn-primary flex-1">
                <Save class="mr-2 h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                class="btn btn-ghost flex-1"
                on:click={cancelRenameMap}
              >
                Cancel
              </button>
            </div>
          </form>
        {:else}
          <button class="btn btn-info w-full" on:click={openRenameModal}>
            <Edit class="mr-2 h-4 w-4" />
            Rename
          </button>
          <div class="flex space-x-2">
            <form
              method="POST"
              action="?/disconnectFromMap"
              class="w-1/2"
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
              <button type="submit" class="btn btn-warning w-full">
                <LogOut class="mr-2 h-4 w-4" />
                New Map
              </button>
            </form>
            <button
              type="button"
              class="btn btn-error w-1/2"
              disabled={!$connectedMapStore.is_owner}
              on:click={openDeleteConfirmationModal}
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <p class="text-center text-gray-600">No map connected</p>
    {/if}
    <div class="mt-6 text-center">
      <button class="btn btn-ghost" on:click={cancelSettingsModal}>
        Close
      </button>
    </div>
  </div>
</div>
