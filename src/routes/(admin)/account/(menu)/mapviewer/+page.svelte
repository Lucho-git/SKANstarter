<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte"
  import type { Writable } from "svelte/store"
  import { goto } from "$app/navigation"
  import { toast } from "svelte-sonner"
  import { browser } from "$app/environment"
  import MapViewer from "../../../../../components/MapViewer.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("mapviewer")

  let wakeLock: WakeLockSentinel | null = null
  let orientationLock: any = null

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

  async function lockOrientation() {
    if (browser && "screen" in window && "orientation" in screen) {
      try {
        await screen.orientation.lock("portrait")
        orientationLock = screen.orientation
        toast.success("Screen orientation locked")
      } catch (err) {
        console.log(`Couldn't lock screen orientation: ${err.message}`)
      }
    }
  }

  function unlockOrientation() {
    if (orientationLock) {
      orientationLock.unlock()
      orientationLock = null
    }
  }

  onMount(() => {
    if (browser) {
      requestWakeLock()
      lockOrientation()
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }
  })

  onDestroy(() => {
    if (browser) {
      releaseWakeLock()
      unlockOrientation()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  })

  function handleVisibilityChange() {
    if (browser) {
      if (document.visibilityState === "visible") {
        requestWakeLock()
        lockOrientation()
      } else {
        releaseWakeLock()
        unlockOrientation()
      }
    }
  }

  function handleBackToDashboard() {
    if (browser) {
      releaseWakeLock()
      unlockOrientation()
    }
    goto("/account")
  }
</script>

<div class="fixed left-0 top-0 h-full w-full overflow-hidden">
  <MapViewer {handleBackToDashboard} />
</div>
