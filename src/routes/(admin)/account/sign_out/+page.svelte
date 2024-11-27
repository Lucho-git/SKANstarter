<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"
  import { invalidate } from "$app/navigation"

  export let data
  let { supabase } = data
  let message = "Signing out..."
  let isSigningOut = false
  const REDIRECT_DELAY = 3000 // 3 seconds delay

  const logAuthState = async (stage: string) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.group(`Auth State - ${stage}`)
      console.log("Session:", {
        sessionId: session?.session?.id,
        accessToken: session?.session?.access_token?.substring(0, 20) + "...",
        refreshToken: session?.session?.refresh_token?.substring(0, 20) + "...",
        expiresAt: session?.session?.expires_at,
        userId: session?.session?.user?.id,
      })
      console.log("User:", {
        id: user?.id,
        email: user?.email,
        lastSignInAt: user?.last_sign_in_at,
      })
      console.groupEnd()
      return session
    } catch (error) {
      console.error(`Error logging auth state at ${stage}:`, error)
      return null
    }
  }

  const clearLocalStorage = () => {
    console.group("Local Storage Cleanup")
    const keysToRemove: string[] = []

    try {
      // Log all existing keys first
      console.log("Existing localStorage keys:", Object.keys(localStorage))

      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          keysToRemove.push(key)
          localStorage.removeItem(key)
        }
      }
      console.log("Removed storage keys:", keysToRemove)

      // Clear all cookies
      console.log("Clearing all cookies...")
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim()
        if (name.startsWith("sb-")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          console.log(`Cleared cookie: ${name}`)
        }
      })
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
    console.groupEnd()
  }

  const delayedRedirect = (url: string) => {
    message = "Logout complete. Redirecting in 3 seconds..."
    console.log(`Will redirect to ${url} in ${REDIRECT_DELAY}ms`)
    return new Promise((resolve) => {
      setTimeout(() => {
        window.location.href = url
        resolve(null)
      }, REDIRECT_DELAY)
    })
  }

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log("Sign-out already in progress")
      return
    }

    isSigningOut = true
    console.group("Sign-out Process")
    console.time("Total Sign-out Duration")

    try {
      // 1. Initial state logging
      console.log("Step 1: Checking initial state")
      const initialSession = await logAuthState("Initial State")

      // 2. Attempt global signOut first, while we still have valid tokens
      console.log("Step 2: Executing global sign-out")
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        console.warn("SignOut error:", signOutError)
        if (signOutError.status !== 403) {
          throw signOutError
        }
      }

      // 3. Now clear storage after sign-out attempt
      console.log("Step 3: Clearing local storage")
      clearLocalStorage()

      // 4. Final session check
      console.log("Step 4: Final session verification")
      const finalState = await logAuthState("Post-Signout")

      if (finalState?.session) {
        console.warn("Warning: Session still persists after cleanup")
        await delayedRedirect("/login?force_logout=true")
      } else {
        console.log("Success: Session cleared successfully")
        await delayedRedirect("/login")
      }
    } catch (error) {
      console.group("Sign-out Error Details")
      console.error("Sign-out failed:", error)
      console.log("Error type:", typeof error)
      console.log("Error message:", error.message)
      console.log("Error stack:", error.stack)
      console.groupEnd()

      // Force cleanup and redirect only after sign-out attempt
      clearLocalStorage()
      await delayedRedirect("/login?error=true")
    } finally {
      console.timeEnd("Total Sign-out Duration")
      console.groupEnd()
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
