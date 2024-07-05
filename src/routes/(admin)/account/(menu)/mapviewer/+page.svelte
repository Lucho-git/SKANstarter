<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte"
  import type { Writable } from "svelte/store"
  import { goto } from "$app/navigation"
  import { toast } from "svelte-sonner"
  import { browser } from "$app/environment"
  import MapViewer from "../../../../../components/MapViewer.svelte"
  import ButtonSection from "../../../../../components/ButtonSection.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("mapviewer")

  let wakeLock: WakeLockSentinel | null = null

  function getBrowserType() {
    if (browser) {
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        return "iOS"
      } else if (/Android/.test(navigator.userAgent)) {
        return "Android"
      } else {
        return "Other"
      }
    }
    return "Unknown"
  }

  async function requestWakeLock() {
    if (browser) {
      if ("wakeLock" in navigator) {
        toast.promise(navigator.wakeLock.request("screen"), {
          loading: "Activating screen wake...",
          success: (wakeLockSentinel) => {
            wakeLock = wakeLockSentinel
            return "Screen will stay awake"
          },
          error: (err) => {
            if (err.name === "NotAllowedError") {
              return "Screen wake not allowed by system"
            }
            return `Couldn't keep screen awake: ${err.message}`
          },
        })
      } else {
        let message = "Screen may dim during inactivity"
        const browserType = getBrowserType()
        if (browserType === "iOS") {
          message += " on iOS devices"
        } else if (browserType !== "Android") {
          message += " on this device"
        }
        toast.info(message, {
          description: "Consider adjusting your device settings if needed.",
        })
      }
    }
  }

  function releaseWakeLock() {
    if (browser && wakeLock) {
      wakeLock
        .release()
        .then(() => {
          toast.success("Screen can now dim normally")
          wakeLock = null
        })
        .catch((err) =>
          toast.error(`Error releasing wake lock: ${err.message}`),
        )
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

<div class="fixed top-0 left-0 w-full h-full overflow-hidden">
  <MapViewer />
  <ButtonSection on:backToDashboard={handleBackToDashboard} />
</div>
