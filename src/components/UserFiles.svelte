<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte"
  import { userFilesStore } from "../stores/userFilesStore"

  const dispatch = createEventDispatcher()

  const MAX_MOBILE_FILENAME_LENGTH = 20 // Set the maximum number of characters to display on mobile

  let errorMessage = ""
  $: userFiles = $userFilesStore
  $: isMobile = window.innerWidth <= 768 // Adjust the breakpoint as needed

  function deleteFile(file: string) {
    console.log("deleteFile event dispatched with file:", file)
    dispatch("deleteFile", { file })
  }

  function truncateFileName(fileName: string) {
    if (isMobile && fileName.length > MAX_MOBILE_FILENAME_LENGTH) {
      return fileName.slice(0, MAX_MOBILE_FILENAME_LENGTH) + "..."
    }
    return fileName
  }

  onMount(() => {
    const event = new CustomEvent("fetchUploadedFiles")
    dispatchEvent(event)
  })
</script>

<div class="my-6">
  <h1 class="text-xl font-bold mb-1">Uploaded Files</h1>
  {#if userFiles.length === 0}
    <p>No files uploaded yet.</p>
  {:else}
    <ul>
      {#each userFiles as file}
        <li class="flex items-center justify-between">
          <span>{truncateFileName(file)}</span>
          <button
            class="btn btn-sm btn-error"
            on:click={() => deleteFile(file)}
          >
            Delete
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

{#if errorMessage}
  <p class="text-red-500">{errorMessage}</p>
{/if}
