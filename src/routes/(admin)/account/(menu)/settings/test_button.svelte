<script lang="ts">
  import { supabase } from "$lib/supabaseClient"
  let isChecking = false

  // Accept session as a prop
  export let data
  const { session } = data

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const isTokenExpired = (expiresAt: number): boolean => {
    if (!expiresAt) return true
    // Add a 30-second buffer
    const bufferTime = 30
    const currentTime = Math.floor(Date.now() / 1000)
    return currentTime + bufferTime >= expiresAt
  }

  const checkSessionValidity = async () => {
    try {
      // First try to get the current session
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      // If no current session, try to refresh using the refresh token
      if (!currentSession && session?.refresh_token) {
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession({
            refresh_token: session.refresh_token,
          })

        return {
          isValid: !!refreshData.session,
          session: refreshData.session,
          error: refreshError,
          refreshAttempted: true,
        }
      }

      return {
        isValid: !!currentSession,
        session: currentSession,
        error: sessionError,
        refreshAttempted: false,
      }
    } catch (error) {
      console.error("Error checking session:", error)
      return {
        isValid: false,
        error,
        refreshAttempted: false,
      }
    }
  }

  async function forceClientSideSignOut() {
    try {
      console.log("Waiting 8 seconds before force sign out...")
      await delay(8000)
      console.log("Executing force sign out...")

      // Clear all Supabase-related localStorage items
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key?.startsWith("sb-") ||
          key?.includes("supabase") ||
          key?.includes("auth")
        ) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Clear any in-memory session state
      if (window.supabase) {
        // @ts-ignore - directly modify internal state
        window.supabase.auth.session = null
        // @ts-ignore
        window.supabase.auth.user = null
      }

      // Clear auth-related cookies
      document.cookie.split(";").forEach(function (c) {
        if (c.includes("sb-") || c.includes("supabase")) {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        }
      })

      console.log("Client-side auth state cleared")
      window.location.href = "/login?force=true"
    } catch (error) {
      console.error("Force client sign out error:", error)
      localStorage.clear()
      window.location.href = "/login?force=true"
    }
  }

  const clearAuthState = async () => {
    try {
      // Try server-side signout first
      const { error } = await supabase.auth.signOut({ scope: "global" })

      if (error) {
        console.log("Server-side signout failed:", error)
        // If server-side fails, fall back to client-side cleanup
        await forceClientSideSignOut()
      } else {
        console.log("Server-side signout successful")
        // Still perform client cleanup to be thorough
        await forceClientSideSignOut()
      }
    } catch (error) {
      console.error("Auth clearance error:", error)
      // Final fallback
      await forceClientSideSignOut()
    }
  }

  const logAuthState = async () => {
    isChecking = true
    try {
      console.group("Auth State Debug Check")
      console.time("Auth Check Duration")

      // Log raw session first
      console.log("Raw Session Data:", session)

      // Check if session exists
      const isSessionExists = !!session
      console.log("Session Exists:", isSessionExists)

      if (isSessionExists) {
        // Check access token expiration
        const isAccessTokenExpired = isTokenExpired(session.expires_at)
        console.log("Access Token Expired:", isAccessTokenExpired)

        // Check session validity
        const sessionStatus = await checkSessionValidity()
        console.log("Session Status:", {
          isValid: sessionStatus.isValid,
          error: sessionStatus.error,
          currentSession: sessionStatus.session,
          refreshAttempted: sessionStatus.refreshAttempted,
        })

        // Compare old and new sessions if refresh was successful
        if (sessionStatus.refreshAttempted && sessionStatus.session) {
          console.log("Session Comparison:", {
            oldExpiresAt: session.expires_at,
            newExpiresAt: sessionStatus.session.expires_at,
            tokenChanged:
              session.access_token !== sessionStatus.session.access_token,
          })
        }

        // Log formatted session info
        console.log("Session Details:", {
          sessionId: session?.id,
          accessToken: session?.access_token
            ? `${session.access_token.substring(0, 20)}...`
            : null,
          refreshToken: session?.refresh_token
            ? `${session.refresh_token.substring(0, 20)}...`
            : null,
          expiresAt: session?.expires_at,
          expiresIn: session?.expires_at
            ? `${Math.floor((session.expires_at * 1000 - Date.now()) / 1000)}s`
            : null,
          userId: session?.user?.id,
        })

        // Log user info
        console.log("User Details:", {
          id: session?.user?.id,
          email: session?.user?.email,
          lastSignInAt: session?.user?.last_sign_in_at,
          aud: session?.user?.aud,
          role: session?.user?.role,
        })

        // Log Supabase client auth state
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        console.log("Supabase Client State:", {
          user: !!user,
          error: userError,
        })
      }

      // Log localStorage keys related to auth
      const authRelatedKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith("sb-") || key.includes("supabase"),
      )
      console.log("Auth-related localStorage keys:", authRelatedKeys)

      // After logging everything, attempt to clear auth state
      console.log("Attempting to clear auth state...")
      await clearAuthState()
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
