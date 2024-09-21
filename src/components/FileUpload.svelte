<!-- FileUpload.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { fetchUserFiles, deleteUserFile } from "$lib/api/server/files" // Adjust the import path as necessary

  import { userFilesStore } from "../stores/userFilesStore"
  import FileInspector from "./FileInspector.svelte"

  import { browser } from "$app/environment"
  import { onMount } from "svelte"

  import OneFileMovement from "$lib/animations/OneFileMovement.json"
  import Error2 from "$lib/animations/Error2.json"
  import IdleFile from "$lib/animations/IdleFile.json"

  let LottiePlayer

  onMount(async () => {
    if (browser) {
      const module = await import("@lottiefiles/svelte-lottie-player")
      LottiePlayer = module.LottiePlayer
    }
  })

  export let isPopoverOpen = false

  let file: File | null = null
  let isFileValid = false
  let uploading = false
  let errorMessage = ""
  let successMessage = ""
  let fileInfo = ""
  let dragOver = false

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
    errorMessage = "Invalid file format. Please select a Valid file."
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
            console.log("Fetched files:", files)
            userFilesStore.set(files)
          } else {
            const error = await fetchResponse.json()
            console.error("Error fetching uploaded files:", error)
            errorMessage = "Error fetching uploaded files. Please try again."
            isFileValid = false // Set isFileValid to false on error
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
          isFileValid = false // Set isFileValid to false on error
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        errorMessage =
          "An unexpected error occurred while uploading the file. Please try again."
        isFileValid = false // Set isFileValid to false on error
      } finally {
        uploading = false
      }
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    dragOver = true
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault()
    dragOver = false
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    dragOver = false
    const droppedFile = event.dataTransfer?.files[0]
    if (droppedFile) {
      file = droppedFile
      isFileValid = false
      errorMessage = ""
      successMessage = ""
      fileInfo = ""
      const inspector = new FileInspector({
        target: document.createElement("div"),
        props: { file },
      })
    }
  }

  function closePopover() {
    errorMessage = ""
    successMessage = ""
    fileInfo = ""
    isFileValid = false
    file = null
    isPopoverOpen = false
    document.body.classList.remove("modal-open")
    dispatch("close")
  }
</script>

