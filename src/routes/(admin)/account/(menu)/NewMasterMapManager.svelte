<script lang="ts">
  import MapInfo from "./MapInfo.svelte"
  // import MapActions from './MapActions.svelte';
  // import GenerateMapModal from './GenerateMapModal.svelte';
  // import ConnectMapModal from './ConnectMapModal.svelte';
  // import DeleteConfirmationModal from './DeleteConfirmationModal.svelte';
  // import MapSettingsModal from './MapSettingsModal.svelte';
  // import NoMapAssigned from './NoMapAssigned.svelte';
  import { connectedMapStore } from "../../../../stores/connectedMapStore"

  let showGenerateModal = false
  let showConnectModal = false
  let showDeleteConfirmation = false
  let showSettingsModal = false

  $: isMapConnected = $connectedMapStore?.id
</script>

<div class="px-4 py-2">
  <div class="mb-4 text-center font-bold">Selected Map</div>
  <MapInfo />
</div>
