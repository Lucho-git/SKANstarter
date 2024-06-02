<script>
  import "../app.css"
  import { dev } from "$app/environment"
  import { page } from "$app/stores"

  const error = $page.error

  // Log the error details
  console.error("Error occurred:", error)

  // Log the URL that triggered the error
  console.error("URL:", $page.url.href)

  // Capture the stack trace
  const stackTrace = new Error().stack
  console.error("Stack trace:", stackTrace)
</script>

<div class="hero min-h-[100vh] bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="text-5xl font-bold">This is embarrassing...</h1>
      <p class="py-6 text-2xl">There was an error: {error.message}</p>

      {#if dev}
        <pre class="text-left">{stackTrace}</pre>
      {/if}

      <div>
        <a href="/" class="btn btn-primary btn-wide">Return Home</a>
      </div>
    </div>
  </div>
</div>
