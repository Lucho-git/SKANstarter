<script>
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import {
    subscribeToPushNotifications,
    sendPushNotification,
  } from "$lib/pushNotifications"
  import { supabase } from "$lib/supabaseClient"

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
    try {
      const permission = await Notification.requestPermission()
      notificationPermission = permission

      if (permission === "granted" && userId) {
        await subscribeToPushNotifications(userId)
      }
    } catch (error) {
      console.error("Error enabling notifications:", error)
    }
  }

  async function testPushNotification() {
    try {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("subscription")
        .eq("user_id", userId)
        .single()

      if (error) throw error

      if (data) {
        const subscription = JSON.parse(data.subscription)
        await sendPushNotification(
          subscription,
          "Test Notification",
          "This is a test push notification!",
        )
      } else {
        console.error("No subscription found for this user")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
    }
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
          <button class="btn btn-primary" on:click={enableNotifications}
            >Enable Notifications</button
          >
        {:else}
          <button class="btn btn-secondary" on:click={testPushNotification}
            >Test Push Notification</button
          >
        {/if}
      </div>
    </div>
  {/if}
</div>
