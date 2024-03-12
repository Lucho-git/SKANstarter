<script lang="ts">
  import { onMount } from "svelte"
  import { userFilesStore } from "../stores/userFilesStore"
  import { derived } from "svelte/store"

  let loading = false
  let errorMessage = ""
  $: userFiles = $userFilesStore || []

  async function fetchUploadedFiles() {
    try {
      loading = true
      const response = await fetch("/account/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "fetchUploadedFiles" }),
      })

      if (response.ok) {
        const { files } = await response.json()
        userFilesStore.set(files)
      } else {
        errorMessage = "Error fetching uploaded files"
      }
    } catch (error) {
      errorMessage = "Error fetching uploaded files"
    } finally {
      loading = false
    }
  }

  async function deleteFile(file: string) {
    try {
      const formData = new FormData()
      formData.append("action", "deleteFile")
      formData.append("fileName", file)

      const response = await fetch("/account/api", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        // File deleted successfully, fetch the updated list of files
        await fetchUploadedFiles()
      } else {
        errorMessage = "Error deleting file"
      }
    } catch (error) {
      errorMessage = "Error deleting file"
    }
  }

  onMount(fetchUploadedFiles)
</script>

<div class="my-6">
  <h1 class="text-xl font-bold mb-1">Uploaded Files</h1>
  {#if loading}
    <p>Loading uploaded files...</p>
  {:else if userFiles.length === 0}
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
