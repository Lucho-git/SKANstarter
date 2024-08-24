<script lang="ts">
  import MapInfo from "./MapInfo.svelte"
  import GenerateMapModal from "./GenerateMapModal.svelte"
  import { menuStore } from "../../../../stores/menuStore"
</script>

<div class="px-4 py-2">
  <div class="mb-4 text-center font-bold">Selected Map</div>
  <MapInfo />
</div>

{#if $menuStore.showGenerateModal}
  <GenerateMapModal />
{/if}
