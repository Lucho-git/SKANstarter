<script lang="ts">
  import { onMount } from "svelte"
  import { supabase } from "../../../../lib/supabaseClient"
  import { page } from "$app/stores"
  import { v4 as uuidv4 } from "uuid"
  import { LottiePlayer } from "@lottiefiles/svelte-lottie-player"

  let masterMapId = ""
  let masterMapName = ""
  let confirmationInput = ""

  let masterMapOwner = ""
  let showGenerateModal = false
  let showConnectModal = false
  let newMapName = ""
  let generatedMapId = ""
  let userMaps = []
  let enteredMapId = ""
  let isValidMapId = false

  let isMasterUser = false
  let showDeleteConfirmation = false
  let copied = false

  let showSettingsModal = false
  function openSettingsModal() {
    showSettingsModal = true
  }

  function cancelSettingsModal() {
    showSettingsModal = false
  }

  async function fetchMasterMapDetails() {
    const session = $page.data.session

    if (!session) {
      console.error("User not authenticated")
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("master_map_id")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error retrieving user profile:", profileError)
      return
    }

    masterMapId = profile.master_map_id

    if (masterMapId) {
      const { data: masterMap, error: masterMapError } = await supabase
        .from("master_maps")
        .select("map_name, master_user_id")
        .eq("id", masterMapId)
        .single()

      if (masterMapError) {
        console.error("Error retrieving master map details:", masterMapError)
        return
      }

      masterMapName = masterMap.map_name

      const { data: owner, error: ownerError } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("id", masterMap.master_user_id)
        .single()

      if (ownerError) {
        console.error("Error retrieving master map owner details:", ownerError)
        return
      }

      masterMapOwner = `${owner.full_name} (${owner.company_name})`

      isMasterUser = masterMap.master_user_id === session.user.id
    }
  }

  async function disconnectFromMap() {
    const session = $page.data.session

    if (!session) {
      console.error("User not authenticated")
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ master_map_id: null })
      .eq("id", session.user.id)

    if (error) {
      console.error("Error disconnecting from master map:", error)
      return
    }

    masterMapId = ""
    masterMapName = ""
    masterMapOwner = ""
    isMasterUser = false
  }

  function openDeleteConfirmation() {
    showDeleteConfirmation = true
  }

  async function confirmDeleteMap() {
    const session = $page.data.session

    if (!session) {
      console.error("User not authenticated")
      return
    }

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
    const session = $page.data.session

    if (!session) {
      console.error("User not authenticated")
      return
    }

    const { data: masterMap, error: insertError } = await supabase
      .from("master_maps")
      .insert({
        id: generatedMapId,
        master_user_id: session.user.id,
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
      .eq("id", session.user.id)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      return
    }

    masterMapId = generatedMapId
    masterMapName = newMapName
    masterMapOwner = `${session.user.email}`

    showGenerateModal = false
  }

  function cancelGenerateMap() {
    showGenerateModal = false
  }

  async function openConnectModal() {
    const session = $page.data.session

    if (!session) {
      console.error("User not authenticated")
      return
    }

    const { data: maps, error } = await supabase
      .from("master_maps")
      .select("id, map_name")
      .eq("master_user_id", session.user.id)

    if (error) {
      console.error("Error fetching user maps:", error)
      return
    }

    userMaps = maps
    showConnectModal = true
  }

  async function connectToMap(mapId: string) {
    const session = $page.data.session

    if (!session) {
      console.error("User not authenticated")
      return
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ master_map_id: mapId })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      return
    }

    await fetchMasterMapDetails()
    showConnectModal = false
  }

  function cancelConnectMap() {
    showConnectModal = false
  }

  async function checkMapIdValidity() {
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
    const session = $page.data.session

    if (!session) {
      console.error("User not authenticated")
      return
    }

    const { error: updateError } = await supabase
      .from("master_maps")
      .update({ map_name: newMapNameInput })
      .eq("id", masterMapId)

    if (updateError) {
      console.error("Error renaming master map:", updateError)
      return
    }

    masterMapName = newMapNameInput
    isRenaming = false
  }

  function cancelRenameMap() {
    isRenaming = false
  }

  onMount(fetchMasterMapDetails)
