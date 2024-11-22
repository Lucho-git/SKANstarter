<script lang="ts">
  import { supabase } from "$lib/supabaseClient"
  let isChecking = false

  export let data
  const { session } = data

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const isTokenExpired = (expiresAt: number): boolean => {
    if (!expiresAt) return true
    const bufferTime = 30
    const currentTime = Math.floor(Date.now() / 1000)
    return currentTime + bufferTime >= expiresAt
  }

  const invalidateRefreshToken = async (refreshToken: string) => {
    try {
      // Attempt to use the refresh token incorrectly to invalidate it
      await supabase.auth.refreshSession({
        refresh_token: refreshToken + "invalid", // Intentionally corrupt the token
      })
    } catch (error) {
      console.log("Refresh token invalidated:", error)
    }
  }

  const checkSessionValidity = async () => {
    try {
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

        // If refresh was successful, simulate token invalidation
        if (refreshData.session) {
          console.log(
            "Token refresh successful, now invalidating refresh token...",
          )
          await invalidateRefreshToken(refreshData.session.refresh_token)
        }

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

      if (window.supabase) {
        // @ts-ignore - directly modify internal state
        window.supabase.auth.session = null
        // @ts-ignore
        window.supabase.auth.user = null
      }

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
      const { error } = await supabase.auth.signOut({ scope: "global" })

      if (error) {
        console.log("Server-side signout failed:", error)
        await forceClientSideSignOut()
      } else {
        console.log("Server-side signout successful")
        await forceClientSideSignOut()
      }
    } catch (error) {
      console.error("Auth clearance error:", error)
      await forceClientSideSignOut()
    }
  }

  const logAuthState = async () => {
    isChecking = true
    try {
      console.group("Auth State Debug Check")
      console.time("Auth Check Duration")

      console.log("Raw Session Data:", session)

      const isSessionExists = !!session
      console.log("Session Exists:", isSessionExists)

      if (isSessionExists) {
        const isAccessTokenExpired = isTokenExpired(session.expires_at)
        console.log("Access Token Expired:", isAccessTokenExpired)

        const sessionStatus = await checkSessionValidity()
        console.log("Session Status:", {
          isValid: sessionStatus.isValid,
          error: sessionStatus.error,
          currentSession: sessionStatus.session,
          refreshAttempted: sessionStatus.refreshAttempted,
        })

        if (sessionStatus.refreshAttempted && sessionStatus.session) {
          console.log("Session Comparison:", {
            oldExpiresAt: session.expires_at,
            newExpiresAt: sessionStatus.session.expires_at,
            tokenChanged:
              session.access_token !== sessionStatus.session.access_token,
          })
        }

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

        console.log("User Details:", {
          id: session?.user?.id,
          email: session?.user?.email,
          lastSignInAt: session?.user?.last_sign_in_at,
          aud: session?.user?.aud,
          role: session?.user?.role,
        })

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        console.log("Supabase Client State:", {
          user: !!user,
          error: userError,
        })
      }

      const authRelatedKeys = Object.keys(localStorage).filter(
        (key) => key.startsWith("sb-") || key.includes("supabase"),
      )
      console.log("Auth-related localStorage keys:", authRelatedKeys)

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
