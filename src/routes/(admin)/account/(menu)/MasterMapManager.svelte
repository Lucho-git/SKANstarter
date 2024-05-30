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
          />
        </button>
        <button
          class="btn btn-warning mb-2 sm:mb-0 sm:mr-2"
          on:click={disconnectFromMap}
        >
          Disconnect from Map
        </button>
        {#if isMasterUser}
          <button class="btn btn-error" on:click={openDeleteConfirmation}>
            Delete Map
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
  <div class="modal modal-open">
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
  <div class="modal modal-open">
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
