<script lang="ts">
  import "../app.css"
  import { navigating, updated } from "$app/stores"
  import { expoOut } from "svelte/easing"
  import { slide } from "svelte/transition"
  import "@fontsource/archivo/400.css"
  import "@fontsource/archivo/700.css"
  import "@fontsource/archivo/800.css"
  import "@fontsource/archivo/900.css"

  import "@fontsource/roboto/400.css"
  import "@fontsource/roboto/700.css"

  import { Toaster, toast } from "svelte-sonner"

  import { onMount } from "svelte"
  import { getAuthState } from "../stores/user"

  onMount(async () => {
    await getAuthState()
  })

  $: if ($updated) {
    toast.info("An update is available. Refresh to see the latest version.", {
      action: {
        label: "Refresh",
        onClick: () => location.reload(),
      },
    })
  }
</script>

<main data-sveltekit-reload={$updated ? "" : "off"}>
  {#if $navigating}
    <div
      class="fixed w-full top-0 right-0 left-0 h-1 z-50 bg-primary"
      in:slide={{ delay: 100, duration: 12000, axis: "x", easing: expoOut }}
    ></div>
  {/if}

  <slot />

  <Toaster position="bottom-center" richColors />
</main>
