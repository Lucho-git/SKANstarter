<script lang="ts">
  import { v4 as uuidv4 } from "uuid"
  import { menuStore } from "../../../../stores/menuStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { enhance } from "$app/forms"
  import { toast } from "svelte-sonner"

  let newMapName = ""
  let generatedMapId = uuidv4()

  function cancelGenerateMap() {
    menuStore.update((store) => ({ ...store, showGenerateModal: false }))
  }
</script>

<div class="modal modal-open z-50">
  <div class="modal-box mx-auto w-11/12 max-w-md px-4 py-2">
    <h3 class="mb-4 text-center text-lg font-bold">Generate New Map</h3>
    <div class="mb-4 flex justify-center">
      <h3 class="badge badge-info badge-lg text-xs font-bold">
        {generatedMapId}
      </h3>
    </div>
    <form
      method="POST"
      action="?/createAndJoinMap"
      use:enhance={({ formElement, formData, action, cancel }) => {
        return async ({ result, update }) => {
          if (result.type === "success") {
            toast.promise(
              update().then(() => {
                menuStore.update((store) => ({
                  ...store,
                  showGenerateModal: false,
                }))
                return "You have successfully created and joined the new map"
              }),
              {
                loading: "Creating and joining new map...",
                success: (data) => data,
                error: (error) => `Error: ${error.message}`,
              },
            )
          } else {
            toast.error("Failed to create and join map", {
              description: result.data?.message || "An error occurred",
            })
          }
        }
      }}
    >
      <input
        type="text"
        name="mapName"
        placeholder="Enter map name"
        class="input input-bordered mb-4 w-full"
        bind:value={newMapName}
      />
      <input type="hidden" name="mapId" value={generatedMapId} />
      <div
        class="modal-action mb-6 flex flex-col sm:flex-row sm:justify-center"
      >
        <button type="submit" class="btn btn-primary mb-2 sm:mb-0 sm:mr-2">
          Confirm
        </button>
        <button
          type="button"
          class="btn mb-2 sm:mb-0"
          on:click={cancelGenerateMap}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>
