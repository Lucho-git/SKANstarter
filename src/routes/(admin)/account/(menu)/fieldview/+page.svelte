<!-- src/routes/admin/fieldview/+page.svelte -->
<script lang="ts">
  import { getContext, onMount } from "svelte"
  import type { Writable } from "svelte/store"
  import UploadPopoverTrigger from "../../../../../components/UploadPopoverTrigger.svelte"
  import FileUploadDashboard from "./FileUploadDashboard.svelte"
  import { userFilesStore } from "../../../../../stores/userFilesStore"

  // Retrieve and set the admin section context
  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("fieldview")

  /**
   * Fetches the list of uploaded files from the backend.
   */
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
      console.error("Error fetching uploaded files:", error)
    }
  }

  /**
   * Deletes a file by communicating with the backend.
   * @param event - The custom event containing the file name to delete.
   */
  async function deleteFile(event: CustomEvent) {
    const fileName = event.detail.fileName
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

      // Update the store by removing the deleted file
      userFilesStore.update((files: any[]) =>
        files.filter((f) => f.name !== fileName),
      )
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error.message)
    }
  }

  /**
   * Handles the event when a file is successfully uploaded.
   * @param event - The custom event containing the uploaded file details.
   */
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
        // After successful upload, fetch the updated list of files
        await fetchUploadedFiles()
      } else {
        console.error("Error uploading file")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  /**
   * Handles the event when a file fails validation during upload.
   * @param event - The custom event containing the invalid file details.
   */
  function handleInvalidFile(event: CustomEvent) {
    const invalidFile = event.detail.file
    console.error("Invalid file:", invalidFile.name)
  }

  // Fetch uploaded files when the component mounts
  onMount(fetchUploadedFiles)
  //   console.log(data)
</script>

<div class="app-container">
  <div class="mx-auto w-full max-w-4xl">
    <h2 class="mb-4 text-2xl font-bold">FieldView</h2>

    <!-- Information Alert -->
    <div class="alert alert-info mb-4 mt-2 w-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="h-6 w-6 shrink-0 stroke-current"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <div>
        <h3 class="font-bold">Coming Soon: Paddock Boundary Updates</h3>
        <div class="text-sm">
          You can upload your files now. We'll notify you once the update is
          live and your boundaries are visible.
        </div>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="alert alert-success mt-2 w-full">
      <img src="/images/file-upload-icon.svg" alt="Gear" class="h-14 w-14" />
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

    <!-- File Upload Dashboard -->

    <FileUploadDashboard on:fileDeleted={deleteFile} />
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
