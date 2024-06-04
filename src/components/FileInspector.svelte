<script lang="ts">
  import { createEventDispatcher } from "svelte"

  export let file: File

  const dispatch = createEventDispatcher()

  function isValidFile(file: File): boolean {
    // Check if the file has a valid extension
    const validExtensions = [".zip", ".kml", ".isoxml", "xml"]
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf("."))
    return validExtensions.includes(fileExtension)
  }

  function validateFile() {
    if (isValidFile(file)) {
      dispatch("validFile", { file })
    } else {
      dispatch("invalidFile", { file })
    }
  }

  $: if (file) {
    validateFile()
  }
</script>
