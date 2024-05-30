<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import UploadPopoverTrigger from "../../../../components/UploadPopoverTrigger.svelte"
  import UserFiles from "../../../../components/UserFiles.svelte"
  import { userFilesStore } from "../../../../stores/userFilesStore"

  import MasterMapManager from "../(menu)/MasterMapManager.svelte"

  import { onMount } from "svelte"

  export const ssr = false

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("home")

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

  console.log("Parent component mounted")

  async function deleteFile(event: CustomEvent) {
    console.log("deleteFile event received with file:", event.detail.file)
    const fileName = event.detail.file
    try {
      console.log("Sending delete request for file:", fileName)
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

      console.log(
        "Delete request response:",
        response.status,
        response.statusText,
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("File deleted successfully:", fileName)
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
        // File uploaded successfully, update the userFilesStore
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
    // Handle invalid file scenario, e.g., show an error message
  }

  onMount(() => {
    fetchUploadedFiles()
  })
</script>

<svelte:head>
  <title>Account</title>
</svelte:head>

<div class="flex flex-col lg:flex-row lg:space-x-4">
  <div class="lg:w-1/2">
    <MasterMapManager />
  </div>

  <div class="lg:w-1/2">
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
        <div class="my-2"></div>
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
        <div class="my-2"></div>
      </div>
    </div>
  </div>
</div>
