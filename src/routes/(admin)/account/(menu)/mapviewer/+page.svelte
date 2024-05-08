<!-- src\routes\(admin)\account\(menu)\mapviewer\+page.svelte -->
<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { goto } from "$app/navigation"
  import MapViewer from "../../../../../components/MapViewer.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("mapviewer")

  function handleBackToDashboard() {
    goto("/account")
  }
</script>

<div class="fixed top-0 left-0 w-full h-full overflow-hidden">
  <MapViewer />
  <button
    class="btn btn-circle btn-lg bg-white bg-opacity-50 hover:bg-opacity-100 absolute top-4 left-4 z-10"
    on:click={handleBackToDashboard}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  </button>
</div>
