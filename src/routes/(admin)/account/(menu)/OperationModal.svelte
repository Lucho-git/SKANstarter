<script>
  import { Plus, Pencil, Tractor } from "lucide-svelte"
  import Icon from "@iconify/svelte"
  import {
    operationStore,
    selectedOperationStore,
  } from "$lib/stores/operationStore"
  import { profileStore } from "../../../../stores/profileStore"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"

  let newOperationName = ""
  let newOperationYear = new Date().getFullYear()
  let newOperationDescription = ""
  let editOperationId = null
  let editOperationName = ""
  let editOperationYear = null
  let editOperationDescription = ""

  onMount(() => {
    console.log("Initial Operation Store:", $operationStore)
  })

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

          // Create a synthetic event to pass to handleOperationSelect
          await handleOperationSelect({
            target: { value: data.operation.id },
          })

          newOperationName = ""
          newOperationYear = new Date().getFullYear()
          newOperationDescription = ""
          closeModal("add-modal")
          return "Operation added successfully"
        })

      toast.promise(addPromise, {
        loading: "Adding operation...",
        success: (message) => message,
        error: (err) => `Error: ${err.message}`,
      })
    }
  }

  function editOperation() {
    const operation = $selectedOperationStore
    if (operation) {
      editOperationId = operation.id
      editOperationName = operation.name
      editOperationYear = operation.year
      editOperationDescription = operation.description
      openModal("edit-modal")
    }
  }

  async function updateOperation() {
    if (editOperationName.trim()) {
      const updatedOperation = {
        id: editOperationId,
        name: editOperationName.trim(),
        year: Number(editOperationYear),
        description: editOperationDescription.trim(),
        master_map_id: $selectedOperationStore.master_map_id,
      }

      console.log("Updating operation:", updatedOperation)

      operationStore.update((ops) =>
        ops.map((op) => (op.id === editOperationId ? updatedOperation : op)),
      )

      // Update selected operation if it's the one being edited
      if ($selectedOperationStore.id === editOperationId) {
        selectedOperationStore.set(updatedOperation)
      }

      closeModal("edit-modal")
      console.log("Operation updated successfully")
    }
  }

  async function handleOperationSelect(event) {
    console.log("Selected New Operation:", event.target.value)
    const selectedId = event.target.value
    const selectedOperation = $operationStore.find((op) => op.id === selectedId)

    if (selectedOperation) {
      console.log("Selected Operation:", selectedOperation)
      selectedOperationStore.set(selectedOperation)

      try {
        const response = await fetch(
          "/api/profiles/update-selected-operation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profileId: $profileStore.id,
              operationId: selectedId,
            }),
          },
        )

        const result = await response.json()
        if (!response.ok) {
          console.error("Failed to update selected operation:", result.error)
          toast.error(`Failed to update selected operation: ${result.error}`)
          return
        }

        console.log(
          "Successfully updated selected operation in database:",
          result.profile,
        )
        toast.success("Successfully updated selected operation")
      } catch (error) {
        console.error("Error updating selected operation:", error)
        toast.error("Failed to update selected operation")
      }
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
    <Icon class="mr-2" icon="ph:tractor-fill" /> Operation
  </h2>
  <div class="flex flex-col items-center gap-4 sm:flex-row">
    <select
      class="select select-bordered flex-grow bg-base-100"
      value={$selectedOperationStore?.id}
      on:change={handleOperationSelect}
    >
      {#each $operationStore as operation}
        <option value={operation.id}>
          {operation.name} ({operation.year})
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
        <Plus class="h-5 w-5" />Operation
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
      <button class="btn btn-primary" on:click={updateOperation}
        >Update Operation</button
      >
      <label for="edit-modal" class="btn">Close</label>
    </div>
  </div>
</div>
