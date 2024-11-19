<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"
  import { invalidate } from "$app/navigation"

  export let data
  let { supabase } = data
  let message = "Signing out..."
  let isSigningOut = false

  const clearLocalStorage = () => {
    console.log("Starting local storage cleanup...")
    const keysToRemove: string[] = []

    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          keysToRemove.push(key)
          localStorage.removeItem(key)
        }
      }
      console.log("Removed storage keys:", keysToRemove)
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }

    // Additional cleanup
    localStorage.removeItem("lastCheckedPushNotificationsUserId")
    localStorage.removeItem("lastCheckedPushNotificationsTime")
    localStorage.removeItem("notificationBannerInteraction")
  }

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log("Sign-out already in progress")
      return
    }

    isSigningOut = true
    console.log("Starting sign-out process...")

    try {
      // 1. Clear storage first
      clearLocalStorage()

      // 2. Check current session
      const { data: currentSession, error: sessionError } =
        await supabase.auth.getSession()
      if (sessionError) {
        console.warn("Error getting session:", sessionError)
      }
      console.log("Current session state:", currentSession)

      // 3. Try to kill session
      if (currentSession?.session) {
        try {
          await supabase.auth.setSession(null)
        } catch (error) {
          console.log("Expected setSession error:", error)
        }
      }

      // 4. Attempt signOut
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "global",
      })

      if (signOutError) {
        console.warn("SignOut error:", signOutError)
        if (signOutError.status !== 403) {
          throw signOutError
        }
      }

      // 5. Double-check storage
      clearLocalStorage()

      // 6. Verify session state
      const { data: finalCheck } = await supabase.auth.getSession()

      if (finalCheck?.session) {
        console.warn("Session persists after cleanup")
        window.location.href = "/login?force_logout=true"
      } else {
        console.log("Session cleared successfully")
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Sign-out failed:", error)
      console.log({
        type: typeof error,
        message: error.message,
        stack: error.stack,
      })

      // Force cleanup
      clearLocalStorage()
      window.location.href = "/login?error=true"
    } finally {
      isSigningOut = false
    }
  }

  onMount(() => {
    console.log("Sign-out page mounted")
    handleSignOut()
  })
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="text-center">
    <h1 class="m-6 text-2xl font-bold">{message}</h1>
    {#if isSigningOut}
      <div class="loading loading-spinner loading-lg"></div>
    {/if}
  </div>
</div>
