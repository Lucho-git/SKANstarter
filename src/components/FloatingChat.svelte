<script>
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import {
    subscribeToPushNotifications,
    sendPushNotification,
    getOrCreateDeviceId,
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
    if (isOpen) {
      checkAndUpdateSubscription()
    }
  }

  async function checkAndUpdateSubscription() {
    console.log("Checking and updating subscription...")
    console.log("Notification permission:", Notification.permission)
    console.log("User ID:", userId)

    if (Notification.permission === "granted" && userId) {
      console.log("Getting/Creating device id...")
      const deviceId = await getOrCreateDeviceId()
      console.log("Device ID:", deviceId)

      // Always attempt to create a new subscription
      console.log("Creating new subscription...")
      const result = await subscribeToPushNotifications(userId)
      console.log("Subscription result:", result)
      if (result.success) {
        notificationPermission = "granted"
        console.log("New subscription created successfully")
      } else {
        console.error("Failed to create new subscription:", result.error)
      }
    } else {
      console.log(
        "Notification permission not granted or user ID not available",
      )
    }
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
          .select("subscription, device_type")
          .eq("user_id", userId)

        if (error) throw error

        if (data && data.length > 0) {
          const results = await Promise.all(
            data.map(async (sub) => {
              const subscription = JSON.parse(sub.subscription)
              const result = await sendPushNotification(
                subscription,
                "Test Notification",
                "Hi !",
              )
              return { ...result, deviceType: sub.device_type }
            }),
          )

          const successfulNotifications = results.filter((r) => r.success)
          const successCount = successfulNotifications.length
          const deviceDetails = successfulNotifications
            .map((r) => r.deviceType)
            .join(", ")

          if (successCount > 0) {
            resolve(
              `Test notifications sent successfully to ${successCount} device(s)!\nDevices: ${deviceDetails}`,
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
