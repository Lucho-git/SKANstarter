<script lang="ts">
  import { invalidate } from "$app/navigation"
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { browser } from "$app/environment"
  import { subscribeToPushNotifications } from "$lib/pushNotifications"

  export let data

  let { supabase, session } = data
  $: ({ supabase, session } = data)

  function checkAndSubscribe(userId: string) {
    if (browser) {
      console.log("Running in browser environment")
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches
      console.log("Is standalone mode:", isStandalone)

      const isHomepage = $page.url.pathname === "/account"
      console.log("Is homepage:", isHomepage)

      const lastCheckedUserId = localStorage.getItem(
        "lastCheckedPushNotificationsUserId",
      )
      console.log("Last checked user ID:", lastCheckedUserId)

      if (isStandalone && isHomepage && lastCheckedUserId !== userId) {
        console.log("Conditions met, subscribing to push notifications")
        subscribeToPushNotifications(userId)
        localStorage.setItem("lastCheckedPushNotificationsUserId", userId)
        console.log("Push notification check completed for user:", userId)
      } else {
        console.log("Conditions not met for push notification subscription")
      }
    } else {
      console.log("Not running in browser environment")
    }
  }

  onMount(() => {
    console.log("Layout component mounted")

    const { data } = supabase.auth.onAuthStateChange((event, _session) => {
      console.log("Auth state changed:", event)
      if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing last checked user ID")
        localStorage.removeItem("lastCheckedPushNotificationsUserId")
      } else if (_session && _session.user) {
        console.log("User signed in, checking push notifications")
        checkAndSubscribe(_session.user.id)
      }
      if (_session?.expires_at !== session?.expires_at) {
        console.log("Session changed, invalidating auth")
        invalidate("supabase:auth")
      }
    })

    if (session && session.user) {
      checkAndSubscribe(session.user.id)
    }

    return () => {
      console.log("Unsubscribing from auth state changes")
      data.subscription.unsubscribe()
    }
  })
</script>

<slot />
