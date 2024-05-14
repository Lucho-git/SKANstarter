<!-- src\routes\(admin)\account\(menu)\mapviewer\+page.svelte -->
<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { goto } from "$app/navigation"
  import MapViewer from "../../../../../components/MapViewer.svelte"
  import ButtonSection from "../../../../../components/ButtonSection.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("mapviewer")

  function handleBackToDashboard() {
    goto("/account")
  }
</script>

<div class="fixed top-0 left-0 w-full h-full overflow-hidden">
  <MapViewer />
  <ButtonSection on:backToDashboard={handleBackToDashboard} />
</div>
