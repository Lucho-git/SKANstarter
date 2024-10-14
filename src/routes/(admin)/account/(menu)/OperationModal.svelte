<script>
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import { Label } from "$lib/components/ui/label"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "$lib/components/ui/select"
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "$lib/components/ui/dialog"
  import { Plus, Pencil } from "lucide-svelte"
  import { Textarea } from "$lib/components/ui/textarea"

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
  let selectedOperationId = operations[0].id.toString() // Set default to the first operation
  let newOperationTitle = ""
  let newOperationYear = 2024 // Hardcoded to 2024
  let newOperationDescription = ""
  let editOperationId = null
  let editOperationTitle = ""
  let editOperationYear = 2024 // Initialize with 2024
  let editOperationDescription = ""
  let showAddDialog = false
  let showEditDialog = false

  let currentYear = 2024 // Hardcoded to 2024
  let yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i)

  $: selectedOperation = operations.find(
    (op) => op.id.toString() === selectedOperationId,
  )

  function addOperation() {
    if (newOperationTitle.trim()) {
      operations = [
        ...operations,
        {
          id: operations.length + 1,
          title: newOperationTitle.trim(),
          year: newOperationYear,
          description: newOperationDescription.trim(),
        },
      ]
      newOperationTitle = ""
      newOperationYear = currentYear
      newOperationDescription = ""
      showAddDialog = false
    }
  }

  function editOperation() {
    if (selectedOperation) {
      editOperationId = selectedOperation.id
      editOperationTitle = selectedOperation.title
      editOperationYear = selectedOperation.year
      editOperationDescription = selectedOperation.description
      showEditDialog = true
    }
  }

  function updateOperation() {
    if (editOperationTitle.trim()) {
      operations = operations.map((op) =>
        op.id === editOperationId
          ? {
              ...op,
              title: editOperationTitle.trim(),
              year: editOperationYear,
              description: editOperationDescription.trim(),
            }
          : op,
      )
      showEditDialog = false
    }
  }
</script>

<div class="rounded-lg border bg-background p-4 shadow-sm">
  <div
    class="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0"
  >
    <Select bind:value={selectedOperationId} class="w-full sm:w-auto">
      <SelectTrigger class="w-full sm:w-[300px]">
        <SelectValue placeholder="Select an operation">
          {#if selectedOperation}
            {selectedOperation.title} ({selectedOperation.year})
          {/if}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {#each operations as operation}
          <SelectItem value={operation.id.toString()}>
            {operation.title} ({operation.year})
          </SelectItem>
        {/each}
      </SelectContent>
    </Select>

    <div class="flex items-center space-x-2">
      <Button variant="ghost" size="icon" on:click={editOperation}>
        <Pencil class="h-4 w-4" />
      </Button>

      <Dialog bind:open={showAddDialog}>
        <DialogTrigger>
          <Button><Plus class="mr-2 h-4 w-4" /> Add Operation</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Operation</DialogTitle>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="newOperationTitle" class="text-right"
                >Operation Title</Label
              >
              <Input
                id="newOperationTitle"
                class="col-span-3"
                bind:value={newOperationTitle}
              />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="newOperationYear" class="text-right">Year</Label>
              <Select bind:value={newOperationYear}>
                <SelectTrigger class="col-span-3">
                  <SelectValue>{newOperationYear}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {#each yearOptions as year}
                    <SelectItem value={year}>{year}</SelectItem>
                  {/each}
                </SelectContent>
              </Select>
            </div>
            <div class="grid grid-cols-4 items-start gap-4">
              <Label for="newOperationDescription" class="text-right"
                >Description</Label
              >
              <Textarea
                id="newOperationDescription"
                class="col-span-3"
                bind:value={newOperationDescription}
                placeholder="Enter a brief description of the operation..."
                rows="3"
              />
            </div>
          </div>
          <Button on:click={addOperation}>Add Operation</Button>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <Dialog bind:open={showEditDialog}>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Operation</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="editOperationTitle" class="text-right"
            >Operation Title</Label
          >
          <Input
            id="editOperationTitle"
            class="col-span-3"
            bind:value={editOperationTitle}
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="editOperationYear" class="text-right">Year</Label>
          <Select bind:value={editOperationYear}>
            <SelectTrigger class="col-span-3">
              <SelectValue>{editOperationYear}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {#each yearOptions as year}
                <SelectItem value={year}>{year}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-4 items-start gap-4">
          <Label for="editOperationDescription" class="text-right"
            >Description</Label
          >
          <Textarea
            id="editOperationDescription"
            class="col-span-3"
            bind:value={editOperationDescription}
            rows="3"
          />
        </div>
      </div>
      <Button on:click={updateOperation}>Update Operation</Button>
    </DialogContent>
  </Dialog>
</div>
