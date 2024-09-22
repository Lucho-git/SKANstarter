<!-- src/routes/admin/fieldview/FileUploadDashboard.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import { userFilesStore } from "../../../../../stores/userFilesStore" // Adjust path if necessary
  import { menuStore } from "../../../../../stores/menuStore"

  import type { FileUpload } from "$lib/types"
  import MapCarousel from "./MapCarousel.svelte"

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
  import {
    Download,
    Trash,
    FileUp,
    Minimize,
    Maximize2,
    Play,
  } from "lucide-svelte"

  import { toast } from "svelte-sonner"

  // Read the files once from the store
  $: files = $userFilesStore

  // Local state for handling errors
  let errorMessage = ""

  // State for expanded/condensed view
  let isExpanded = true
  let isMobile = false

  onMount(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    isMobile = mediaQuery.matches
    isExpanded = !isMobile

    mediaQuery.addEventListener("change", (e) => {
      isMobile = e.matches
      isExpanded = !isMobile
    })
  })

  function toggleView() {
    isExpanded = !isExpanded
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  async function handleDownload(file: FileUpload) {
    console.log(`Downloading ${file.name}`)
    try {
      const response = await fetch(
        `/api/files/download?fileName=${encodeURIComponent(file.name)}`,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to download file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading file:", error)
      errorMessage = `Error downloading file: ${error.message}`
    }
  }

  async function deleteFile(fileName: string) {
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
        return files.filter((f) => f.name !== fileName)
      })

      console.log(result.message) // Log success message
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error.message)
      errorMessage = `Error deleting file ${fileName}: ${error.message}`
    }
  }

  function handleDelete(file: FileUpload) {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return
    deleteFile(file.name)
  }

  function truncateFileName(name: string, maxLength: number = 20): string {
    if (name.length <= maxLength) return name
    const half = Math.floor((maxLength - 3) / 2)
    return `${name.slice(0, half)}...${name.slice(-half)}`
  }

  async function handleProcess(file: FileUpload) {
    toast.promise(
      (async () => {
        try {
          // Call the real API
          const response = await fetch("/api/files/process", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileName: file.name }),
          })

          const result = await response.json()
          if (!response.ok) {
            throw new Error(result.message || "Failed to process file")
          }

          console.log("Result", result) // Log success message

          // Update userFilesStore
          userFilesStore.update((files) =>
            files.map((f) =>
              f.id === file.id
                ? { ...f, message: result.message, status: "Processed" }
                : f,
            ),
          )

          // Stub data (to be used for navigation)
          const stubData = {
            maps: [
              { title: "World Map", status: null },
              { title: "Europe Map", status: null },
              { title: "Asia Map", status: null },
              { title: "America Map", status: null },
              { title: "World Map", status: null },
              { title: "Europe Map", status: null },
              { title: "Asia Map", status: null },
            ],
          }

          // Store the actual result data in sessionStorage
          sessionStorage.setItem("processedData", JSON.stringify(result))

          // Navigate to the new page
          console.log("Navigating to landwizard")
          await goto("/account/fieldview/landwizard")

          console.log("Navigation completed")

          return result
        } catch (error) {
          console.error("Error in handleProcess:", error)
          throw error
        }
      })(),
      {
        loading: `Processing ${file.name}...`,
        success: (result) => {
          // This won't be executed due to navigation, but kept for consistency
          menuStore.update((state) => ({
            ...state,
            showMapCarouselModal: true,
          }))
          return `${file.name} processed successfully: ${result.message}`
        },
        error: (error) => {
          userFilesStore.update((files) =>
            files.map((f) =>
              f.id === file.id
                ? { ...f, message: error.message, status: "Failed" }
                : f,
            ),
          )
          return `Error processing ${file.name}: ${error.message}`
        },
      },
    )
  }
</script>

<div class="width-auto py-6" class:expanded-mobile={isMobile && isExpanded}>
  <Card>
    <CardHeader class="px-2 sm:px-4">
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center text-2xl font-bold">
          <FileUp class="mr-2 h-6 w-6" />
          File Upload Dashboard
        </CardTitle>
        <Button variant="outline" size="sm" on:click={toggleView}>
          {#if isExpanded}
            <Minimize class="h-4 w-4" />
          {:else}
            <Maximize2 class="h-4 w-4" />
          {/if}
        </Button>
      </div>
    </CardHeader>

    <CardContent class="px-2 sm:px-4">
      {#if !files || files.length === 0}
        <div class="flex flex-col items-center justify-center text-center">
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
        <div class="overflow-x-auto">
          <Table>
            <TableCaption>A list of your uploaded files</TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead class="whitespace-nowrap">File Name</TableHead>
                {#if isExpanded}
                  <TableHead class="whitespace-nowrap">Uploaded Date</TableHead>
                {/if}
                <TableHead class="whitespace-nowrap">Status</TableHead>
                {#if isExpanded}
                  <TableHead class="whitespace-nowrap">Message</TableHead>
                {/if}
                <TableHead class="whitespace-nowrap text-right"
                  >Actions</TableHead
                >
              </TableRow>
            </TableHeader>

            <TableBody>
              {#each files as file (file.id)}
                <TableRow>
                  <TableCell class="whitespace-nowrap font-medium">
                    {truncateFileName(file.name, isExpanded ? 30 : 20)}
                  </TableCell>
                  {#if isExpanded}
                    <TableCell class="whitespace-nowrap">
                      {formatDate(file.uploadedDate)}
                    </TableCell>
                  {/if}
                  <TableCell class="whitespace-nowrap">
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
                  {#if isExpanded}
                    <TableCell>
                      {#if file.status === "Processed"}
                        {file.message}
                      {:else}
                        {file.message || ""}
                      {/if}
                    </TableCell>
                  {/if}
                  <TableCell class="whitespace-nowrap text-right">
                    <div class="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        on:click={() => handleProcess(file)}
                        class="h-8 w-8"
                        aria-label={`Process ${file.name}`}
                      >
                        <Play class="h-4 w-4" />
                        <span class="sr-only">Process {file.name}</span>
                      </Button>
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
                      {#if isExpanded}
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
                      {/if}
                    </div>
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}

      {#if errorMessage}
        <p class="text-red-500">{errorMessage}</p>
      {/if}
    </CardContent>
  </Card>
</div>

<style>
  .expanded-mobile {
    max-width: 77vw;
  }
</style>
