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

  onMount(async () => {
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

      // 3. Only throw if it's not a 403
      if (error && error.status !== 403) {
        throw error
      }

      message = "Successfully signed out. Redirecting..."
      console.log("Sign-out successful, preparing to redirect...")
      toast.success("Successfully signed out")

      // 4. Final session check for debugging
      const { data: finalSession } = await supabase.auth.getSession()
      console.log("Final session state:", finalSession)

      // 5. Force a complete page refresh
      console.log("Redirecting to login...")
      window.location.href = "/login"
    } catch (error) {
      console.error("Sign-out error details:", error)
      console.log("Error type:", typeof error)
      console.log("Error message:", error.message)
      console.log("Error stack:", error.stack)

      // Still clear local storage even on error
      clearLocalStorage()

      toast.error("Sign-out failed, redirecting anyway...")
      window.location.href = "/login"
    }
  })
</script>

<h1 class="m-6 text-2xl font-bold">{message}</h1>
