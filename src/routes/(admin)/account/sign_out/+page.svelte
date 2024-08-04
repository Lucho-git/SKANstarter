<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"

  export let data

  let { supabase } = data
  let message = "Signing out..."

  onMount(async () => {
    console.log("Signout Attempt Started")
    try {
      // Log the current session state
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()
      console.log("Current session state:", sessionData, sessionError)

      // Attempt to refresh the session
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession()
      console.log("Session refresh attempt:", refreshData, refreshError)

      // Attempt to sign out
      const { error } = await supabase.auth.signOut()
      console.log("Signout attempt result:", error)

      if (error) throw error

      // Clear local storage
      console.log("Local storage before clearing:", localStorage)
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("supabase.auth.expires_at")
      localStorage.removeItem("supabase.auth.refresh_token")
      console.log("Local storage after clearing:", localStorage)

      message = "Successfully signed out. Redirecting..."
      toast.success("Successfully signed out")
      setTimeout(() => goto("/"), 2000)
    } catch (error) {
      console.error("Detailed error during sign-out:", error)
      if (error.message) {
        console.error("Error message:", error.message)
      }
      if (error.status) {
        console.error("Error status:", error.status)
      }
      message = `Sign-out failed: ${error.message || "Unknown error"}`
      toast.error(message)
    }

    // Final check of auth state
    const { data: finalSessionData } = await supabase.auth.getSession()
    console.log("Final session state after signout attempt:", finalSessionData)
  })
</script>

<h1 class="text-2xl font-bold m-6">{message}</h1>
