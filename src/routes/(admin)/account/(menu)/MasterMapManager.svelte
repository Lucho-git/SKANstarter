<script lang="ts">
  import MapInfo from "./MapInfo.svelte"
  import GenerateMapModal from "./GenerateMapModal.svelte"
  import ConnectToMapModal from "./ConnectToMapModal.svelte"
  import MapSettingsModal from "./MapSettingsModal.svelte"
  import DeleteConfirmationModal from "./DeleteConfirmationModal.svelte"
  import AddOperationModal from "./AddOperationModal.svelte"
  import EditOperationModal from "./EditOperationModal.svelte"

  import { menuStore } from "../../../../stores/menuStore"
</script>

<div class="py-2">
  <MapInfo />
</div>

{#if $menuStore.showGenerateModal}
  <GenerateMapModal />
{/if}

{#if $menuStore.showConnectModal}
  <ConnectToMapModal />
{/if}

{#if $menuStore.showSettingsModal}
  <MapSettingsModal />
{/if}

{#if $menuStore.showDeleteConfirmationModal}
  <DeleteConfirmationModal />
{/if}

{#if $menuStore.showAddOperationModal}
  <AddOperationModal />
{/if}

{#if $menuStore.showEditOperationModal}
  <EditOperationModal />
{/if}
