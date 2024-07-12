<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { userStore } from "../stores/userStore"
  import { Crisp } from "crisp-sdk-web"

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
    }

    setVisibility(visible)
    setUserInfo()
  }

  //   function setVisibility(isVisible: boolean) {
  //     if (isInitialized) {
  //       if (isVisible) {
  //         console.log("Showing Crisp Chat")
  //         Crisp.chat.show()
  //       } else {
  //         console.log("Hiding Crisp Chat")
  //         Crisp.chat.hide()
  //       }
  //     }
  //   }
  function setVisibility(isVisible: boolean) {
    if (isInitialized) {
      setZIndex(isVisible)
      if (isVisible) {
        console.log("Showing Crisp Chat")
        Crisp.chat.show()
      } else {
        console.log("Hiding Crisp Chat")
        Crisp.chat.hide()
      }
    }
  }

  function setZIndex(isVisible: boolean) {
    if (isInitialized) {
      const crispElement = document.querySelector(".crisp-client")
      if (crispElement) {
        crispElement.style.zIndex = isVisible ? "1000" : "-1"
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
    if (isInitialized) {
      console.log("Visibility changed:", visible)
      setVisibility(visible)
    }
  }

  $: {
    if (isInitialized && $userStore.id) {
      console.log("User info changed, updating Crisp")
      setUserInfo()
    }
  }
</script>
