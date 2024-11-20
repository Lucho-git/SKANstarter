<script lang="ts">
  import { supabase } from "$lib/supabaseClient"
  let isChecking = false

  // Accept session as a prop
  export let data
  const { session } = data

  const logAuthState = async () => {
    isChecking = true
    try {
      console.group("Auth State Debug Check")
      console.time("Auth Check Duration")

      // Log raw session first
      console.log("Raw Session Data:", session)

      // Then log in the same format as sign-out flow
      console.log("Auth State - Initial State")
      console.log("Session:", {
        sessionId: session?.id,
        accessToken: session?.access_token,
        refreshToken: session?.refresh_token,
        expiresAt: session?.expires_at,
        userId: session?.user?.id,
      })

      console.log("User:", {
        id: session?.user?.id,
        email: session?.user?.email,
        lastSignInAt: session?.user?.last_sign_in_at,
      })
    } catch (error) {
      console.error("Auth Check Error:", error)
    } finally {
      console.timeEnd("Auth Check Duration")
      console.groupEnd()
      isChecking = false
    }
  }
</script>

<div class="fixed bottom-8 left-8 z-50">
  <button
    on:click={logAuthState}
    class="btn btn-circle btn-primary btn-lg"
    disabled={isChecking}
  >
    {#if isChecking}
      <span
        class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
      ></span>
    {:else}
      <i class="at-debug" />
    {/if}
  </button>
</div>
