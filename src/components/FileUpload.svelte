<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { userFilesStore } from "../stores/userFilesStore"

  let file: File | null = null
  let uploading = false
  let errorMessage = ""

  const dispatch = createEventDispatcher()

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    file = target.files?.[0] || null
  }

  const handleFileUpload = async () => {
    if (file) {
      uploading = true
      errorMessage = ""

      const formData = new FormData()
      formData.append("action", "uploadFile")
      formData.append("file", file)

      try {
        const response = await fetch("/account/api", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          console.log("File uploaded successfully")
          file = null
          dispatch("fileUploaded") // Dispatch an event to notify the parent component

          // Fetch the updated list of files from the server
          const fetchResponse = await fetch("/account/api", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "fetchUploadedFiles" }),
          })

          if (fetchResponse.ok) {
            const { files } = await fetchResponse.json()
            userFilesStore.set(files)
          } else {
            errorMessage = "Error fetching uploaded files"
          }
        } else {
          errorMessage = "Error uploading file"
        }
      } catch (error) {
        errorMessage = "Error uploading file"
      } finally {
        uploading = false
      }
    }
  }
</script>

<div class="my-2">
  <input
    type="file"
    class="file-input file-input-bordered file-input-primary text-primary w-full max-w-xs"
    on:change={handleFileChange}
  />
</div>

{#if file}
  <button
    class="btn btn-primary"
    on:click={handleFileUpload}
    disabled={uploading}
  >
    {#if uploading}
      Uploading...
    {:else}
      Upload File
    {/if}
  </button>
{/if}

{#if errorMessage}
  <p class="text-red-500">{errorMessage}</p>
{/if}
