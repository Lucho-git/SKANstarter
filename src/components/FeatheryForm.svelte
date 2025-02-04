<!-- FeatheryForm.svelte -->
<script>
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { supabase } from "$lib/supabaseClient"
  import { createEventDispatcher } from "svelte"
  import { goto } from "$app/navigation"

  const dispatch = createEventDispatcher()

  const formId = "7d624884-1198-4af8-b49d-4b8b5efcb85c"
  const formName = "AgSkan SurveyReal"

  let isFormCompleted = false
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

          const processedFields = {}
          for (const [key, field] of Object.entries(response.fields)) {
            if (!key.startsWith("feathery.")) {
              processedFields[key] = field.value || null
            }
          }

          try {
            const { error } = await supabase.from("user_survey").upsert(
              {
                user_id: userId,
                response: {
                  answers: processedFields,
                  form_id: formId,
                  form_name: formName,
                  submitted_at: new Date().toISOString(),
                },
              },
              {
                onConflict: "user_id",
              },
            )

            if (error) {
              console.error("Error storing survey response:", error)
            } else {
              console.log("Survey response stored successfully")
              dispatch("complete")
              // Redirect to payment plans after successful storage
              goto("/account/payment_plans")
            }
          } catch (error) {
            console.error("Error storing survey response:", error)
          }
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
  class="mx-auto max-w-2xl overflow-auto rounded-lg bg-green-200 p-4 shadow-md"
>
  <div id="container_{formId}" class="min-h-[90vh] overflow-auto"></div>
</div>
