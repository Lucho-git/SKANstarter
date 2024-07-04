<!-- JivoChatWidget.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { userStore } from "../stores/userStore"

  export let visible = true

  let isInitialized = false

  function initJivoChat() {
    if (typeof window.jivo_api !== "undefined") {
      console.log("Initializing JivoChat")
      isInitialized = true
      if (visible) {
        window.jivo_api.open()
      } else {
        window.jivo_api.close()
      }
      setContactInfo()
    } else if (typeof window.jivo_init === "function") {
      console.log("JivoChat API not fully loaded, initializing")
      window.jivo_init()
      setTimeout(initJivoChat, 1000) // Check again after initialization
    } else {
      console.log("JivoChat API not available, retrying in 1 second")
      setTimeout(initJivoChat, 1000)
    }
  }

  function setContactInfo() {
    if (isInitialized && $userStore.id) {
      const contactInfo = {
        name: $userStore.fullName || "",
        email: $userStore.email || "",
        phone: "", // Add phone if available in userStore
        description: `Company: ${$userStore.companyName || ""}, Website: ${$userStore.website || ""}`,
      }

      console.log("Updating JivoChat contact info:", contactInfo)

      try {
        window.jivo_api.setContactInfo(contactInfo)
        console.log("JivoChat contact info updated successfully")
      } catch (error) {
        console.error("Error updating JivoChat contact info:", error)
      }
    } else {
      console.log("JivoChat not initialized or user not logged in")
    }
  }

  onMount(() => {
    const script = document.createElement("script")
    script.src = "//code.jivosite.com/widget/iCq4fzxyJa"
    script.async = true

    script.onload = () => {
      console.log("JivoChat script loaded")
      initJivoChat()
    }

    document.body.appendChild(script)
    console.log("JivoChat script added to document")

    return () => {
      if (typeof window.jivo_destroy === "function") {
        window.jivo_destroy()
        console.log("JivoChat destroyed")
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script)
      }
      console.log("JivoChat component destroyed and script removed")
    }
  })

  $: {
    console.log("Visibility changed:", visible)
    if (isInitialized) {
      if (visible) {
        console.log("Opening JivoChat")
        window.jivo_api.open()
      } else {
        console.log("Closing JivoChat")
        window.jivo_api.close()
      }
    }
  }

  $: {
    if (isInitialized && $userStore.id) {
      console.log("UserStore changed, updating JivoChat contact info")
      setContactInfo()
    }
  }
</script>
