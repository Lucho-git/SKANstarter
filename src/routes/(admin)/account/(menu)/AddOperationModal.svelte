<script>
  import {
    operationStore,
    selectedOperationStore,
  } from "$lib/stores/operationStore"
  import { menuStore } from "../../../../stores/menuStore"
  import { toast } from "svelte-sonner"

  let newOperationName = ""
  let newOperationYear = new Date().getFullYear()
  let newOperationDescription = ""

  let currentYear = new Date().getFullYear()
  let yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  async function addOperation() {
    if (newOperationName.trim()) {
      const newOperation = {
        name: newOperationName.trim(),
        year: Number(newOperationYear),
        description: newOperationDescription.trim(),
        master_map_id: $operationStore[0]?.master_map_id,
      }

      const addPromise = fetch("/api/operations/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOperation),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add operation")
          }
          return response.json()
        })
        .then(async (data) => {
          operationStore.update((ops) => [...ops, data.operation])
          selectedOperationStore.set(data.operation)
          newOperationName = ""
          newOperationYear = new Date().getFullYear()
          newOperationDescription = ""
          menuStore.update((m) => ({ ...m, showAddOperationModal: false }))
          return "Operation added successfully"
        })

      toast.promise(addPromise, {
        loading: "Adding operation...",
        success: (message) => message,
        error: (err) => `Error: ${err.message}`,
      })
    }
  }
</script>

<div class="modal modal-open">
  <div class="modal-box bg-base-200">
    <h3 class="mb-4 text-lg font-bold">Add New Operation</h3>

    <div class="form-control mb-4">
      <label for="new-operation-name" class="label">
        <span class="label-text">Operation Name</span>
      </label>
      <input
        id="new-operation-name"
        type="text"
        placeholder="Enter name"
        class="input input-bordered w-full bg-base-100"
        bind:value={newOperationName}
      />
    </div>

    <div class="form-control mb-4">
      <label for="new-operation-year" class="label">
        <span class="label-text">Year</span>
      </label>
      <select
        id="new-operation-year"
        class="select select-bordered w-full bg-base-100"
        bind:value={newOperationYear}
      >
        {#each yearOptions as year}
          <option value={year}>{year}</option>
        {/each}
      </select>
    </div>

    <div class="form-control mb-4">
      <label for="new-operation-description" class="label">
        <span class="label-text">Description</span>
      </label>
      <textarea
        id="new-operation-description"
        class="textarea textarea-bordered w-full bg-base-100"
        placeholder="Enter description"
        bind:value={newOperationDescription}
      ></textarea>
    </div>

    <div class="modal-action">
      <button class="btn btn-primary" on:click={addOperation}
        >Add Operation</button
      >
      <button
        class="btn"
        on:click={() =>
          menuStore.update((m) => ({ ...m, showAddOperationModal: false }))}
      >
        Close
      </button>
    </div>
  </div>
</div>
