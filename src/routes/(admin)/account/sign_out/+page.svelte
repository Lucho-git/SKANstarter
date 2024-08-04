<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"

  export let data

  let { supabase } = data
  let message = "Signing out..."

  onMount(async () => {
    console.log("Signout Attempt")
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear local storage
      localStorage.removeItem("supabase.auth.token")
      // Add any other items that need to be cleared

      message = "Successfully signed out. Redirecting..."
      toast.success("Successfully signed out")
      setTimeout(() => goto("/"), 2000)
    } catch (error) {
      console.error("Error during sign-out:", error)
      message = "There was an issue signing out. Please try again."
      toast.error("Sign-out failed. Please try again.")
    }
  })
</script>

<h1 class="text-2xl font-bold m-6">{message}</h1>
