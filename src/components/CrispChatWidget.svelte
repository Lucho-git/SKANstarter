<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { userStore } from "../stores/userStore"
  import { Crisp } from "crisp-sdk-web"

  const WEBSITE_ID = "961bded6-4b5a-45e3-8a71-a57bcc27934a"
  let isInitialized = false
  export let visible = false

  function setupCrispEventListeners() {
    window.$crisp.push([
      "on",
      "chat:closed",
      () => {
        console.log("Crisp chat closed by widget")
        if (visible) {
          toggleChat()
        }
      },
    ])
  }

  function initCrispChat() {
    if (!isInitialized) {
      console.log("Initializing Crisp Chat")
      Crisp.configure(WEBSITE_ID, {
        autoload: true,
      })

      // Wait for Crisp to load then hide it and setup listeners
      const crispInterval = setInterval(() => {
        if (window.$crisp) {
          clearInterval(crispInterval)
          updateCrispVisibility(false)
          setupCrispEventListeners()
        }
      }, 100)

      isInitialized = true
    }
  }

  function updateCrispVisibility(isVisible: boolean) {
    const crispFrame = document.querySelector(".crisp-client")
    if (crispFrame) {
      crispFrame.classList.toggle("crisp-hidden", !isVisible)
    }
  }

  export function toggleChat() {
    console.log("Toggle chat called. Current visible state:", visible)

    if (!isInitialized) {
      console.log("Initializing chat first...")
      initCrispChat()
    }

    const newVisibility = !visible
    visible = newVisibility

    if (!newVisibility) {
      console.log("Closing chat")
      updateCrispVisibility(false)
    } else {
      console.log("Opening chat")
      updateCrispVisibility(true)
      Crisp.chat.open()
    }

    console.log("New visible state:", visible)
  }

  function setUserInfo() {
    if (isInitialized && $userStore.id) {
      Crisp.user.setEmail($userStore.email)
      Crisp.user.setNickname($userStore.fullName)
      if ($userStore.phone) {
        Crisp.user.setPhone($userStore.phone)
      }
      Crisp.session.setData({
        company: $userStore.companyName,
        website: $userStore.website,
      })
    }
  }

  onMount(() => {
    console.log("Component mounted")
    initCrispChat()
  })

  onDestroy(() => {
    if (isInitialized) {
      console.log("Hiding chat on destroy")
      updateCrispVisibility(false)
    }
  })

  $: if (isInitialized && $userStore.id) {
    setUserInfo()
  }
</script>

<style>
  :global(.crisp-hidden) {
    display: none !important;
  }
</style>
