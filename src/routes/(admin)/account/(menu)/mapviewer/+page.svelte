<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte"
  import type { Writable } from "svelte/store"
  import { goto } from "$app/navigation"
  import { toast } from "svelte-sonner"
  import { browser } from "$app/environment"
  import MapViewer from "../../../../../components/MapViewer.svelte"
  import type { PageData } from "./$types"

  // Add the data prop
  export let data: PageData

  console.log("Inital map load data:", data)
  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("mapviewer")

  let wakeLock: WakeLockSentinel | null = null

  function isAndroid() {
    return browser && /Android/.test(navigator.userAgent)
  }

  async function requestWakeLock() {
    if (browser && isAndroid() && "wakeLock" in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request("screen")
        toast.success("Screen will stay awake")
      } catch (err) {
        if (err.name !== "NotAllowedError") {
          toast.error(`Couldn't keep screen awake: ${err.message}`)
        }
      }
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock
        .release()
        .then(() => {
          wakeLock = null
        })
        .catch((err) => {
          console.error(`Error releasing wake lock: ${err.message}`)
        })
    }
  }

  onMount(() => {
    if (browser) {
      requestWakeLock()
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }
  })

  onDestroy(() => {
    if (browser) {
      releaseWakeLock()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  })

  function handleVisibilityChange() {
    if (browser) {
      if (document.visibilityState === "visible") {
        requestWakeLock()
      } else {
        releaseWakeLock()
      }
    }
  }

  function handleBackToDashboard() {
    if (browser) {
      releaseWakeLock()
    }
    goto("/account")
  }
</script>

<div class="fixed left-0 top-0 h-full w-full overflow-hidden">
  <MapViewer {handleBackToDashboard} />
</div>
