<!-- FloatingChat.svelte -->
<script>
  import { onMount } from "svelte"
  import { subscribeToPushNotifications } from "$lib/pushNotifications"

  let isOpen = false
  let notificationPermission = "default"

  onMount(async () => {
    notificationPermission = Notification.permission
  })

  function toggleChat() {
    isOpen = !isOpen
  }

  async function enableNotifications() {
    try {
      const permission = await Notification.requestPermission()
      notificationPermission = permission
      if (permission === "granted") {
        await subscribeToPushNotifications()
      }
    } catch (error) {
      console.error("Error enabling notifications:", error)
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
          <button on:click={enableNotifications}> Enable Notifications </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
