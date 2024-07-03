<script>
  import { onMount, onDestroy } from "svelte"

  export let visible = true

  let tawkToLoaded = false

  onMount(() => {
    loadTawkTo()
  })

  onDestroy(() => {
    if (typeof Tawk_API !== "undefined") {
      Tawk_API.hideWidget()
    }
  })

  function loadTawkTo() {
    if (!tawkToLoaded) {
      var s1 = document.createElement("script")
      var s0 = document.getElementsByTagName("script")[0]
      s1.async = true
      s1.src = "https://embed.tawk.to/66850c4eeaf3bd8d4d177ced/1i1rrg4ob"
      s1.charset = "UTF-8"
      s1.setAttribute("crossorigin", "*")
      s0.parentNode.insertBefore(s1, s0)

      s1.onload = () => {
        tawkToLoaded = true
        updateVisibility()
      }
    } else {
      updateVisibility()
    }
  }

  function updateVisibility() {
    if (typeof Tawk_API !== "undefined") {
      if (visible) {
        Tawk_API.showWidget()
      } else {
        Tawk_API.hideWidget()
      }
    }
  }

  $: if (tawkToLoaded) updateVisibility()
</script>
