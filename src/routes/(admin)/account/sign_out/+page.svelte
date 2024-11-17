<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"
  import { invalidate } from "$app/navigation"

  export let data
  let { supabase } = data
  let message = "Signing out..."

  const clearLocalStorage = () => {
    console.log("Starting local storage cleanup...")
    const keysToRemove = []

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-") || key.includes("supabase")) {
        keysToRemove.push(key)
        localStorage.removeItem(key)
      }
    }

    console.log("Removed local storage keys:", keysToRemove)
  }

  const handleSignOut = async () => {
    console.log("Starting sign-out process...")

    try {
      // 1. Attempt Supabase signout
      console.log("Attempting Supabase signOut...")
      const { error } = await supabase.auth.signOut({
        scope: "global",
      })

      if (error) {
        console.log("SignOut response error:", error)
        console.log("Error status:", error.status)
      } else {
        console.log("Supabase signOut completed without error")
      }

      // 2. Clear local storage REGARDLESS of error
      clearLocalStorage()

      // 3. Check if session is actually gone
      const { data: sessionCheck } = await supabase.auth.getSession()
      console.log("Current session state:", sessionCheck)

      if (sessionCheck?.session) {
        console.log("Session still exists, attempting force cleanup...")
        // Force remove the session
        await supabase.auth.setSession(null)
        clearLocalStorage() // Clear again just to be sure
      }

      message = "Successfully signed out. Redirecting..."
      console.log("Sign-out successful, preparing to redirect...")
      toast.success("Successfully signed out")

      // 4. Final verification
      const { data: finalSession } = await supabase.auth.getSession()
      console.log("Final session state:", finalSession)

      if (!finalSession?.session) {
        console.log("Session successfully cleared, redirecting...")
        window.location.href = "/login"
      } else {
        throw new Error("Failed to clear session")
      }
    } catch (error) {
      console.error("Sign-out error details:", error)
      console.log("Error type:", typeof error)
      console.log("Error message:", error.message)
      console.log("Error stack:", error.stack)

      // Try one last force cleanup
      await supabase.auth.setSession(null)
      clearLocalStorage()

      const { data: emergencySessionCheck } = await supabase.auth.getSession()
      if (emergencySessionCheck?.session) {
        toast.error(
          "Critical: Unable to clear session. Please clear your browser data.",
        )
        // Optionally provide UI guidance for manual cleanup
        message = "Please clear your browser data and try again"
      } else {
        window.location.href = "/login"
      }
    }
  }

  onMount(handleSignOut)
</script>

<h1 class="m-6 text-2xl font-bold">{message}</h1>
