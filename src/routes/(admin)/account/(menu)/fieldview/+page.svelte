<script lang="ts">
  import { getContext, onMount } from "svelte"
  import type { Writable } from "svelte/store"
  import UploadPopoverTrigger from "../../../../../components/UploadPopoverTrigger.svelte"
  import UserFiles from "../../../../../components/UserFiles.svelte"
  import { userFilesStore } from "../../../../../stores/userFilesStore"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("fieldview")

  async function fetchUploadedFiles() {
    try {
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
        console.error("Error fetching uploaded files")
      }
    } catch (error) {
      console.error("Error fetching uploaded files")
    }
  }

  async function deleteFile(event: CustomEvent) {
    const fileName = event.detail.file
    try {
      const response = await fetch("/account/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "deleteFile",
          fileName: fileName,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      userFilesStore.update((files) => files.filter((f) => f !== fileName))
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error.message)
    }
  }

  async function handleValidFile(event: CustomEvent) {
    const file = event.detail.file
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/account/api", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        userFilesStore.update((files) => [...files, file.name])
      } else {
        console.error("Error uploading file")
      }
    } catch (error) {
      console.error("Error uploading file")
    }
  }

  function handleInvalidFile(event: CustomEvent) {
    const invalidFile = event.detail.file
    console.error("Invalid file:", invalidFile.name)
  }

  onMount(fetchUploadedFiles)
</script>

<div class="app-container">
  <div class="w-full max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">FieldView</h2>

    <div class="alert alert-info w-full mt-2 mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-current shrink-0 w-6 h-6"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path></svg
      >
      <div>
        <h3 class="font-bold">Coming Soon: Paddock Boundary Updates</h3>
        <div class="text-sm">
          You can upload your files now. We'll notify you once the update is
          live and your boundaries are visible.
        </div>
      </div>
    </div>

    <div class="alert alert-success w-full mt-2">
      <img src="/images/file-upload-icon.svg" alt="Gear" class="w-14 h-14" />
      <div>
        <div class="font-bold">Upload Paddock Boundaries</div>
        <div class="my-2">
          <UploadPopoverTrigger
            on:validFile={handleValidFile}
            on:invalidFile={handleInvalidFile}
          />
        </div>
      </div>
    </div>

    <div class="alert alert-success w-full mt-2">
      <div>
        <div class="font-bold">User Files</div>
        <div class="my-2">
          <UserFiles
            on:fetchUploadedFiles={fetchUploadedFiles}
            on:deleteFile={deleteFile}
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .app-container {
    display: flex;
    width: 100%;
    min-height: 100vh;
    padding: 1rem;
  }
</style>
