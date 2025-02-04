<!-- Parent component -->
<script lang="ts">
  import FeatheryForm from "../../../../components/FeatheryForm.svelte"
  import { goto } from "$app/navigation"

  export let data
  let loading = false

  async function handleSkipSurvey() {
    loading = true
    try {
      await goto("/account/payment_plans")
    } catch (error) {
      console.error("Error navigating:", error)
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>User Survey</title>
</svelte:head>

<div
  class="mb-12 mt-4 flex min-h-[100vh] place-content-center content-center items-center text-center"
>
  <div class="flex w-full flex-col px-6">
    <div>
      <h1 class="mb-6 text-2xl font-bold">User Survey</h1>
      <div class="form-container">
        <FeatheryForm />
        <button
          type="button"
          class="btn btn-secondary mt-4"
          on:click={handleSkipSurvey}
          disabled={loading}
        >
          {loading ? "Processing..." : "Skip Survey"}
        </button>
      </div>
    </div>
  </div>
</div>
