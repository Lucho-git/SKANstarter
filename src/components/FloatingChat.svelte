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

        if (error) throw error

        if (data && data.length > 0) {
          const results = await Promise.all(
            data.map(async (sub) => {
              const subscription = JSON.parse(sub.subscription)
              return sendPushNotification(
                subscription,
                "Test Notification",
                "Hi !",
              )
            }),
          )

          const successCount = results.filter((r) => r.success).length
          if (successCount > 0) {
            resolve(
              `Test notifications sent successfully to ${successCount} device(s)!`,
            )
          } else {
            reject(new Error("Failed to send notifications to any devices"))
          }
        } else {
          reject(new Error("No subscriptions found for this user"))
        }
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(promise, {
      loading: "Sending test notifications...",
      success: (data) => data,
      error: (error) => `Error: ${error.message}`,
    })
  }
</script>

<div class="fixed bottom-8 right-8 z-50 flex flex-col items-end">
  {#if isOpen}
    <div class="card w-80 bg-base-100 shadow-xl mb-4">
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

  <button class="btn btn-circle btn-lg btn-primary" on:click={toggleChat}>
    <i class={isOpen ? "at-bell-minus" : "at-bell-plus"}></i>
  </button>
</div>
