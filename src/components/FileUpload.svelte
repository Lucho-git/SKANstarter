<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { userFilesStore } from "../stores/userFilesStore"
  import FileInspector from "./FileInspector.svelte"

  let file: File | null = null
  let isFileValid = false
  let uploading = false
  let errorMessage = ""
  let successMessage = ""
  let fileInfo = ""

  const dispatch = createEventDispatcher()

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    file = target.files?.[0] || null
    isFileValid = false
    errorMessage = ""
    successMessage = ""
    fileInfo = ""
    if (file) {
      const inspector = new FileInspector({
        target: document.createElement("div"),
        props: { file },
      })
    }
  }

  const handleValidFile = (event: CustomEvent) => {
    isFileValid = true
    errorMessage = ""
    fileInfo = event.detail.info
  }

  const handleInvalidFile = () => {
    isFileValid = false
    errorMessage = "Invalid file format. Please select a CSV file."
    fileInfo = ""
  }

  const handleFileUpload = async () => {
    if (file && isFileValid) {
      uploading = true
      errorMessage = ""
      successMessage = ""

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
          isFileValid = false
          successMessage = "File uploaded successfully"
          dispatch("fileUploaded")

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
            const error = await fetchResponse.json()
            console.error("Error fetching uploaded files:", error)
            errorMessage = "Error fetching uploaded files. Please try again."
          }
        } else {
          const error = await response.json()
          console.error("Error uploading file:", error)

          if (error.message) {
            errorMessage = error.message
          } else if (error.error) {
            errorMessage = error.error
          } else {
            errorMessage =
              "An error occurred while uploading the file. Please try again."
          }
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        errorMessage =
          "An unexpected error occurred while uploading the file. Please try again."
      } finally {
        uploading = false
      }
    }
  }
</script>

<div class="my-2">
  <input
    type="file"
    class="file-input file-input-bordered file-input-primary file-input-bg-primary w-full max-w-xs"
    on:change={handleFileChange}
  />
</div>

<FileInspector
  {file}
  on:validFile={handleValidFile}
  on:invalidFile={handleInvalidFile}
/>

{#if file && !uploading}
  <button
    class="btn btn-primary"
    class:animate-pulse={isFileValid}
    class:opacity-50={!isFileValid}
    disabled={!isFileValid}
    on:click={handleFileUpload}
  >
    Upload File
  </button>
{/if}

{#if uploading}
  <p>Uploading...</p>
{/if}

{#if errorMessage}
  <p class="text-red-500">{errorMessage}</p>
{/if}

{#if successMessage}
  <p class="text-green-500">{successMessage}</p>
{/if}

{#if fileInfo}
  <p>File Info: {fileInfo}</p>
{/if}
