<script lang="ts">
  import { v4 as uuidv4 } from "uuid"
  import { menuStore } from "../../../../stores/menuStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { supabase } from "$lib/supabaseClient"

  let newMapName = ""
  let generatedMapId = uuidv4()

  function cancelGenerateMap() {
    menuStore.update((store) => ({ ...store, showGenerateModal: false }))
  }

  async function confirmGenerateMap() {
    const { data: masterMap, error: insertError } = await supabase
      .from("master_maps")
      .insert({
        id: generatedMapId,
        master_user_id: $profileStore.id,
        map_name: newMapName,
      })
      .single()

    if (insertError) {
      console.error("Error generating master map:", insertError)
      return
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ master_map_id: generatedMapId })
      .eq("id", $profileStore.id)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      return
    }

    connectedMapStore.set({
      id: generatedMapId,
      map_name: newMapName,
      master_user_id: $profileStore.id,
      owner: $profileStore.full_name,
      is_owner: true,
      masterSubscription: null,
      is_connected: true,
    })

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
    <input
      type="text"
      placeholder="Enter map name"
      class="input input-bordered mb-4 w-full"
      bind:value={newMapName}
    />
    <div class="modal-action mb-6 flex flex-col sm:flex-row sm:justify-center">
      <button
        class="btn btn-primary mb-2 sm:mb-0 sm:mr-2"
        on:click={confirmGenerateMap}
      >
        Confirm
      </button>
      <button class="btn mb-2 sm:mb-0" on:click={cancelGenerateMap}>
        Cancel
      </button>
    </div>
  </div>
</div>
