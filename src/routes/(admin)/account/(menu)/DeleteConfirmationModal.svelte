<script lang="ts">
  import { menuStore } from "../../../../stores/menuStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { enhance, applyAction } from "$app/forms"
  import { toast } from "svelte-sonner"
  import { goto } from "$app/navigation"

  export let onClose = () => {}

  let confirmationInput = ""

  $: mapName = $connectedMapStore.map_name || "Unnamed Map"
  $: mapId = $connectedMapStore.id || ""

  function updateStores() {
    connectedMapStore.set({
      id: null,
      map_name: null,
      master_user_id: null,
      owner: null,
      is_owner: false,
      masterSubscription: null,
      is_connected: false,
    })
  }

  function closeModals() {
    menuStore.update((store) => ({
      ...store,
      showDeleteConfirmationModal: false,
      showSettingsModal: false,
    }))
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
>
  <div class="modal-box w-full max-w-md rounded-lg bg-base-100 p-6 shadow-xl">
    <h3 class="mb-4 text-center text-2xl font-bold text-red-600">
      Confirm Map Deletion
    </h3>
    <p class="mb-4 text-center text-base-content/70 dark:text-base-content/90">
      Are you sure you want to permanently delete the map:
      <span class="font-semibold">{mapName}</span>?
    </p>
    <p class="mb-2 text-sm text-gray-600">
      Please type the first 8 characters of the map ID to confirm:
    </p>
    <p class="mb-4 text-center font-mono text-sm">
      <span class="font-bold text-red-500">{mapId.slice(0, 8)}</span>
      <span class="text-gray-400">{mapId.slice(8)}</span>
    </p>
    <form
      method="POST"
      action="?/deleteMap"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "success") {
            updateStores()
            closeModals()
            toast.success("Map deleted successfully")
            goto("/account")
          } else {
            toast.error("Failed to delete map")
          }
          await applyAction(result)
        }
      }}
    >
      <input type="hidden" name="mapId" value={mapId} />
      <input
        type="text"
        class="input input-bordered mb-4 w-full"
        bind:value={confirmationInput}
        placeholder="Type the first 8 characters"
      />
      <div class="flex justify-center space-x-4">
        <button
          type="submit"
          class="btn btn-error"
          disabled={confirmationInput.toLowerCase() !==
            mapId.slice(0, 8).toLowerCase()}
        >
          Confirm Deletion
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          on:click={() => {
            menuStore.update((store) => ({
              ...store,
              showDeleteConfirmationModal: false,
            }))
            onClose()
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>
