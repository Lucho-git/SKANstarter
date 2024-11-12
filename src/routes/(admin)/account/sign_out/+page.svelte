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
      // 1. Kill the session on Supabase backend
      const { error } = await supabase.auth.signOut({
        scope: "global", // This kills all sessions across devices
      })

      if (error) throw error

      // 2. Clear all auth-related items from localStorage
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("sb-") || key.includes("supabase.auth")) {
          localStorage.removeItem(key)
        }
      }

      // 3. Clear cookies if needed (usually handled by Supabase, but being thorough)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      message = "Successfully signed out. Redirecting..."
      toast.success("Successfully signed out")

      // 4. Final verification that session is gone
      const { data: finalCheck } = await supabase.auth.getSession()
      console.log("Final session check:", finalCheck)

      // 5. Redirect
      setTimeout(() => goto("/"), 2000)
    } catch (error) {
      console.error("Signout error:", error)
      message = `Sign-out failed: ${error.message || "Unknown error"}`
      toast.error(message)
    }
  })
</script>

<h1 class="m-6 text-2xl font-bold">{message}</h1>
