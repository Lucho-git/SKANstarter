<!-- src/routes/admin/fieldview/+page.svelte -->
<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import UploadPopoverTrigger from "../../../../../components/UploadPopoverTrigger.svelte"
  import FileUploadDashboard from "./FileUploadDashboard.svelte"
  import { Info, FileUp } from "lucide-svelte"
  // Retrieve and set the admin section context
  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("fieldview")
</script>

<div class="app-container">
  <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    <h2 class="mb-6 text-3xl font-bold">FieldView</h2>

    <!-- Information Alert -->
    <div class="alert alert-info mb-6 flex items-start">
      <Info class="mr-4 h-10 w-10" />
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
      <FileUp class="mr-2 mt-4 h-14 w-14" />

      <div>
        <div class="font-bold">Upload Paddock Boundaries</div>
        <div class="my-2">
          <UploadPopoverTrigger />
        </div>
      </div>
    </div>

    <!-- File Upload Dashboard -->
    <div class=" mb-6">
      <FileUploadDashboard />
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
