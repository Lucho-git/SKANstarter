<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { userStore } from "../stores/userStore"

  export let visible = true

  let tawkToLoaded = false
  let unsubscribe: () => void
  let Tawk_API: any

  onMount(() => {
    loadTawkTo()
    unsubscribe = userStore.subscribe((user) => {
      if (tawkToLoaded && user.id) {
        setVisitorAttributes(user)
      }
    })
  })

  onDestroy(() => {
    if (Tawk_API && typeof Tawk_API.hideWidget === "function") {
      Tawk_API.hideWidget()
    }
    if (unsubscribe) unsubscribe()
  })

  function loadTawkTo() {
    if (!tawkToLoaded) {
      const script = document.createElement("script")
      script.async = true
      script.src = "https://embed.tawk.to/66850c4eeaf3bd8d4d177ced/1i1rrg4ob"
      script.charset = "UTF-8"
      script.setAttribute("crossorigin", "*")

      script.onload = () => {
        if (typeof Tawk_API !== "undefined") {
          Tawk_API = Tawk_API || {}
          Tawk_API.onLoad = function () {
            tawkToLoaded = true
            updateVisibility()
            setVisitorAttributes($userStore)
          }
        }
      }

      document.head.appendChild(script)
    } else {
      updateVisibility()
    }
  }

  function updateVisibility() {
    if (
      Tawk_API &&
      typeof Tawk_API.showWidget === "function" &&
      typeof Tawk_API.hideWidget === "function"
    ) {
      if (visible) {
        Tawk_API.showWidget()
      } else {
        Tawk_API.hideWidget()
      }
    }
  }

  function setVisitorAttributes(user) {
    if (Tawk_API && typeof Tawk_API.setAttributes === "function" && user.id) {
      Tawk_API.setAttributes(
        {
          name: user.fullName,
          email: user.email,
          id: user.id,
        },
        function (error) {
          if (error) {
            console.error("Error setting Tawk.to visitor attributes:", error)
          }
        },
      )
    }
  }

  $: if (tawkToLoaded) updateVisibility()
</script>
