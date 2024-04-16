<!-- FileUpload.svelte -->
<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { userFilesStore } from "../stores/userFilesStore"
  import FileInspector from "./FileInspector.svelte"
  import { LottiePlayer } from "@lottiefiles/svelte-lottie-player"

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

    dispatch("close")
  }
</script>

{#if isPopoverOpen}
  <div class="fixed inset-0 flex items-center justify-center z-50">
    <div class="overlay absolute inset-0 bg-black opacity-50"></div>
    <div class="card w-full max-w-3xl bg-base-100 shadow-xl z-10">
      <div class="card-body relative">
        <button
          class="btn btn-sm btn-circle absolute top-2 right-2"
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
        <h3 class="card-title justify-center text-2xl font-bold mb-4">
          Upload Files
        </h3>
        <h3 class="card-title justify-center text-lg mb-4">
          Upload your farms paddock boundary files
        </h3>

        <div
          class="flex flex-col items-center justify-center w-full max-w-7xl mx-auto"
        >
          <label
            for="dropzone-file"
            class="flex flex-col items-center justify-center w-3/4 h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
          >
            {#if file && !errorMessage}
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <LottiePlayer
                  src="/animations/OneFileMovement.json"
                  autoplay={true}
                  loop={true}
                  controls={false}
                  controlsLayout={null}
                  renderer="svg"
                  background="transparent"
                  height={150}
                  width={200}
                />
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">{file.name}</span>
                </p>
              </div>
            {:else if errorMessage}
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <LottiePlayer
                  src="/animations/Error2.json"
                  autoplay={true}
                  loop={true}
                  controls={false}
                  controlsLayout={null}
                  renderer="svg"
                  background="transparent"
                  height={200}
                  width={200}
                />
              </div>
            {:else}
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <LottiePlayer
                  src="/animations/IdleFile.json"
                  autoplay={true}
                  loop={true}
                  controls={false}
                  controlsLayout={null}
                  renderer="svg"
                  background="transparent"
                  height={150}
                  width={150}
                />
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
            class="btn mt-4"
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

        <div class="justify-center mx-auto">
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

        <div class="mt-2 max-w-6xl mx-auto">
          <h3 class="text-lg font-bold mb-2">File Upload Requirements</h3>
          <ul class="list-none pl-6 mb-4">
            <li class="mb-2">
              <span class="inline-block w-4 h-4 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              Zipped Shapefiles, .KML files and ISOXML files are all accepted
            </li>
            <li class="mb-2">
              <span class="inline-block w-4 h-4 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              Shapefile ZIP must contain .dbf, .shx and .shp files.
            </li>
            <li class="mb-2">
              <span class="inline-block w-4 h-4 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              Multiple ZIP files or an ISOXML can be contained in a single ZIP file.
            </li>
            <li>
              <span class="inline-block w-4 h-4 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              <a
                href="docs\skan_sample_shapefile.zip"
                class="text-blue-500 hover:text-blue-700 underline"
              >
                Download Example Paddock
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 inline-block ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            </li>
          </ul>

          <h3 class="text-lg font-bold mb-2">Supported Polygon Types</h3>
          <ul class="list-none pl-6">
            <li class="mb-2">
              <span class="inline-block w-4 h-4 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              Polygon
            </li>
            <li>
              <span class="inline-block w-4 h-4 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
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
