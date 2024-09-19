<script lang="ts">
  import { onMount } from "svelte"
  import { userFilesStore } from "../../../../../stores/userFilesStore" // Adjust the path as necessary
  import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table"
  import { Button } from "$lib/components/ui/button"
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card"
  import { Download, Trash, FileUp } from "lucide-svelte"
  import { get } from "svelte/store"

  type FileUpload = {
    id: string
    name: string
    uploadedDate: Date
    status: "Pending" | "Processed" | "Failed"
    message: string
  }

  let files: FileUpload[] = []
  $: files = $userFilesStore

  let isLoading = false
  let errorMessage = ""

  // Fetch files from backend or store
  async function fetchFiles() {
    isLoading = true
    errorMessage = ""
    try {
      // TODO: Replace the following stub with actual fetch logic
      // Example using a backend API:
      // const response = await fetch('/api/user/files')
      // if (!response.ok) throw new Error('Network response was not ok')
      // const data: FileUpload[] = await response.json()
      // userFilesStore.set(data)

      // Stub: Simulate fetching data
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
      const fetchedFiles: FileUpload[] = [
        {
          id: "1",
          name: "document.pdf",
          uploadedDate: new Date("2023-05-01"),
          status: "Processed",
          message: "Successfully processed",
        },
        {
          id: "2",
          name: "image.jpg",
          uploadedDate: new Date("2023-05-02"),
          status: "Pending",
          message: "Awaiting processing",
        },
        {
          id: "3",
          name: "spreadsheet.xlsx",
          uploadedDate: new Date("2023-05-03"),
          status: "Failed",
          message: "Error during processing",
        },
      ]
      userFilesStore.set(fetchedFiles)
    } catch (error) {
      console.error("Error fetching files:", error)
      errorMessage = "Failed to load files."
    } finally {
      isLoading = false
    }
  }

  // Handle file download
  function handleDownload(fileName: string) {
    console.log(`Downloading ${fileName}`)
    // TODO: Replace the following stub with actual download logic
    // Example:
    // window.open(`/api/user/files/download/${fileName}`, "_blank")
  }

  // Handle file deletion
  async function handleDelete(fileName: string) {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return

    try {
      // TODO: Replace the following stub with actual delete logic
      // Example using a backend API:
      // const response = await fetch(`/api/user/files/${fileName}`, { method: 'DELETE' })
      // if (!response.ok) throw new Error('Failed to delete the file')
      // userFilesStore.update(files => files.filter(file => file.name !== fileName))

      // Stub: Simulate deletion delay and update store
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      console.log(`Deleting ${fileName}`)
      userFilesStore.update((currentFiles) =>
        currentFiles.filter((file) => file.name !== fileName),
      )
    } catch (error) {
      console.error("Error deleting file:", error)
      errorMessage = "Failed to delete the file."
    }
  }

  // Format date
  function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // On mount, fetch the files
  onMount(() => {
    fetchFiles()
  })
</script>

<div class="container mx-auto py-10">
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center text-2xl font-bold">
        <FileUp class="mr-2 h-6 w-6" />
        File Upload Dashboard
      </CardTitle>
    </CardHeader>

    <CardContent>
      {#if isLoading}
        <p>Loading files...</p>
      {:else if errorMessage}
        <p class="text-red-500">{errorMessage}</p>
      {:else}
        <Table>
          <TableCaption>A list of your uploaded files</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Uploaded Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {#each files as file (file.id)}
              <TableRow>
                <TableCell class="font-medium">{file.name}</TableCell>
                <TableCell>{formatDate(file.uploadedDate)}</TableCell>

                <TableCell>
                  <span
                    class={`rounded-full px-2 py-1 text-xs font-semibold ${
                      file.status === "Processed"
                        ? "bg-green-100 text-green-800"
                        : file.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {file.status}
                  </span>
                </TableCell>

                <TableCell>{file.message}</TableCell>

                <TableCell class="text-right">
                  <div class="flex justify-end space-x-2">
                    <!-- Download Button -->
                    <Button
                      variant="ghost"
                      size="icon"
                      on:click={() => handleDownload(file.name)}
                      class="h-8 w-8"
                    >
                      <Download class="h-4 w-4" />
                      <span class="sr-only">Download {file.name}</span>
                    </Button>

                    <!-- Delete Button -->
                    <Button
                      variant="ghost"
                      size="icon"
                      on:click={() => handleDelete(file.name)}
                      class="h-8 w-8 text-red-600"
                    >
                      <Trash class="h-4 w-4" />
                      <span class="sr-only">Delete {file.name}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>

        {#if files.length === 0}
          <p>No files uploaded yet.</p>
        {/if}
      {/if}
    </CardContent>
  </Card>
</div>

<style>
  /* Add any necessary styles here */
</style>
