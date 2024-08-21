<script lang="ts">
  import { onMount } from "svelte"
  import { supabase } from "../../../../lib/supabaseClient"
  import { page } from "$app/stores"
  import { v4 as uuidv4 } from "uuid"
  import { browser } from "$app/environment"
  import CoolLineMap from "$lib/animations/CoolLineMap.json"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { enhance, applyAction } from "$app/forms"
  import { toast } from "svelte-sonner"

  let LottiePlayer

  let confirmationInput = ""
  let showGenerateModal = false
  let showConnectModal = false
  let newMapName = ""
  let generatedMapId = ""
  let userMaps = []
  let enteredMapId = ""
  let isValidMapId = false

  let showDeleteConfirmation = false
  let copied = false
  let showSettingsModal = false

  $: masterMapId = $connectedMapStore.id
  $: masterMapName = $connectedMapStore.map_name
  $: masterMapOwner = $connectedMapStore.owner
  $: isMasterUser = $connectedMapStore.is_owner

  const icons = {
    copy: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
    disconnect: `<svg fill="#000000" width="20px" height="20px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="icon"><path d="M832.6 191.4c-84.6-84.6-221.5-84.6-306 0l-96.9 96.9 51 51 96.9-96.9c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204l-96.9 96.9 51.1 51.1 96.9-96.9c84.4-84.6 84.4-221.5-.1-306.1zM446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l96.9-96.9-51.1-51.1-96.9 96.9c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l96.9-96.9-51-51-96.8 97zM260.3 209.4a8.03 8.03 0 0 0-11.3 0L209.4 249a8.03 8.03 0 0 0 0 11.3l554.4 554.4c3.1 3.1 8.2 3.1 11.3 0l39.6-39.6c3.1-3.1 3.1-8.2 0-11.3L260.3 209.4z"/></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>`,
    trash: `<i class="at-trash mr-2"></i>`,
  }

  const buttons = [
    {
      label: "Rename",
      icon: icons.edit,
      onClick: openRenameModal,
      disabled: false,
    },
    {
      label: "Disconnect",
      icon: icons.disconnect,
      onClick: disconnectFromMap,
      disabled: false,
    },
    {
      label: "Delete",
      icon: icons.trash,
      onClick: openDeleteConfirmation,
      disabled: !isMasterUser,
    },
  ]

  function openSettingsModal() {
    showSettingsModal = true
  }

  function cancelSettingsModal() {
    showSettingsModal = false
  }

  async function disconnectFromMap() {
    const { error } = await supabase
      .from("profiles")
      .update({ master_map_id: null })
      .eq("id", $profileStore.id)

    if (error) {
      console.error("Error disconnecting from master map:", error)
      return
    }

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

  function openDeleteConfirmation() {
    showDeleteConfirmation = true
  }

  async function confirmDeleteMap() {
    // Update profiles to set master_map_id to null for the map being deleted
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ master_map_id: null })
      .eq("master_map_id", masterMapId)

    if (updateError) {
      console.error("Error updating profiles:", updateError)
      return
    }

    // Delete the master map
    const { error: deleteError } = await supabase
      .from("master_maps")
      .delete()
      .eq("id", masterMapId)

    if (deleteError) {
      console.error("Error deleting master map:", deleteError)
      return
    }

    await disconnectFromMap()
    showDeleteConfirmation = false
  }

  function cancelDeleteMap() {
    showDeleteConfirmation = false
  }

  function openGenerateModal() {
    generatedMapId = uuidv4()
    newMapName = ""
    showGenerateModal = true
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

    showGenerateModal = false
  }

  function cancelGenerateMap() {
    showGenerateModal = false
  }

  async function openConnectModal() {
    const { data: maps, error } = await supabase
      .from("master_maps")
      .select("id, map_name")
      .eq("master_user_id", $profileStore.id)

    if (error) {
      console.error("Error fetching user maps:", error)
      return
    }

    userMaps = maps
    showConnectModal = true
  }

  async function connectToMap(mapId: string) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ master_map_id: mapId })
      .eq("id", $profileStore.id)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      return
    }

    // Fetch and update connectedMapStore
    const { data: masterMap, error: masterMapError } = await supabase
      .from("master_maps")
      .select("*")
      .eq("id", mapId)
      .single()

    if (masterMapError) {
      console.error("Error fetching master map details:", masterMapError)
      return
    }

    connectedMapStore.set({
      id: masterMap.id,
      map_name: masterMap.map_name,
      master_user_id: masterMap.master_user_id,
      owner:
        masterMap.master_user_id === $profileStore.id
          ? $profileStore.full_name
          : null,
      is_owner: masterMap.master_user_id === $profileStore.id,
      masterSubscription: null,
      is_connected: true,
    })

    showConnectModal = false
  }

  function cancelConnectMap() {
    showConnectModal = false
  }

  async function checkMapIdValidity() {
    console.log("Checking map ID validity for:", enteredMapId)
    const { data: map, error } = await supabase
      .from("master_maps")
      .select("id")
      .eq("id", enteredMapId)
      .single()

    isValidMapId = !error && map !== null
  }

  let isRenaming = false
  let newMapNameInput = ""

  function openRenameModal() {
    isRenaming = true
    newMapNameInput = masterMapName
  }

  async function renameMap() {
    const { error: updateError } = await supabase
      .from("master_maps")
      .update({ map_name: newMapNameInput })
      .eq("id", masterMapId)

    if (updateError) {
      console.error("Error renaming master map:", updateError)
      return
    }

    connectedMapStore.update((store) => ({
      ...store,
      map_name: newMapNameInput,
    }))

    isRenaming = false
  }

  function cancelRenameMap() {
    isRenaming = false
  }

  onMount(async () => {
    if (browser) {
      const module = await import("@lottiefiles/svelte-lottie-player")
      LottiePlayer = module.LottiePlayer
    }
  })
