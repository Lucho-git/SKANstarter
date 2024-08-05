<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("fieldview")
</script>

<div class="app-container">
  <h2 class="text-2xl font-bold mb-4">FieldView</h2>
  <p>
    Welcome to the FieldView section. This is where field data will be
    displayed.
  </p>
</div>

<style>
  .app-container {
    display: flex;
    width: 100%;
    height: 100vh;
  }
</style>
