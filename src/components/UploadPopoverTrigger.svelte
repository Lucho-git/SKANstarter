<!-- MainComponent.svelte -->
<script lang="ts">
  import FileUpload from "./FileUpload.svelte"

  let isPopoverOpen = false

  function togglePopover() {
    isPopoverOpen = !isPopoverOpen
  }

  function handlePopoverClose() {
    isPopoverOpen = false
  }
</script>

<div class="my-2">
  <button class="btn btn-primary" on:click={togglePopover}>
    Upload File
  </button>

  <FileUpload
    {isPopoverOpen}
    acceptedFileTypes=".zip, .isoxml, .csv"
    on:close={handlePopoverClose}
  />
</div>
