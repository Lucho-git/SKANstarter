<script>
  import { toast } from "svelte-sonner"

  async function triggerEdgeFunction() {
    const response = await fetch(
      "https://hmxxqacnzxqpcheoeidn.supabase.co/functions/v1/generate-vapid",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteHhxYWNuenhxcGNoZW9laWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwMjY1MDgsImV4cCI6MjAyNDYwMjUwOH0.rFOu8vW3QOCgp1VMIPKc7eF-g_8vok-pazjp7R6TJHs",
          "Content-Type": "application/json",
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      console.log("Edge function response:", data)
      toast.success(data.message || "Edge function executed successfully")
    } else {
      console.error("Error triggering edge function:", response.statusText)
      toast.error("Error triggering edge function: " + response.statusText)
    }
  }
</script>

<div class="fixed bottom-8 right-28 z-50 flex flex-col items-end">
  <button
    class="btn btn-circle btn-lg btn-primary"
    on:click={triggerEdgeFunction}
  >
    <i class="at-audio-wave"></i>
  </button>
</div>
