<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { userStore } from "../stores/userStore"
  import { Crisp } from "crisp-sdk-web"
  import { screenSize } from "../stores/screenSizeStore"
  import { crispVisibility } from "../stores/crispVisibilityStore"

  let previousScreenSize: string

  $: if ($crispVisibility !== visible) {
    setVisibility($crispVisibility)
    visible = $crispVisibility
    console.log("Updating Crisp Chat", visible)
  }

  export let visible = true

  const WEBSITE_ID = "961bded6-4b5a-45e3-8a71-a57bcc27934a"
  let isInitialized = false

  function initCrispChat() {
    if (!isInitialized) {
      console.log("Initializing Crisp Chat")
      Crisp.configure(WEBSITE_ID, {
        autoload: false,
      })
      isInitialized = true

      // Wait for Crisp to be fully loaded
      const crispInterval = setInterval(() => {
        if (window.$crisp) {
          clearInterval(crispInterval)
          setupCrispEvents()
        }
      }, 100)
    }

    if (isInitialized) {
      setVisibility($crispVisibility)
      console.log("Display Crisp Chat?", $crispVisibility)
      Crisp.chat.show()
    }

    setUserInfo()
  }

  function setupCrispEvents() {
    window.$crisp.push(["on", "session:loaded", handleNewMessage])
  }

  function handleNewMessage() {
    window.$crisp.push([
      "on",
      "message:received",
      (message) => {
        console.log("New message received:", message, visible)
        if (!visible) {
          // Show a toast notification
          console.log("New message received! Check your chat.")
        }
      },
    ])
  }

  function setVisibility(isVisible: boolean) {
    if (isInitialized) {
      const crispElement = document.querySelector(".crisp-client")
      if (crispElement) {
        crispElement.style.display = isVisible ? "block" : "none"
      }
    }
  }

  function setUserInfo() {
    if (isInitialized && $userStore.id) {
      console.log("Setting Crisp Chat user info")
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
    console.log("Mounting Crisp Chat component")
    initCrispChat()
  })

  onDestroy(() => {
    if (isInitialized) {
      console.log("Hiding Crisp Chat on component destroy")
      Crisp.chat.hide()
    }
  })

  $: {
    if (isInitialized && $userStore.id) {
      console.log("User info changed, updating Crisp")
      setUserInfo()
    }
  }
</script>
