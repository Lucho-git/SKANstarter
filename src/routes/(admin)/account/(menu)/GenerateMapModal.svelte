<script lang="ts">
  import { v4 as uuidv4 } from "uuid"
  import { menuStore } from "../../../../stores/menuStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { enhance } from "$app/forms"
  import { toast } from "svelte-sonner"
  import { Map } from "lucide-svelte"

  let newMapName = ""
  let generatedMapId = uuidv4()

  function cancelGenerateMap() {
    menuStore.update((store) => ({ ...store, showGenerateModal: false }))
  }
</script>

<div class="modal modal-open">
  <div class="modal-box mx-auto w-11/12 max-w-xl px-6 py-4">
    <h3 class="mb-6 text-center text-2xl font-bold text-primary">
      Generate New Map
    </h3>

    <div
      class="mb-6 rounded-lg bg-info/20 p-4 text-base-content shadow-inner dark:bg-info/40"
    >
      <div class="mb-4 flex items-center justify-center">
        <Map class="h-12 w-12 text-primary" />
      </div>
      <div class="text-center">
        <p class="text-lg font-semibold">{newMapName || "New Map"}</p>
        <div class="mt-2 flex justify-center">
          <span class="badge badge-info badge-lg text-xs font-bold">
            {generatedMapId}
          </span>
        </div>
      </div>
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
      <div class="form-control">
        <label for="mapName" class="label">
          <span class="label-text">Map Name</span>
        </label>
        <input
          id="mapName"
          type="text"
          name="mapName"
          placeholder="Enter map name"
          class="input input-bordered w-full"
          bind:value={newMapName}
        />
      </div>
      <input type="hidden" name="mapId" value={generatedMapId} />
      <div class="mt-6 flex justify-center space-x-4">
        <button type="submit" class="btn btn-primary"> Create Map </button>
        <button
          type="button"
          class="btn btn-ghost"
          on:click={cancelGenerateMap}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>
