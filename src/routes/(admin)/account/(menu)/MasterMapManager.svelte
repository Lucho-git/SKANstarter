<script lang="ts">
  import { onMount } from "svelte"
  import { supabase } from "../../../../lib/supabaseClient"
  import { page } from "$app/stores"
  import { v4 as uuidv4 } from "uuid"

  let masterMapId = ""
  let masterMapName = ""
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

  onMount(fetchMasterMapDetails)
</script>

<div class="alert alert-info max-w-lg mt-2">
  <div>
    <div class="font-bold text-center">Master Map</div>
    {#if masterMapId}
      <div class="my-2">
        <div class="flex flex-nowrap items-center">
          <strong>Map ID:</strong>
          <div class="tooltip" data-tip={copied ? "Copied!" : "Click to copy"}>
            <button
              class="btn btn-sm btn-outline btn-accent ml-1"
              on:click={() => {
                navigator.clipboard.writeText(masterMapId)
                copied = true
                setTimeout(() => (copied = false), 2000)
              }}
            >
              {masterMapId}
              {#if copied}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 ml-2"
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
                  class="h-4 w-4 ml-2"
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
            </button>
          </div>
        </div>
        <p><strong>Map Name:</strong> {masterMapName}</p>
        <p><strong>Owner:</strong> {masterMapOwner}</p>
      </div>

      <button class="btn btn-warning" on:click={disconnectFromMap}>
        Disconnect from Map
      </button>
      {#if isMasterUser}
        <button class="btn btn-error ml-2" on:click={openDeleteConfirmation}>
          Delete Map
        </button>
      {/if}
    {:else}
      <div class="my-2">
        <p>No map assigned.</p>
      </div>
      <button class="btn btn-primary" on:click={openGenerateModal}>
        Generate New Map
      </button>
      <button class="btn btn-secondary ml-2" on:click={openConnectModal}>
        Connect to Existing Map
      </button>
    {/if}
  </div>
</div>

{#if showGenerateModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Generate New Map</h3>
      <p class="py-4">Generated Map ID: {generatedMapId}</p>
      <input
        type="text"
        placeholder="Enter map name"
        class="input input-bordered w-full max-w-xs"
        bind:value={newMapName}
      />
      <div class="modal-action">
        <button class="btn btn-primary" on:click={confirmGenerateMap}>
          Confirm
        </button>
        <button class="btn" on:click={cancelGenerateMap}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

{#if showDeleteConfirmation}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Confirm Map Deletion</h3>
      <p class="py-4">Are you sure you want to permanently delete this map?</p>
      <div class="modal-action">
        <button class="btn btn-error" on:click={confirmDeleteMap}>
          Delete
        </button>
        <button class="btn" on:click={cancelDeleteMap}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

{#if showConnectModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Connect to Master Map</h3>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Enter Master Map ID:</span>
        </label>
        <div class="relative">
          <input
            type="text"
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
        <ul class="menu bg-base-100 w-56 p-2 rounded-box mt-4">
          {#each userMaps as map}
            <li>
              <a>
                {map.map_name}
                <button
                  class="btn btn-sm btn-primary"
                  on:click={() => connectToMap(map.id)}
                >
                  Connect
                </button>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="py-4">No master maps found.</p>
      {/if}
      <div class="modal-action">
        <button class="btn" on:click={cancelConnectMap}>Cancel</button>
      </div>
    </div>
  </div>
{/if}
