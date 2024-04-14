<script lang="ts">
  import { onMount } from "svelte"
  import { userFilesStore } from "../stores/userFilesStore"

  let errorMessage = ""
  $: userFiles = $userFilesStore

  function deleteFile(file: string) {
    const event = new CustomEvent("deleteFile", {
      detail: { file },
    })
    dispatchEvent(event)
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
          <span>{file}</span>
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
