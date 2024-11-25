<script>
  import {
    operationStore,
    selectedOperationStore,
  } from "$lib/stores/operationStore"
  import { menuStore } from "../../../../stores/menuStore"
  import { toast } from "svelte-sonner"

  let editOperationId = $selectedOperationStore?.id
  let editOperationName = $selectedOperationStore?.name
  let editOperationYear = $selectedOperationStore?.year
  let editOperationDescription = $selectedOperationStore?.description

  let currentYear = new Date().getFullYear()
  let yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  async function updateOperation() {
    if (editOperationName.trim()) {
      const updatedOperation = {
        id: editOperationId,
        name: editOperationName.trim(),
        year: Number(editOperationYear),
        description: editOperationDescription.trim(),
        master_map_id: $selectedOperationStore.master_map_id,
      }

      const updatePromise = fetch("/api/operations/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOperation),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update operation")
          }
          return response.json()
        })
        .then((data) => {
          operationStore.update((ops) =>
            ops.map((op) =>
              op.id === editOperationId ? updatedOperation : op,
            ),
          )

          if ($selectedOperationStore.id === editOperationId) {
            selectedOperationStore.set(updatedOperation)
          }

          menuStore.update((m) => ({ ...m, showEditOperationModal: false }))
          return "Operation updated successfully"
        })

      toast.promise(updatePromise, {
        loading: "Updating operation...",
        success: (message) => message,
        error: (err) => `Error: ${err.message}`,
      })
    }
  }
</script>

<div class="modal modal-open">
  <div class="modal-box bg-base-200">
    <h3 class="mb-4 text-lg font-bold">Edit Operation</h3>

    <div class="form-control mb-4">
      <label for="edit-operation-name" class="label">
        <span class="label-text">Operation Name</span>
      </label>
      <input
        id="edit-operation-name"
        type="text"
        placeholder="Enter name"
        class="input input-bordered w-full bg-base-100"
        bind:value={editOperationName}
      />
    </div>

    <div class="form-control mb-4">
      <label for="edit-operation-year" class="label">
        <span class="label-text">Year</span>
      </label>
      <select
        id="edit-operation-year"
        class="select select-bordered w-full bg-base-100"
        bind:value={editOperationYear}
      >
        {#each yearOptions as year}
          <option value={year}>{year}</option>
        {/each}
      </select>
    </div>

    <div class="form-control mb-4">
      <label for="edit-operation-description" class="label">
        <span class="label-text">Description</span>
      </label>
      <textarea
        id="edit-operation-description"
        class="textarea textarea-bordered w-full bg-base-100"
        placeholder="Enter description"
        bind:value={editOperationDescription}
      ></textarea>
    </div>

    <div class="modal-action">
      <button class="btn btn-primary" on:click={updateOperation}>
        Update Operation
      </button>
      <button
        class="btn"
        on:click={() =>
          menuStore.update((m) => ({ ...m, showEditOperationModal: false }))}
      >
        Close
      </button>
    </div>
  </div>
</div>
