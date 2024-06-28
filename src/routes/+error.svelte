<script>
  import "../app.css"
  import { dev } from "$app/environment"
  import { page } from "$app/stores"

  let parsedError
  try {
    parsedError = JSON.parse($page.error.message)
  } catch {
    parsedError = $page.error
  }

  const error = parsedError

  console.log("page", $page)
  console.error("Error occurred:", error)
  console.error("URL:", $page.url.href)

  const stackTrace = error.stack || new Error().stack
  console.error("Stack trace:", stackTrace)
</script>

<div class="hero min-h-[100vh] bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="text-5xl font-bold mb-6">This is embarrassing...</h1>
      <p class="text-2xl mb-4">
        {error.userMessage || error.message}
      </p>
      {#if error.id || error.errorId}
        <p class="text-xl mb-4">Error ID: {error.id || error.errorId}</p>
      {/if}
      {#if dev}
        <p class="text-lg mb-2">URL: {$page.url.href}</p>
        <p class="text-lg mb-4">Status: {$page.status}</p>
      {/if}
      <div class="flex justify-center space-x-4 mt-6 mb-6">
        <a href="/" class="btn btn-primary btn-wide">Return Home</a>
        <a href="/account/" class="btn btn-info btn-wide">Dashboard</a>
      </div>
    </div>
  </div>
</div>
