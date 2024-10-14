<script>
  import { Plus, Pencil, Tractor } from "lucide-svelte"
  import Icon from "@iconify/svelte"

  let operations = [
    {
      id: 1,
      title: "Software Development",
      year: 2023,
      description: "Developing cutting-edge software solutions",
    },
    {
      id: 2,
      title: "Data Analysis",
      year: 2022,
      description: "Analyzing complex datasets to derive insights",
    },
    {
      id: 3,
      title: "Project Management",
      year: 2024,
      description: "Overseeing and coordinating various projects",
    },
  ]
  let selectedOperation = operations[0].id.toString()
  let newOperationTitle = ""
  let newOperationYear = new Date().getFullYear()
  let newOperationDescription = ""
  let editOperationId = null
  let editOperationTitle = ""
  let editOperationYear = null
  let editOperationDescription = ""

  function addOperation() {
    if (newOperationTitle.trim()) {
      operations = [
        ...operations,
        {
          id: operations.length + 1,
          title: newOperationTitle.trim(),
          year: Number(newOperationYear),
          description: newOperationDescription.trim(),
        },
      ]
      newOperationTitle = ""
      newOperationYear = new Date().getFullYear()
      newOperationDescription = ""
      closeModal("add-modal")
    }
  }

  function editOperation() {
    const operation = operations.find(
      (op) => op.id.toString() === selectedOperation,
    )
    editOperationId = operation.id
    editOperationTitle = operation.title
    editOperationYear = Number(operation.year)
    editOperationDescription = operation.description
    openModal("edit-modal")
  }

  function updateOperation() {
    if (editOperationTitle.trim()) {
      operations = operations.map((op) =>
        op.id === editOperationId
          ? {
              ...op,
              title: editOperationTitle.trim(),
              year: Number(editOperationYear),
              description: editOperationDescription.trim(),
            }
          : op,
      )
      closeModal("edit-modal")
    }
  }

  let currentYear = new Date().getFullYear()
  let yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  function openModal(id) {
    const modal = document.getElementById(id)
    if (modal) modal.checked = true
  }

  function closeModal(id) {
    const modal = document.getElementById(id)
    if (modal) modal.checked = false
  }
</script>

<div class="card bg-base-200 p-4 shadow-sm">
  <h2
    class="mb-4 flex items-center justify-center text-center text-xl font-bold"
  >
    <Icon class="mr-2 " icon="ph:tractor-fill" /> Operation
  </h2>
  <div class="flex flex-col items-center gap-4 sm:flex-row">
    <select
      class="select select-bordered flex-grow bg-base-100"
      bind:value={selectedOperation}
    >
      {#each operations as operation}
        <option value={operation.id.toString()}>
          {operation.title} ({operation.year})
        </option>
      {/each}
    </select>

    <div class="flex gap-2">
      <button
        class="btn btn-square btn-outline bg-base-100"
        on:click={editOperation}
      >
        <Pencil class="h-5 w-5" />
      </button>

      <label for="add-modal" class="btn btn-secondary">
        <Plus class=" h-5 w-5" />Operation
      </label>
    </div>
  </div>
</div>

<!-- Add Operation Modal -->
<input type="checkbox" id="add-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box bg-base-200">
    <h3 class="mb-4 text-lg font-bold">Add New Operation</h3>
    <div class="form-control mb-4">
      <label for="new-operation-title" class="label">
        <span class="label-text">Operation Title</span>
      </label>
      <input
        id="new-operation-title"
        type="text"
        placeholder="Enter title"
        class="input input-bordered w-full bg-base-100"
        bind:value={newOperationTitle}
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
      <label for="add-modal" class="btn">Close</label>
    </div>
  </div>
</div>

<!-- Edit Operation Modal -->
<input type="checkbox" id="edit-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box bg-base-200">
    <h3 class="mb-4 text-lg font-bold">Edit Operation</h3>
    <div class="form-control mb-4">
      <label for="edit-operation-title" class="label">
        <span class="label-text">Operation Title</span>
      </label>
      <input
        id="edit-operation-title"
        type="text"
        placeholder="Enter title"
        class="input input-bordered w-full bg-base-100"
        bind:value={editOperationTitle}
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
      <button class="btn btn-primary" on:click={updateOperation}
        >Update Operation</button
      >
      <label for="edit-modal" class="btn">Close</label>
    </div>
  </div>
</div>