</script>

<div class="alert alert-info mt-2 w-full">
  <div class="px-4 py-2">
    <div class="mb-4 text-center font-bold">Selected Map</div>
    {#if $connectedMapStore.id}
      <div class="my-2 text-left">
        <p class="mt-2">
          <strong>Map Name:</strong>
          {$connectedMapStore.map_name}
        </p>
        <p class="mt-2"><strong>Owner:</strong> {$connectedMapStore.owner}</p>
        <div class="mt-2 flex flex-col sm:flex-row sm:items-center">
          <strong class="mr-2">Share Map:</strong>
          <div
            class="tooltip text-sm"
            data-tip={copied ? "Copied!" : "Click to copy"}
          >
            <button
              class="btn btn-accent btn-outline btn-sm mt-2 text-xs sm:mt-0"
              on:click={() => {
                navigator.clipboard.writeText($connectedMapStore.id)
                copied = true
                setTimeout(() => (copied = false), 2000)
              }}
            >
              <div class="flex w-full items-center">
                <span class="flex-grow break-all">{$connectedMapStore.id}</span>
                <div class="mx-2 h-4 border-l border-accent"></div>
                {#if copied}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                {/if}
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col sm:flex-row sm:justify-center">
        <button
          class="btn btn-primary mb-2 sm:mb-0 sm:mr-2"
          on:click={() => {
            window.location.href = "/account/mapviewer"
          }}
        >
          {#if browser && LottiePlayer}
            <svelte:component
              this={LottiePlayer}
              src={CoolLineMap}
              autoplay={true}
              loop={true}
              controls={false}
              renderer="svg"
              background="transparent"
              height={40}
              width={40}
            />
          {:else}
            <span>Map Viewer</span>
          {/if}
        </button>
        <button
          class="btn btn-secondary mb-2 sm:mb-0 sm:mr-2"
          on:click={openSettingsModal}
        >
          Settings
        </button>
      </div>
    {:else}
      <div class="my-2 text-center">
        <p>No map assigned.</p>
      </div>
      <div class="mt-4 flex flex-col sm:flex-row sm:justify-center">
        <button
          class="btn btn-primary mb-2 sm:mb-0 sm:mr-2"
          on:click={openGenerateModal}
        >
          Generate New Map
        </button>
        <button class="btn btn-secondary" on:click={openConnectModal}>
          Connect to Existing Map
        </button>
      </div>
    {/if}
  </div>
</div>

{#if showGenerateModal}
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
      <div
        class="modal-action mb-6 flex flex-col sm:flex-row sm:justify-center"
      >
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
{/if}

{#if showDeleteConfirmation}
  <div class="z-100 modal modal-open">
    <div class="modal-box mx-auto w-11/12 max-w-md px-4 py-2">
      <h3 class="mb-4 text-center text-lg font-bold">Confirm Map Deletion</h3>
      <p class="mb-4">Are you sure you want to permanently delete this map?</p>
      <p class="mb-4">
        Please type the first 8 letters of the master map ID to confirm:
      </p>
      <p class="mb-4">
        <span class="font-bold text-error"
          >{$connectedMapStore.id.slice(0, 8)}</span
        ><span>{$connectedMapStore.id.slice(8)}</span>
      </p>
      <input
        type="text"
        class="input input-bordered mb-4 w-full"
        bind:value={confirmationInput}
        placeholder="Type the first 8 letters of the map ID"
      />
      <div
        class="modal-action mb-6 flex flex-col sm:flex-row sm:justify-center"
      >
        <button
          class="btn btn-error mb-2 sm:mb-0 sm:mr-2"
          disabled={confirmationInput.toLowerCase() !==
            $connectedMapStore.id.slice(0, 8).toLowerCase()}
          on:click={confirmDeleteMap}
        >
          Confirm Deletion
        </button>
        <button class="btn mb-2 sm:mb-0" on:click={cancelDeleteMap}>
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showConnectModal}
  <div class="modal modal-open">
    <div class="modal-box mx-auto w-11/12 max-w-md px-4 py-2">
      <h3 class="mb-4 text-center text-lg font-bold">Connect to Master Map</h3>
      <form
        method="POST"
        action="?/connectToMap"
        use:enhance={({ formElement, formData, action, cancel }) => {
          return async ({ result, update }) => {
            if (result.type === "success") {
              showConnectModal = false
              showSettingsModal = false
              toast.promise(
                update().then(() => "You have successfully joined the map"),
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
              <form method="POST" action="?/connectToMap" use:enhance>
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

      <div
        class="modal-action mb-6 flex flex-col sm:flex-row sm:justify-center"
      >
        <button class="btn mb-2 sm:mb-0" on:click={cancelConnectMap}>
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showSettingsModal}
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
            <div class="mt-2 flex flex-col sm:flex-row sm:items-center">
              <div
                class="tooltip text-sm"
                data-tip={copied ? "Copied!" : "Click to copy"}
              >
                <button
                  class="btn btn-accent btn-outline btn-sm mt-2 text-xs sm:mt-0"
                  on:click={() => {
                    navigator.clipboard.writeText($connectedMapStore.id)
                    copied = true
                    setTimeout(() => (copied = false), 2000)
                  }}
                >
                  <div class="flex w-full items-center">
                    <span class="flex-grow break-all"
                      >{$connectedMapStore.id}</span
                    >
                    <div class="mx-2 h-4 border-l border-accent"></div>
                    {#if copied}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    {:else}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    {/if}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col space-y-4">
          {#if isRenaming}
            <div class="flex flex-col space-y-2">
              <input
                type="text"
                class="input input-bordered w-full"
                bind:value={newMapNameInput}
              />
              <div class="flex space-x-2">
                <button class="btn btn-success w-1/2" on:click={renameMap}>
                  Save
                </button>
                <button class="btn btn-error w-1/2" on:click={cancelRenameMap}>
                  Cancel
                </button>
              </div>
            </div>
          {:else}
            <button class="btn btn-info" on:click={openRenameModal}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                />
              </svg>
              Rename
            </button>
            <div class="flex space-x-2">
              <button
                class="btn btn-warning w-1/2 text-xs"
                on:click={disconnectFromMap}
              >
                <svg
                  fill="#000000"
                  width="20px"
                  height="20px"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon"
                >
                  <path
                    d="M832.6 191.4c-84.6-84.6-221.5-84.6-306 0l-96.9 96.9 51 51 96.9-96.9c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204l-96.9 96.9 51.1 51.1 96.9-96.9c84.4-84.6 84.4-221.5-.1-306.1zM446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l96.9-96.9-51.1-51.1-96.9 96.9c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l96.9-96.9-51-51-96.8 97zM260.3 209.4a8.03 8.03 0 0 0-11.3 0L209.4 249a8.03 8.03 0 0 0 0 11.3l554.4 554.4c3.1 3.1 8.2 3.1 11.3 0l39.6-39.6c3.1-3.1 3.1-8.2 0-11.3L260.3 209.4z"
                  />
                </svg>
                Disconnect
              </button>
              <button
                class="btn btn-error w-1/2 text-xs"
                class:btn-disabled={!$connectedMapStore.is_owner}
                on:click={openDeleteConfirmation}
                disabled={!$connectedMapStore.is_owner}
              >
                <i class="at-trash mr-2"></i>
                Delete
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <div
          class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0"
        >
          <button class="btn btn-primary" on:click={openGenerateModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            New Map
          </button>
          <button class="btn btn-secondary" on:click={openConnectModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
                clip-rule="evenodd"
              />
            </svg>
            Connect
          </button>
        </div>
      {/if}
      <div class="modal-action mt-6 flex flex-row flex-col justify-center">
        <button class="btn mb-2 sm:mb-0" on:click={cancelSettingsModal}>
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
