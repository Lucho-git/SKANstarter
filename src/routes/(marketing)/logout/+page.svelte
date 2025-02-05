<!-- routes/logout/+page.svelte -->
<script lang="ts">
  import { supabase } from "$lib/supabaseClient"
  import { invalidateAll } from "$app/navigation"
  import { page } from "$app/stores"
  import { enhance } from "$app/forms"

  let sessionData: any = null
  let logoutStatus: string = ""
  let loading: boolean = false
  let error: string = ""
  let cookies: { name: string; value: string }[] = []

  async function findSession() {
    try {
      loading = true
      error = ""

      // Get session from page data
      sessionData = $page.data.session

      // Log the raw session data
      console.log("Raw session data:", $page.data.session)

      // Parse and store cookies
      cookies = document.cookie
        .split(";")
        .map((cookie) => {
          const [name, value] = cookie.trim().split("=")
          return { name, value }
        })
        .filter(
          (cookie) =>
            cookie.name.includes("supabase") || cookie.name.includes("sb-"),
        )

      console.log("Current cookies:", cookies)

      if (sessionData) {
        // Update the session data to match the structure we're displaying
        sessionData = {
          id: sessionData.user?.id,
          email: sessionData.user?.email,
          provider: sessionData.user?.app_metadata?.provider,
          expiresAt: sessionData.expires_at,
        }

        // Log the processed session data
        console.log("Processed session data:", sessionData)
        logoutStatus = ""
      } else {
        sessionData = null
        logoutStatus = "No active session found"
      }
    } catch (e) {
      error = e.message || "Failed to fetch session"
      sessionData = null
    } finally {
      loading = false
    }
  }

  async function handleLogout() {
    try {
      loading = true
      error = ""

      // First, clear all browser storage
      const clearBrowserStorage = () => {
        // Clear localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.includes("supabase") || key?.includes("sb-")) {
            localStorage.removeItem(key)
          }
        }

        // Clear sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key?.includes("supabase") || key?.includes("sb-")) {
            sessionStorage.removeItem(key)
          }
        }

        // Clear cookies - try multiple domain variations
        const domains = [
          window.location.hostname,
          `.${window.location.hostname}`,
          window.location.hostname.split(".").slice(1).join("."),
          "",
        ]

        const paths = ["/", ""]

        document.cookie.split(";").forEach((cookie) => {
          const name = cookie.split("=")[0].trim()
          if (name.includes("supabase") || name.includes("sb-")) {
            domains.forEach((domain) => {
              paths.forEach((path) => {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ""}`
              })
            })
          }
        })
      }

      // Call server-side logout action first
      const formData = new FormData()
      const response = await fetch("?/logout", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Server-side logout failed")
      }

      // Sign out from Supabase client
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "global",
      })

      if (signOutError) throw signOutError

      // Clear browser storage
      clearBrowserStorage()

      // Force reload all data
      await invalidateAll()

      // Reset local state
      sessionData = null
      cookies = []
      logoutStatus = "Successfully logged out and cleared session"

      // Log cleanup attempt
      console.log("Initial cleanup completed")

      // Verify after a delay
      setTimeout(async () => {
        // Clear storage again to be sure
        clearBrowserStorage()

        logoutStatus = "Verifying session state..."
        await findSession()

        // Check if session still exists
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session || sessionData) {
          console.log("Session still detected - attempting final cleanup")
          // If session still exists, try one last time with a page reload
          logoutStatus = "Session still detected - forcing page reload..."

          // Final cleanup attempt
          await supabase.auth.signOut({ scope: "global" })
          clearBrowserStorage()

          // Redirect to login page
          window.location.href = "/login"
        } else {
          logoutStatus = "Verification complete: No active session found"
          console.log("Logout successful - no session detected")
        }
      }, 2000)
    } catch (e) {
      console.error("Logout error:", e)
      error = e.message || "Failed to logout"

      // Attempt recovery
      try {
        clearBrowserStorage()
        await supabase.auth.signOut({ scope: "global" })
      } catch (recoveryError) {
        console.error("Recovery attempt failed:", recoveryError)
      }
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-md space-y-8">
    <div class="text-center">
      <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
        Session Management
      </h2>
    </div>

    <!-- Error Display -->
    {#if error}
      <div
        class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
        role="alert"
      >
        <span class="block sm:inline">{error}</span>
      </div>
    {/if}

    <!-- Buttons -->
    <div class="space-y-4">
      <button
        on:click={findSession}
        disabled={loading}
        class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Find Session"}
      </button>

      {#if sessionData}
        <form
          method="POST"
          action="?/logout"
          use:enhance={() => {
            loading = true
            return async ({ result }) => {
              if (result.error) {
                error = result.error
              }
              await handleLogout()
            }
          }}
        >
          <button
            type="submit"
            disabled={loading}
            class="flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Logout"}
          </button>
        </form>
      {/if}
    </div>

    <!-- Session Data Display -->
    {#if sessionData}
      <div class="overflow-hidden bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Active Session Found
          </h3>
        </div>
        <div class="border-t border-gray-200">
          <dl>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">User ID</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {sessionData.id}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {sessionData.email}
              </dd>
            </div>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Provider</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {sessionData.provider}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Expires At</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(sessionData.expiresAt * 1000).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    {/if}

    <!-- Cookie Data Display -->
    {#if cookies.length > 0}
      <div class="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Active Cookies Found
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Supabase-related cookies currently stored in browser
          </p>
        </div>
        <div class="border-t border-gray-200">
          <dl>
            {#each cookies as cookie}
              <div
                class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
              >
                <dt class="break-all text-sm font-medium text-gray-500">
                  {cookie.name}
                </dt>
                <dd
                  class="mt-1 break-all text-sm text-gray-900 sm:col-span-2 sm:mt-0"
                >
                  {cookie.value}
                </dd>
              </div>
            {/each}
          </dl>
        </div>
      </div>
    {/if}

    <!-- Logout Status -->
    {#if logoutStatus}
      <div
        class="relative rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700"
        role="alert"
      >
        <span class="block sm:inline">{logoutStatus}</span>
      </div>
    {/if}
  </div>
</div>
