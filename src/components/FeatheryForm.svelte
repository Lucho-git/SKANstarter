<!-- FeatheryForm.svelte -->
<script context="module">
  export const prerender = true
</script>

<script>
  const formId = "7d624884-1198-4af8-b49d-4b8b5efcb85c"
  const formName = "Customer Survey"

  import { onMount } from "svelte"

  let isFormCompleted = false

  onMount(() => {
    const script = document.createElement("script")
    script.src =
      "https://cdn.jsdelivr.net/npm/@feathery/react@latest/umd/index.js"
    script.async = true
    script.onload = () => {
      Feathery.init(formId)
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
        onFormComplete: () => {
          isFormCompleted = true
        },
      })
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  })
</script>

<div
  class="max-w-2xl mx-auto p-4 bg-green-200 rounded-lg shadow-md overflow-auto"
>
  {#if isFormCompleted}
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-4">Form Completed!</h2>
      <p class="text-lg">Thank you for submitting the form.</p>
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
