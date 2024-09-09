<script>
  import "../app.css"
  import { dev } from "$app/environment"
  import { page } from "$app/stores"
  import Icon from "@iconify/svelte"

  let parsedError
  try {
    parsedError = JSON.parse($page.error.message)
  } catch {
    parsedError = $page.error
  }

  const error = parsedError
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
  <div class="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
    <div class="mb-8 flex justify-center">
      <div class="rounded-full bg-red-100 p-4">
        <Icon
          icon="solar:danger-triangle-bold-duotone"
          width="64"
          height="64"
          style="color: #EF4444"
        />
      </div>
    </div>
    <h1 class="mb-4 text-center text-4xl font-extrabold text-gray-900">
      Error Encountered
    </h1>
    <p class="mb-6 text-center text-xl text-gray-700">
      {error.userMessage || error.message}
    </p>
    {#if error.id || error.errorId}
      <p class="mb-4 text-center text-sm text-gray-500">
        Error ID: {error.id || error.errorId}
      </p>
    {/if}
    <div class="mb-8 flex items-center justify-center">
      <Icon icon="solar:sledgehammer-bold-duotone" width="24" height="24" />
      <p class="text-center text-lg text-blue-600">
        Our team is working on a fix!
      </p>
    </div>
    <div class="flex justify-center space-x-4">
      <a href="/" class="btn btn-primary">
        <Icon
          icon="solar:home-2-bold-duotone"
          width="20"
          height="20"
          style="margin-right: 8px"
        />
        Home
      </a>
      <a href="/account/" class="btn btn-secondary">
        <Icon
          icon="solar:user-bold-duotone"
          width="20"
          height="20"
          style="margin-right: 8px"
        />
        Dashboard
      </a>
    </div>
  </div>
</div>
