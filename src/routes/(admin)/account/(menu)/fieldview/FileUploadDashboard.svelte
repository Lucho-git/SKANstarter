<!-- src/routes/admin/fieldview/FileUploadDashboard.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { userFilesStore } from "../../../../../stores/userFilesStore" // Adjust path if necessary
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

  // Define the FileUpload type
  type FileUpload = {
    id: string
    name: string
    path: string
    uploadedDate: string // ISO string
    status: "Pending" | "Processed" | "Failed"
    message: string
  }

  const dispatch = createEventDispatcher()

  // Read the files once from the store
  let files: FileUpload[] = get(userFilesStore)

  // Local state for handling errors
  let errorMessage = ""

  /**
   * Formats a Date string into a readable format.
   * @param date - The date string to format.
   * @returns Formatted date string.
   */
  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  /**
   * Handles the download action for a file.
   * @param file - The file to download.
   */
  function handleDownload(file: FileUpload) {
    console.log(`Downloading ${file.name}`)
    // Implement actual download logic here
    // Example:
    window.location.href = `/account/api?action=downloadFile&fileName=${encodeURIComponent(file.name)}`
  }

  /**
   * Handles the deletion of a file by dispatching an event to the parent.
   * @param file - The file to delete.
   */
  function handleDelete(file: FileUpload) {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return

    // Dispatch the fileDeleted event with the file name
    dispatch("fileDeleted", { fileName: file.name })
  }
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
      {#if !files || files.length === 0}
        <div class="flex flex-col items-center justify-center text-center">
          <!-- No Data Symbol -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mb-4 h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p class="text-gray-500">No files uploaded yet.</p>
        </div>
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
                      on:click={() => handleDownload(file)}
                      class="h-8 w-8"
                      aria-label={`Download ${file.name}`}
                    >
                      <Download class="h-4 w-4" />
                      <span class="sr-only">Download {file.name}</span>
                    </Button>

                    <!-- Delete Button -->
                    <Button
                      variant="ghost"
                      size="icon"
                      on:click={() => handleDelete(file)}
                      class="h-8 w-8 text-red-600"
                      aria-label={`Delete ${file.name}`}
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
      {/if}

      {#if errorMessage}
        <p class="text-red-500">{errorMessage}</p>
      {/if}
    </CardContent>
  </Card>
</div>

<style>
  /* Add any necessary styles here */
</style>
