<!-- src/routes/admin/fieldview/+page.svelte -->
<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import UploadPopoverTrigger from "../../../../../components/UploadPopoverTrigger.svelte"
  import FileUploadDashboard from "./FileUploadDashboard.svelte"
  import { userFilesStore } from "../../../../../stores/userFilesStore"

  // Retrieve and set the admin section context
  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("fieldview")

  /**
   * Deletes a file by communicating with the backend.
   * @param event - The custom event containing the file name to delete.
   */
  async function deleteFile(event: CustomEvent) {
    const fileName = event.detail.fileName
    console.log("Attempting to delete file:", fileName)

    try {
      const response = await fetch("/api/files/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`,
        )
      }

      // Update the store by removing the deleted file
      userFilesStore.update((files) => {
        const filteredFiles = files.filter((f) => {
          return f.name !== fileName
        })
        return filteredFiles
      })

      console.log(result.message) // Log success message
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error.message)
      // You might want to show an error message to the user here
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
        // After successful upload, update the store with the new file
        // **Note:** Ensure that the backend returns the necessary file details.
        const newFile = {
          id: generateUUID(), // **Stub:** Replace with actual ID from backend if available
          name: file.name,
          path: `/user/${file.name}`, // **Stub:** Replace with actual path from backend if available
          uploadedDate: new Date().toISOString(),
          status: "Processed",
          message: "File uploaded successfully",
        }
        console.log("New file:", newFile)
        userFilesStore.update((files: any[]) => [newFile, ...files])
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

  /**
   * Generates a UUID for new files.
   * @returns A randomly generated UUID string.
   */
  function generateUUID() {
    // Simple UUID generator for demonstration purposes
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
      },
    )
  }
</script>

<div class="app-container">
  <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    <h2 class="mb-6 text-3xl font-bold">FieldView</h2>

    <!-- Information Alert -->
    <div class="alert alert-info mb-6 flex items-start">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="mr-4 h-6 w-6 shrink-0 stroke-current text-blue-500"
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
        <div class="mt-1 text-sm">
          You can upload your files now. We'll notify you once the update is
          live and your boundaries are visible.
        </div>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="alert alert-success mb-6 flex items-start">
      <img
        src="/images/file-upload-icon.svg"
        alt="File Upload Icon"
        class="mr-4 h-14 w-14"
      />
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
    <div class=" mb-6">
      <FileUploadDashboard on:fileDeleted={deleteFile} />
    </div>
  </div>
</div>

<style>
  .app-container {
    display: flex;
    width: 100%;
    min-height: 100vh;
    padding: 1rem;
    background-color: #f9fafb; /* Light gray background for better contrast */
  }
</style>
