<script lang="ts">
  import FeatheryForm from "../../../../components/FeatheryForm.svelte"
  import { goto } from "$app/navigation"

  let surveyCompleted = false
  let loading = false

  const updateSurveyStatus = async (completed: boolean) => {
    const response = await fetch("/account/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "updateProfile",
        surveyCompleted: completed,
      }),
    })

    if (!response.ok) {
      console.error("Error updating survey status")
      throw new Error("Failed to update survey status")
    }
  }

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
  class="text-center content-center min-h-[100vh] mb-12 mt-4 flex items-center place-content-center"
>
  <div class="flex flex-col w-full px-6">
    <div>
      <h1 class="text-2xl font-bold mb-6">User Survey</h1>
      {#if !surveyCompleted}
        <FeatheryForm on:complete={handleSurveyCompletion} />
        <button class="btn btn-secondary mt-4" on:click={handleSkipSurvey}>
          Skip Survey
        </button>
      {:else}
        <p>Thank you for completing the survey!</p>
      {/if}
    </div>
  </div>
</div>
