<!-- FeatheryForm.svelte -->
<script>
  import { session } from "/src/stores/user.ts"
  import { supabase } from "$lib/supabaseClient"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  const formId = "7d624884-1198-4af8-b49d-4b8b5efcb85c"
  const formName = "Customer Survey"

  import { onMount } from "svelte"

  let isFormCompleted = false
  let responseData = null

  onMount(async () => {
    const script = document.createElement("script")
    script.src =
      "https://cdn.jsdelivr.net/npm/@feathery/react@latest/umd/index.js"
    script.async = true
    script.onload = () => {
      Feathery.init(formId)

      // Update the Feathery user ID to match the Supabase user ID
      if ($session && $session.user) {
        Feathery.updateUserId($session.user.id)
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
            id: response.userId, // Set the "ID" field to the User_ID value
          }
          // Iterate over the fields in the response
          for (const fieldKey in response.fields) {
            if (response.fields.hasOwnProperty(fieldKey)) {
              const field = response.fields[fieldKey]
              const columnName = fieldKey.replace(/[#\s]/g, "_").toLowerCase()
              const fieldValue = Array.isArray(field.value)
                ? field.value.join(", ")
                : field.value

              // Only include fields with a defined value
              if (fieldValue !== undefined) {
                responseData[columnName] = fieldValue
              }
            }
          }

          // Insert the filtered responseData object into the database
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
      {#if $session && $session.user}
        <p class="text-lg">
          Thank you, {$session.user.user_metadata.name} (ID: {$session.user
            .id}), for submitting the form!
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

<!-- User authentication status section -->
<!-- <div class="mt-8 text-center">
  {#if !$session}
    <p class="text-lg text-gray-500">Loading user authentication status...</p>
  {:else if $session.user}
    <p class="text-lg text-green-600">
      User authenticated: {$session.user.user_metadata.name} (ID: {$session.user
        .id})
    </p>
  {:else}
    <p class="text-lg text-red-600">User not authenticated</p>
  {/if}
</div> -->
