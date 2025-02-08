<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte"
  import type { Writable } from "svelte/store"
  import { goto } from "$app/navigation"
  import { toast } from "svelte-sonner"
  import { browser } from "$app/environment"
  import MapViewer from "../../../../../components/MapViewer.svelte"
  import type { PageData } from "./$types"
  import { selectedOperationStore } from "$lib/stores/operationStore"

  export let data: PageData

  console.log("1. MapViewer Page Load - Initial data:", data)
  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("mapviewer")

  let wakeLock: WakeLockSentinel | null = null

  // Pass through the raw location data
  $: initialLocation = data.location

  // Add logging for store value
  console.log(
    "2. Current selectedOperationStore value:",
    $selectedOperationStore,
  )
  let selectedOperation = $selectedOperationStore
  console.log("3. Local selectedOperation variable set to:", selectedOperation)

  // Subscribe to store changes
  selectedOperationStore.subscribe((value) => {
    console.log("4. selectedOperationStore changed to:", value)
    selectedOperation = value
    console.log("5. Local selectedOperation updated to:", selectedOperation)
  })

  function isAndroid() {
    return browser && /Android/.test(navigator.userAgent)
  }

  async function requestWakeLock() {
    if (browser && isAndroid() && "wakeLock" in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request("screen")
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
    console.log(
      "6. MapViewer Page Mount - selectedOperation:",
      selectedOperation,
    )
    console.log(
      "7. MapViewer Page Mount - store value:",
      $selectedOperationStore,
    )

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
  {#key selectedOperation}
    <MapViewer {handleBackToDashboard} {initialLocation} {selectedOperation} />
  {/key}
</div>
