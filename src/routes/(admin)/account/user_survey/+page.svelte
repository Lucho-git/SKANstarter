<script lang="ts">
  import FeatheryForm from "../../../../components/FeatheryForm.svelte"
  import { goto } from "$app/navigation"
  import { enhance } from "$app/forms"

  let surveyCompleted = false
  let loading = false

  const handleSurveyCompletion = async () => {
    surveyCompleted = true
    loading = true

    try {
      await updateSurveyStatus(true)
      // Reload the page to refresh the profile data
      window.location.reload()
    } catch (error) {
      console.error("Error updating survey status:", error)
      // Handle the error, display a message, or take appropriate action
    } finally {
      loading = false
    }
  }

  const handleSkipSurvey = async () => {
    loading = true

    try {
      await updateSurveyStatus(true)
      // Reload the page to refresh the profile data
      window.location.reload()
    } catch (error) {
      console.error("Error updating survey status:", error)
      // Handle the error, display a message, or take appropriate action
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
      {#if !surveyCompleted}
        <form
          id="surveyForm"
          method="POST"
          action="/account/api?/updateProfile"
          use:enhance={() => {
            return async ({ result }) => {
              loading = false
              if (result.type === "success") {
                window.location.reload()
              }
            }
          }}
        >
          <input type="hidden" name="surveyCompleted" value="true" />
          <FeatheryForm on:complete={handleSurveyCompletion} />
          <button
            type="submit"
            class="btn btn-secondary mt-4"
            on:click={handleSkipSurvey}
          >
            Skip Survey
          </button>
        </form>
      {/if}
    </div>
  </div>
</div>
