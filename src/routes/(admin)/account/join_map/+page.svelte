<!-- src/routes/(admin)/account/join_map/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms"
  import { Map, User } from "lucide-svelte"
  import { supabase } from "$lib/supabaseClient"
  import { toast } from "svelte-sonner"

  export let data

  let formError: string | null = null
  let skipMapId = false
  let joinMapId = ""
  let isValidMapId = false
  let connectedMap: { map_name: string; owner: string } | null = null
  let isLoading = false
  let fullName = ""

  // Computed property for form validation
  $: isFormValid =
    fullName.trim().length > 0 && // Name must not be empty
    (skipMapId || connectedMap) // Either skip map ID or have a connected map

  async function checkMapIdValidity() {
    if (!joinMapId) {
      isValidMapId = false
      return
    }

    const { data: map, error } = await supabase
      .from("master_maps")
      .select("id")
      .eq("id", joinMapId)
      .single()

    isValidMapId = !error && map !== null
  }

  function handleEnhance() {
    return async ({ result }) => {
      if (result.type === "success") {
        if (skipMapId) {
          toast.success("Setup completed successfully!")
        }
      } else {
        formError = result.data?.error || "Something went wrong"
        toast.error(formError)
      }
    }
  }

  async function handleJoinMap() {
    isLoading = true
    formError = null

    try {
      // First fetch map details
      const { data: mapData, error: mapError } = await supabase
        .from("master_maps")
        .select(
          `
            id,
            map_name,
            master_user_id,
            profiles:master_user_id (
              full_name
            )
          `,
        )
        .eq("id", joinMapId)
        .single()

      if (mapError || !mapData) {
        throw new Error("Map not found")
      }

      // Then update the profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          master_map_id: joinMapId,
        })
        .eq("id", data.session?.user.id)

      if (updateError) {
        throw new Error("Failed to join map")
      }

      // Update local state to show success
      connectedMap = {
        map_name: mapData.map_name,
        owner: mapData.profiles.full_name,
      }

      toast.success("Successfully joined map")
    } catch (error) {
      formError = error.message || "Failed to join map"
      toast.error(formError)
    } finally {
      isLoading = false
    }
  }

  $: {
    if (joinMapId) {
      checkMapIdValidity()
    }
  }
</script>

<div class="min-h-screen bg-base-200 px-4 py-12">
  <div class="mx-auto max-w-xl">
    <div class="mb-16 text-center">
      <h1 class="mb-4 text-5xl font-bold text-base-content">Join Map</h1>
      <p class="text-xl text-base-content/70">Connect to your farm's map</p>
    </div>

    {#if data.connected_map || connectedMap}
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="mb-6 rounded-lg bg-base-200 p-4">
            <h2 class="mb-2 text-lg font-semibold">Connected Map</h2>
            <p class="text-base-content">
              {data.connected_map?.map_name || connectedMap.map_name}
            </p>
            <p class="text-sm opacity-70">
              Owned by {data.connected_map?.owner || connectedMap.owner}
            </p>
          </div>

          <form method="POST" use:enhance={handleEnhance}>
            <div class="form-control mb-6">
              <label class="label items-center gap-2">
                <User size={18} class="text-base-content/70" />
                <span class="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                bind:value={fullName}
                placeholder="Enter your full name"
                class="input input-bordered w-full"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              disabled={!isFormValid}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    {:else}
      {#if formError}
        <div class="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formError}</span>
        </div>
      {/if}

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <form method="POST" use:enhance={handleEnhance}>
            <div class="form-control mb-6">
              <label class="label items-center gap-2">
                <User size={18} class="text-base-content/70" />
                <span class="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                bind:value={fullName}
                placeholder="Enter your full name"
                class="input input-bordered w-full"
                required
              />
            </div>

            {#if !skipMapId}
              <div class="form-control mb-6">
                <label class="label items-center gap-2">
                  <Map size={18} class="text-base-content/70" />
                  <span class="label-text">Map ID</span>
                </label>
                <div class="flex gap-2">
                  <input
                    type="text"
                    name="map_id"
                    bind:value={joinMapId}
                    placeholder="Enter map ID"
                    class="input input-bordered flex-1"
                    required={!skipMapId}
                    on:input={checkMapIdValidity}
                  />
                  <button
                    type="button"
                    class="btn btn-primary"
                    disabled={!isValidMapId || isLoading}
                    on:click={handleJoinMap}
                  >
                    {#if isLoading}
                      <span class="loading loading-spinner" />
                    {/if}
                    Join
                  </button>
                </div>
                {#if joinMapId && !isValidMapId}
                  <label class="label">
                    <span class="label-text-alt text-error">Invalid Map ID</span
                    >
                  </label>
                {/if}
              </div>
            {/if}

            <div class="form-control mb-6">
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  bind:checked={skipMapId}
                  name="skip_map_id"
                  class="checkbox checkbox-sm"
                />
                <span class="label-text">I'll add my map ID later</span>
              </label>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              disabled={!isFormValid}
            >
              {skipMapId ? "Continue Setup" : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    {/if}
  </div>
</div>