</script>

<div class="alert alert-info w-full mt-2">
  <div class="px-4 py-2">
    <div class="font-bold text-center mb-4">Selected Map</div>
    {#if masterMapId}
      <div class="my-2 text-left">
        <p class="mt-2"><strong>Map Name:</strong> {masterMapName}</p>
        <p class="mt-2"><strong>Owner:</strong> {masterMapOwner}</p>
        <div class="flex flex-col sm:flex-row sm:items-center mt-2">
          <strong class="mr-2">Share Map:</strong>
          <div
            class="tooltip text-sm"
            data-tip={copied ? "Copied!" : "Click to copy"}
          >
            <button
              class="btn btn-sm btn-outline btn-accent text-xs mt-2 sm:mt-0"
              on:click={() => {
                navigator.clipboard.writeText(masterMapId)
                copied = true
                setTimeout(() => (copied = false), 2000)
              }}
            >
              <div class="flex items-center w-full">
                <span class="break-all flex-grow">{masterMapId}</span>
                <div class="border-l border-accent mx-2 h-4"></div>
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

      <div class="flex flex-col sm:flex-row sm:justify-center mt-8">
        <button
          class="btn btn-primary mb-2 sm:mb-0 sm:mr-2"
          on:click={() => {
            window.location.href = "/account/mapviewer"
          }}
        >
          <LottiePlayer
            src="/animations/CoolLineMap.json"
            autoplay={true}
            loop={true}
            controls={false}
            renderer="svg"
            background="transparent"
            height={40}
            width={40}
            controlsLayout={false}
          />
        </button>
        <!-- Replace the "Disconnect from Map" button with a settings button -->
        <button
          class="btn btn-secondary mb-2 sm:mb-0 sm:mr-2"
          on:click={openSettingsModal}
        >
          Settings
        </button>
        {#if isMasterUser}
          <button class="btn btn-error" on:click={openDeleteConfirmation}>
            <i class="at-trash"></i>
          </button>
        {/if}
      </div>
    {:else}
      <div class="my-2 text-center">
        <p>No map assigned.</p>
      </div>
      <div class="flex flex-col sm:flex-row sm:justify-center mt-4">
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
    <div class="modal-box px-4 py-2 w-11/12 max-w-md mx-auto">
      <h3 class="font-bold text-lg text-center mb-4">Generate New Map</h3>
      <div class="flex justify-center mb-4">
        <h3 class="font-bold text-xs badge badge-lg badge-info">
          {generatedMapId}
        </h3>
      </div>
      <input
        type="text"
        placeholder="Enter map name"
        class="input input-bordered w-full mb-4"
        bind:value={newMapName}
      />
      <div
        class="modal-action flex flex-col sm:flex-row sm:justify-center mb-6"
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
  <div class="modal modal-open z-100">
    <div class="modal-box px-4 py-2 w-11/12 max-w-md mx-auto">
      <h3 class="font-bold text-lg text-center mb-4">Confirm Map Deletion</h3>
      <p class="mb-4">Are you sure you want to permanently delete this map?</p>
      <p class="mb-4">
        Please type the first 8 letters of the master map ID to confirm:
      </p>
      <p class="mb-4">
        <span class="font-bold text-error">{masterMapId.slice(0, 8)}</span><span
          >{masterMapId.slice(8)}</span
        >
      </p>
      <input
        type="text"
        class="input input-bordered w-full mb-4"
        bind:value={confirmationInput}
        placeholder="Type the first 8 letters of the map ID"
      />
      <div
        class="modal-action flex flex-col sm:flex-row sm:justify-center mb-6"
      >
        <button
          class="btn btn-error mb-2 sm:mb-0 sm:mr-2"
          disabled={confirmationInput.toLowerCase() !==
            masterMapId.slice(0, 8).toLowerCase()}
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
    <div class="modal-box px-4 py-2 w-11/12 max-w-md mx-auto">
      <h3 class="font-bold text-lg text-center mb-4">Connect to Master Map</h3>
      <div class="form-control mb-4">
        <label class="label" for="enteredMapId">
          <span class="label-text">Enter Master Map ID:</span>
        </label>
        <div class="relative">
          <input
            type="text"
            id="enteredMapId"
            placeholder="Master Map ID"
            class="input input-bordered w-full pr-16"
            bind:value={enteredMapId}
            on:input={checkMapIdValidity}
          />
          <button
            class="btn btn-primary absolute top-0 right-0 rounded-l-none"
            class:btn-success={isValidMapId}
            disabled={!isValidMapId}
            on:click={() => connectToMap(enteredMapId)}
          >
            Connect
          </button>
        </div>
      </div>
      {#if userMaps.length > 0}
        <ul class="menu bg-base-100 w-full p-2 rounded-box mb-4">
          {#each userMaps as map}
            <li>
              <label class="flex items-center justify-between cursor-pointer">
                <input
                  type="radio"
                  name="map-selection"
                  class="hidden"
                  on:change={() => connectToMap(map.id)}
                />
                <span class="text-center flex-grow">{map.map_name}</span>
                <button
                  class="btn btn-sm btn-primary ml-4"
                  on:click={() => connectToMap(map.id)}
                >
                  Connect
                </button>
              </label>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="mb-4">No master maps found.</p>
      {/if}
      <div
        class="modal-action flex flex-col sm:flex-row sm:justify-center mb-6"
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
    <div class="modal-box px-4 py-2 w-11/12 max-w-md mx-auto">
      <h3 class="font-bold text-lg text-center mb-4">Map Settings</h3>
      {#if masterMapId}
        <div class="bg-info border border-blue-500 rounded-lg p-4 mb-4">
          <div>
            <span class="font-bold">Selected Map:</span>
            {masterMapName}
          </div>
          <div class="my-2 text-left">
            <p class="mt-2"><strong>Owner:</strong> {masterMapOwner}</p>
            <div class="flex flex-col sm:flex-row sm:items-center mt-2">
              <div
                class="tooltip text-sm"
                data-tip={copied ? "Copied!" : "Click to copy"}
              >
                <button
                  class="btn btn-sm btn-outline btn-accent text-xs mt-2 sm:mt-0"
                  on:click={() => {
                    navigator.clipboard.writeText(masterMapId)
                    copied = true
                    setTimeout(() => (copied = false), 2000)
                  }}
                >
                  <div class="flex items-center w-full">
                    <span class="break-all flex-grow">{masterMapId}</span>
                    <div class="border-l border-accent mx-2 h-4"></div>
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
          <button class="btn btn-warning" on:click={disconnectFromMap}>
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
          {#if isRenaming}
            <div class="flex items-center space-x-2">
              <input
                type="text"
                class="input input-bordered flex-grow"
                bind:value={newMapNameInput}
              />
              <button class="btn btn-success" on:click={renameMap}>
                Save
              </button>
              <button class="btn btn-error" on:click={cancelRenameMap}>
                Cancel
              </button>
            </div>
          {:else}
            <button class="btn btn-info" on:click={openRenameModal}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                />
              </svg>
              Rename
            </button>
          {/if}
          <button
            class="btn btn-error"
            class:btn-disabled={!isMasterUser}
            on:click={openDeleteConfirmation}
            disabled={!isMasterUser}
          >
            <i class="at-trash mr-2"></i>
            Delete
          </button>
        </div>
      {:else}
        <!-- ... (existing code) -->
      {/if}
      <div
        class="modal-action flex flex-col sm:flex-row sm:justify-center mt-6"
      >
        <button class="btn mb-2 sm:mb-0" on:click={cancelSettingsModal}>
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
