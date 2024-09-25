<!-- src/routes/admin/fieldview/+page.svelte -->
<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import UploadPopoverTrigger from "../../../../../components/UploadPopoverTrigger.svelte"
  import FileUploadDashboard from "./FileUploadDashboard.svelte"
  import FieldsOverview from "./FieldsOverview.svelte"
  import { Info, FileUp } from "lucide-svelte"

  // Retrieve and set the admin section context
  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("fieldview")
</script>

<div class="app-container">
  <div class="mx-auto w-full">
    <h2 class="mb-6 text-3xl font-bold">FieldView</h2>

    <!-- Upload Section -->
    <div class="alert alert-success mb-6 flex items-start">
      <FileUp class="mr-2 mt-4 h-14 w-14" />

      <div>
        <div class="font-bold">Upload Paddock Boundaries</div>
        <div class="my-2">
          <UploadPopoverTrigger />
        </div>
      </div>
    </div>

    <!-- File Upload Dashboard -->
    <div class="mb-6">
      <FileUploadDashboard />
    </div>

    <!-- Fields Overview -->
    <div class="mb-6">
      <FieldsOverview />
    </div>
  </div>
</div>

<style>
  .app-container {
    display: flex;
    width: 100%;
    min-height: 100vh;
  }
</style>
