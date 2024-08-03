<!-- FeatheryForm.svelte -->
<script>
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { supabase } from "$lib/supabaseClient"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  const formId = "7d624884-1198-4af8-b49d-4b8b5efcb85c"
  const formName = "AgSkan SurveyReal"

  let isFormCompleted = false
  let responseData = null
  let userId

  onMount(async () => {
    const session = $page.data.session
    if (session) {
      userId = session.user.id
    }

    const script = document.createElement("script")
    script.src =
      "https://cdn.jsdelivr.net/npm/@feathery/react@latest/umd/index.js"
    script.async = true
    script.onload = () => {
      Feathery.init(formId)

      // Update the Feathery user ID to match the Supabase user ID
      if (userId) {
        Feathery.updateUserId(userId)
      }

      Feathery.renderAt(`container_${formId}`, {
        formName,
        initialLoader: {
          show: true,
          loader: `
              <div class="flex flex-col items-center space-y-4">
                <div class="border-t-4 border-primary animate-spin rounded-full w-12 h-12 mb-4"></div>
                <p class="text-lg text-primary-content">Loading form...</p>
              </div>
            `,
          initialContainerHeight: "600px",
          initialContainerWidth: "100%",
        },
        onFormComplete: async (response) => {
          isFormCompleted = true
          responseData = {
            id: response.userId,
          }
          for (const fieldKey in response.fields) {
            if (response.fields.hasOwnProperty(fieldKey)) {
              const field = response.fields[fieldKey]
              const columnName = fieldKey.replace(/[#\s]/g, "_").toLowerCase()
              const fieldValue = Array.isArray(field.value)
                ? field.value.join(", ")
                : field.value

              if (fieldValue !== undefined) {
                responseData[columnName] = fieldValue
              }
            }
          }

          try {
            const { data, error } = await supabase
              .from("survey_response")
              .upsert(responseData, { onConflict: "id" })

            if (error) {
              console.error("Error inserting survey response:", error)
            } else {
              console.log("Survey response inserted successfully:", data)
            }
          } catch (error) {
            console.error("Error inserting survey response:", error)
          }

          dispatch("complete")
          console.log(responseData)
        },
      })
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  })
</script>

<!-- Main form component -->
<div
  class="max-w-2xl mx-auto p-4 bg-green-200 rounded-lg shadow-md overflow-auto"
>
  {#if isFormCompleted}
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-4">Form Completed!</h2>
      {#if userId}
        <p class="text-lg">
          Thank you {$page.data.session?.user.user_metadata.name}
        </p>
      {:else}
        <p class="text-lg">Thank you for submitting the form!</p>
      {/if}
      <button
        class="btn btn-primary mt-6"
        on:click={() => (location.href = "/account")}
      >
        Dashboard
      </button>
    </div>
  {:else}
    <div id="container_{formId}" class="min-h-[90vh] overflow-auto"></div>
  {/if}
</div>
