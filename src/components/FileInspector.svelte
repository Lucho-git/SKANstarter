<script lang="ts">
  import { createEventDispatcher } from "svelte"

  export let file: File

  const dispatch = createEventDispatcher()

  function isValidFile(file: File): boolean {
    // Implement your file validation logic here
    // Return true if the file is valid, false otherwise
    // Example validation: Check if the file is a CSV file
    return file.type === "text/csv"
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
