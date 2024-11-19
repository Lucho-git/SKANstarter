<script lang="ts">
  import { invalidate } from "$app/navigation"
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { browser } from "$app/environment"
  import { subscribeToPushNotifications } from "$lib/pushNotifications"
  import { fly } from "svelte/transition"
  import { toast } from "svelte-sonner"

  export let data

  let { supabase, session } = data
  $: ({ supabase, session } = data)

  const TWO_DAYS_MS = 24 * 60 * 60 * 1000
  let showNotificationBanner = false
  let authStateUnsubscribe: (() => void) | null = null

  function closeBanner() {
    showNotificationBanner = false
    localStorage.setItem(
      "notificationBannerInteraction",
      new Date().getTime().toString(),
    )
  }

  async function requestPushNotification() {
    if (!session?.user) {
      console.log("No active session for push notification request")
      return
    }

    toast.promise(subscribeToPushNotifications(session.user.id), {
      loading: "Enabling notifications...",
      success: (result) => {
        if (result.success) {
          showNotificationBanner = false
          localStorage.setItem(
            "notificationBannerInteraction",
            new Date().getTime().toString(),
          )
          return "Notifications enabled successfully!"
        }
        throw new Error("Failed to enable notifications")
      },
      error: (error) => `Error: ${error.message}`,
    })
  }

  function checkAndSubscribe(userId: string) {
    if (!browser) {
      console.log("Not running in browser environment")
      return
    }

    if (Notification.permission === "granted") {
      console.log("Push notifications already enabled")
      return
    }

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isHomepage = $page.url.pathname === "/account"
    console.log(
      "Environment check - Standalone:",
      isStandalone,
      "Homepage:",
      isHomepage,
    )

    const lastCheckedUserId = localStorage.getItem(
      "lastCheckedPushNotificationsUserId",
    )
    const lastCheckedTime = parseInt(
      localStorage.getItem("lastCheckedPushNotificationsTime") || "0",
    )
    const currentTime = new Date().getTime()
    const timeSinceLastCheck = currentTime - lastCheckedTime

    const shouldCheck =
      lastCheckedUserId !== userId ||
      !lastCheckedTime ||
      timeSinceLastCheck > TWO_DAYS_MS

    console.log(
      "Check conditions - Should check:",
      shouldCheck,
      "Time since last check:",
      timeSinceLastCheck,
    )

    if (isStandalone && isHomepage && shouldCheck) {
      console.log("Showing notification banner")
      setTimeout(() => {
        showNotificationBanner = true
      }, 2000)
      localStorage.setItem("lastCheckedPushNotificationsUserId", userId)
      localStorage.setItem(
        "lastCheckedPushNotificationsTime",
        currentTime.toString(),
      )
    }
  }

  function handleAuthStateChange(event: string, _session: any) {
    console.log(
      `Auth state change: ${event}`,
      _session ? "Session exists" : "No session",
    )

    if (event === "SIGNED_OUT") {
      console.log("Clearing notification check data")
      localStorage.removeItem("lastCheckedPushNotificationsUserId")
      localStorage.removeItem("lastCheckedPushNotificationsTime")
      showNotificationBanner = false
    } else if (_session?.user) {
      checkAndSubscribe(_session.user.id)
    }

    if (
      ["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED", "TOKEN_REFRESHED"].includes(
        event,
      )
    ) {
      console.log(`Invalidating auth due to ${event}`)
      invalidate("supabase:auth")
    }
  }

  onMount(() => {
    console.log("Layout mounted", session ? "With session" : "No session")

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      handleAuthStateChange,
    )
    authStateUnsubscribe = authSubscription.subscription.unsubscribe

    if (session?.user) {
      checkAndSubscribe(session.user.id)
    }

    return () => {
      console.log("Layout unmounting, cleaning up subscriptions")
      if (authStateUnsubscribe) {
        authStateUnsubscribe()
      }
    }
  })
</script>

{#if showNotificationBanner}
  <div
    class="fixed left-0 right-0 top-2 z-50 flex justify-center"
    transition:fly={{ y: -100, duration: 500 }}
  >
    <div
      class="mx-4 w-full rounded-lg bg-secondary p-6 text-secondary-content shadow-lg md:mx-0 md:w-2/3 lg:w-1/3"
    >
      <div class="mb-6 flex items-start">
        <div class="mr-6 flex-shrink-0">
          <i class="at-bell-check p-2 text-4xl"></i>
        </div>
        <p class="flex-grow pr-4 text-sm md:text-base">
          We'd like to show you notifications for the latest developments to
          your farm
        </p>
        <button
          class="ml-4 flex-shrink-0 text-secondary-content hover:text-primary"
          on:click={closeBanner}
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <button
        class="btn btn-primary w-full px-6 py-3"
        on:click={requestPushNotification}
      >
        Get notifications
      </button>
    </div>
  </div>
{/if}

<slot />
