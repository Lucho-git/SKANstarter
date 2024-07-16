<script lang="ts">
  import { page } from "$app/stores"
  import { supabase } from "$lib/supabaseClient"

  let isSubscribed = true
  let error = false
  let processing = false
  let updateSuccessful = false

  async function handleUpdatePreferences() {
    processing = true
    updateSuccessful = false
    const { token } = $page.params
    const { data, error: supabaseError } = await supabase
      .from("email_subscribers")
      .update({ is_subscribed: isSubscribed })
      .match({ unsubscribe_token: token })

    if (supabaseError) {
      console.error("Error updating preferences:", supabaseError)
      error = true
    } else {
      updateSuccessful = true
    }
    processing = false
  }
</script>

<svelte:head>
  <title>Manage Email Preferences</title>
</svelte:head>

<div class="flex justify-center items-center min-h-screen bg-base-200">
  <div class="container mx-auto px-4 max-w-2xl">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-2xl font-bold mb-6 justify-center">
          Manage Email Preferences
        </h1>

        {#if !error}
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Receive important updates</span>
              <input
                type="checkbox"
                bind:checked={isSubscribed}
                class="checkbox"
              />
            </label>
          </div>
          <div class="card-actions justify-center mt-6">
            <button
              class="btn btn-primary w-full sm:w-auto"
              on:click={handleUpdatePreferences}
              disabled={processing}
            >
              {processing ? "Processing..." : "Update Preferences"}
            </button>
          </div>
          {#if updateSuccessful}
            <div class="alert alert-success mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                /></svg
              >
              <span>Your email preferences have been updated successfully.</span
              >
            </div>
          {/if}
        {:else}
          <div class="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
            <span
              >There was an error processing your request. Please try again
              later.</span
            >
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: hsl(var(--b2));
  }
</style>
