<script>
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import {
    subscribeToPushNotifications,
    sendPushNotification,
  } from "$lib/pushNotifications"
  import { supabase } from "$lib/supabaseClient"
  import { toast } from "svelte-sonner"

  let isOpen = false
  let notificationPermission = "default"
  let userId

  onMount(async () => {
    notificationPermission = Notification.permission
    const session = $page.data.session
    if (session) {
      userId = session.user.id
    }
  })

  function toggleChat() {
    isOpen = !isOpen
  }

  async function enableNotifications() {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const permission = await Notification.requestPermission()
        notificationPermission = permission

        if (permission === "granted" && userId) {
          const result = await subscribeToPushNotifications(userId)
          if (result.success) {
            resolve("Notifications enabled successfully!")
          } else {
            reject(new Error(result.error || "Failed to enable notifications"))
          }
        } else {
          reject(new Error("Permission not granted or user ID not available"))
        }
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(promise, {
      loading: "Enabling notifications...",
      success: (data) => data,
      error: (error) => `Error: ${error.message}`,
    })
  }

  async function testPushNotification() {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from("push_subscriptions")
          .select("subscription")
          .eq("user_id", userId)
          .single()

        if (error) throw error

        if (data) {
          const subscription = JSON.parse(data.subscription)
          const result = await sendPushNotification(
            subscription,
            "Test Notification",
            "Hi !",
          )

          if (result.success) {
            resolve("Test notification sent successfully!")
          } else {
            reject(new Error(result.error || "Failed to send notification"))
          }
        } else {
          reject(new Error("No subscription found for this user"))
        }
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(promise, {
      loading: "Sending test notification...",
      success: (data) => data,
      error: (error) => `Error: ${error.message}`,
    })
  }
</script>

<div class="fixed bottom-8 right-8 z-50">
  <button class="btn btn-circle btn-lg btn-primary" on:click={toggleChat}>
    <!-- Chat icon -->
  </button>

  {#if isOpen}
    <div class="card w-80 bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title">Chat</h3>
        <!-- Chat interface goes here -->

        {#if notificationPermission !== "granted"}
          <button class="btn btn-primary" on:click={enableNotifications}>
            Enable Notifications
          </button>
        {:else}
          <button class="btn btn-secondary" on:click={testPushNotification}>
            Test Push Notification
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