{#if isPopoverOpen}
  <div class="fixed inset-0 z-50 text-base-content">
    <div class="overlay absolute inset-0 bg-black opacity-50"></div>
    <div
      class="fullscreen-modal card z-10 mx-auto w-full max-w-3xl bg-base-100 shadow-xl"
    >
      <div class="card-body relative">
        <button
          class="btn btn-circle btn-sm absolute right-2 top-2"
          on:click={closePopover}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="card-title mb-4 justify-center text-2xl font-bold">
          Upload Files
        </h3>
        <h3 class="card-title mb-4 justify-center text-lg">
          Upload your farms paddock boundary files
        </h3>

        <div
          class="mx-auto flex w-full max-w-7xl flex-col items-center justify-center"
        >
          <label
            for="dropzone-file"
            class="dark:hover:bg-bray-800 flex h-64 w-3/4 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
          >
            {#if file && !errorMessage}
              <div class="flex flex-col items-center justify-center pb-6 pt-5">
                {#if browser && LottiePlayer}
                  <svelte:component
                    this={LottiePlayer}
                    src={OneFileMovement}
                    autoplay={true}
                    loop={true}
                    controls={false}
                    controlsLayout={null}
                    renderer="svg"
                    background="transparent"
                    height={150}
                    width={200}
                  />
                {/if}
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">{file.name}</span>
                </p>
              </div>
            {:else if errorMessage}
              <div class="flex flex-col items-center justify-center pb-6 pt-5">
                {#if browser && LottiePlayer}
                  <svelte:component
                    this={LottiePlayer}
                    src={Error2}
                    autoplay={true}
                    loop={true}
                    controls={false}
                    controlsLayout={null}
                    renderer="svg"
                    background="transparent"
                    height={200}
                    width={200}
                  />
                {/if}
              </div>
            {:else}
              <div class="flex flex-col items-center justify-center pb-6 pt-5">
                {#if browser && LottiePlayer}
                  <svelte:component
                    this={LottiePlayer}
                    src={IdleFile}
                    autoplay={true}
                    loop={true}
                    controls={false}
                    controlsLayout={null}
                    renderer="svg"
                    background="transparent"
                    height={150}
                    width={150}
                  />
                {/if}
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Click to upload</span> or drag and
                  drop
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  ZIP, ISOXML or .KML files (Max: 50mb)
                </p>
              </div>
            {/if}
            <input
              id="dropzone-file"
              type="file"
              class="hidden"
              on:change={handleFileChange}
            />
          </label>
          <button
            class="btn mt-4 text-white"
            class:bg-gray-400={!file || !isFileValid}
            class:bg-green-500={file && isFileValid}
            class:hover:bg-green-600={file && isFileValid}
            class:opacity-50={!file || !isFileValid}
            disabled={!file || !isFileValid || uploading}
            on:click={handleFileUpload}
          >
            {#if uploading}
              Uploading...
            {:else}
              Upload File
            {/if}
          </button>
        </div>

        <div class="mx-auto justify-center">
          {#if errorMessage}
            <p class="text-red-500">{errorMessage}</p>
          {/if}

          {#if successMessage}
            <p class="text-green-500">{successMessage}</p>
          {/if}

          {#if fileInfo}
            <p>File Info: {fileInfo}</p>
          {/if}
        </div>

        <div class="mx-auto mt-2 max-w-6xl">
          <h3 class="mb-2 text-lg font-bold">File Upload Requirements</h3>
          <ul class="mb-4 list-none pl-6">
            <li class="mb-2">
              <span class="mr-2 inline-block h-4 w-4">
                <ion-icon name="shield-checkmark"></ion-icon>
              </span>
              Zipped Shapefiles, .KML files and ISOXML files are all accepted
            </li>
            <li class="mb-2">
              <span class="mr-2 inline-block h-4 w-4">
                <ion-icon name="shield-checkmark"></ion-icon>
              </span>
              Shapefile ZIP must contain .dbf, .shx and .shp files.
            </li>
            <li class="mb-2">
              <span class="mr-2 inline-block h-4 w-4">
                <ion-icon name="shield-checkmark"></ion-icon>
              </span>
              Multiple ZIP files or an ISOXML can be contained in a single ZIP file.
            </li>
            <li>
              <span class="mr-2 inline-block h-4 w-4">
                <ion-icon name="cloud-download"></ion-icon>
              </span>
              <a
                href="/docs/skan_sample_shapefile.zip"
                class="text-blue-500 underline hover:text-blue-700"
                download
              >
                Download Example Paddock
                <ion-icon name="download-outline"></ion-icon>
              </a>
            </li>
          </ul>

          <h3 class="mb-2 text-lg font-bold">Supported Polygon Types</h3>
          <ul class="list-none pl-6">
            <li class="mb-2">
              <span class="mr-2 inline-block h-4 w-4">
                <ion-icon name="checkbox"></ion-icon>
              </span>
              Polygon
            </li>
            <li>
              <span class="mr-2 inline-block h-4 w-4">
                <ion-icon name="checkbox"></ion-icon>
              </span>
              Multipolygon
            </li>
          </ul>
        </div>

        <FileInspector
          {file}
          on:validFile={handleValidFile}
          on:invalidFile={handleInvalidFile}
        />
      </div>
    </div>
  </div>
{/if}

<style>
  @media (max-width: 640px) {
    .fullscreen-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: calc(100% - 32px);
      max-height: calc(100% - 16px);
      overflow-y: auto;
      border-radius: 8px;
    }
  }
</style>
