<script lang="ts">
  import { onMount } from "svelte"
  import { Crisp } from "crisp-sdk-web"
  import { screenSize } from "../stores/screenSizeStore"
  import { page } from "$app/stores"
  import { derived } from "svelte/store"
  import { userStore } from "../stores/userStore"

  const WEBSITE_ID = "961bded6-4b5a-45e3-8a71-a57bcc27934a"
  let isInitialized = false
  export let visible = false

  const shouldShowDrawer = derived(
    page,
    ($page) => !$page.url.pathname.includes("/account/mapviewer"),
  )

  // Handle user information updates
  $: if (isInitialized && $userStore.id) {
    setUserInfo()
  }

  function setUserInfo() {
    if (isInitialized && $userStore.id) {
      console.log("Setting user info in Crisp", $userStore)
      Crisp.user.setEmail($userStore.email)
      Crisp.user.setNickname($userStore.fullName)
      Crisp.session.setData({
        company: $userStore.companyName,
        website: $userStore.website,
      })
    }
  }

  // Only handle route changes after initial setup
  let previousDrawerState = $shouldShowDrawer
  $: if (isInitialized && $shouldShowDrawer !== previousDrawerState) {
    previousDrawerState = $shouldShowDrawer
    if (!$shouldShowDrawer) {
      visible = false
      updateCrispVisibility(false)
    } else {
      // When returning to a screen where drawer should show
      visible = $screenSize === "lg"
      updateCrispVisibility(visible)
    }
  }

  function waitForCrispElement(): Promise<Element> {
    return new Promise((resolve) => {
      const check = () => {
        const element = document.querySelector(".crisp-client")
        if (element) {
          console.log("Crisp element found")
          resolve(element)
        } else {
          console.log("Waiting for Crisp element...")
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  async function initCrispChat() {
    console.log("initCrispChat called, isInitialized:", isInitialized)
    if (!isInitialized) {
      console.log("Configuring Crisp...")
      Crisp.configure(WEBSITE_ID, {
        autoload: true,
      })

      console.log("Waiting for Crisp to initialize...")
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (window.$crisp) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })

      console.log("$crisp loaded, waiting for DOM element...")
      await waitForCrispElement()

      console.log("Crisp fully initialized, setting up initial state")
      console.log("Should show drawer:", $shouldShowDrawer)

      // Set initial visibility based on both screen size AND drawer state
      visible = $screenSize === "lg" && $shouldShowDrawer
      updateCrispVisibility(visible)

      if (!visible) {
        window.$crisp.push(["do", "chat:hide"])
      }

      window.$crisp.push([
        "on",
        "chat:closed",
        () => {
          console.log("Chat closed by Crisp UI")
          visible = false
          // Only update visibility if on small screen
          if ($screenSize === "sm") {
            updateCrispVisibility(false)
          }
        },
      ])

      isInitialized = true
      console.log("Initialization complete")

      // Initialize user info after Crisp is fully initialized
      if ($userStore.id) {
        setUserInfo()
      }
    }
  }

  function updateCrispVisibility(isVisible: boolean) {
    console.log("updateCrispVisibility called with:", isVisible)
    const crispFrame = document.querySelector(".crisp-client")
    if (crispFrame) {
      console.log("Updating Crisp visibility:", isVisible)
      crispFrame.classList.toggle("crisp-hidden", !isVisible)
      if (!isVisible) {
        window.$crisp.push(["do", "chat:hide"])
      }
    }
  }

  export function toggleChat() {
    console.log("toggleChat called, current visible state:", visible)
    if (!isInitialized) {
      console.log("Not initialized, calling initCrispChat")
      initCrispChat()
      return
    }

    if (!$shouldShowDrawer) {
      return
    }

    visible = !visible
    console.log("New visible state:", visible)
    updateCrispVisibility(visible)

    if (visible) {
      console.log("Opening chat")
      Crisp.chat.open()
    }
  }

  onMount(() => {
    console.log("Component mounted")
    initCrispChat()
  })
</script>

<style>
  :global(.crisp-hidden) {
    display: none !important;
  }
</style>
