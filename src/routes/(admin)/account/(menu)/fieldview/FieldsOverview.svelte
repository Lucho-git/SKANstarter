<script lang="ts">
  import { goto } from "$app/navigation"

  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table"
  import { Button } from "$lib/components/ui/button"
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card"
  import { Input } from "$lib/components/ui/input"

  import {
    MapPinned,
    Trash2,
    ChevronDown,
    ChevronUp,
    LandPlot,
    SquarePen,
  } from "lucide-svelte"

  import { connectedMapStore } from "../../../../../stores/connectedMapStore"
  import { fieldStore } from "../../../../../stores/fieldStore"
  import { get } from "svelte/store"
  import FieldIcon from "$lib/components/FieldIcon.svelte"
  import { toast } from "svelte-sonner"

  $: fields = $fieldStore
  $: connectedMap = $connectedMapStore
  $: farmName = connectedMap.is_connected ? connectedMap.map_name : null

  let isExpanded = true
  let modalId = "edit-field-modal"
  let currentEditingField: { field_id: string; name: string } | null = null
  let newFieldName = ""

  function toggleExpand() {
    isExpanded = !isExpanded
  }

  function createGeoJSON(boundary) {
    return {
      type: "Feature",
      geometry: boundary,
      properties: {},
    }
  }

  function openEditModal(field: any) {
    currentEditingField = field
    newFieldName = field.name
    const modal = document.getElementById(modalId) as HTMLDialogElement
    if (modal) modal.showModal()
  }

  function closeModal() {
    const modal = document.getElementById(modalId) as HTMLDialogElement
    if (modal) modal.close()
  }

  async function handleEditField() {
    if (!currentEditingField || !newFieldName.trim()) return

    try {
      const response = await fetch("/api/files/update_field", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldId: currentEditingField.field_id,
          name: newFieldName.trim(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        fieldStore.update((fields: any) =>
          fields.map((field: any) =>
            field.field_id === currentEditingField?.field_id
              ? { ...field, name: newFieldName.trim() }
              : field,
          ),
        )
        toast.success("Field name updated successfully")
        closeModal()
      } else {
        throw new Error(result.error || "Failed to update field name")
      }
    } catch (error) {
      console.error("Error updating field name:", error)
      toast.error("Failed to update field name. Please try again.")
    }
  }

  function handleLocateField(fieldId: string) {
    console.log("locating field", fieldId)
    goto(`/account/mapviewer?field=${fieldId}`)
  }

  async function handleDeleteField(fieldId: string) {
    const fieldToDelete = $fieldStore.find(
      (field) => field.field_id === fieldId,
    )

    if (!fieldToDelete) {
      toast.error("Field not found")
      return
    }

    const isConfirmed = confirm(
      `Are you sure you want to delete the field "${fieldToDelete.name}"?`,
    )

    if (!isConfirmed) return

    console.log("Deleting field with ID:", fieldId)
    try {
      const response = await fetch("/api/files/delete_fields", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fieldId }),
      })

      const result = await response.json()

      if (response.ok) {
        fieldStore.update((fields) =>
          fields.filter((field) => field.field_id !== fieldId),
        )
        toast.success(`Field "${fieldToDelete.name}" deleted successfully`)
        console.log($fieldStore)
      } else {
        throw new Error(result.error || "Failed to delete field")
      }
    } catch (error) {
      console.error("Error deleting field:", error)
      toast.error(
        `Failed to delete field "${fieldToDelete.name}". Please try again.`,
      )
    }
  }

  let fieldNameStyle = "min-width: 20vw; max-width: 30vw;"
  let areaCellStyle = "width: 15%; min-width: 80px;"
  let actionsCellStyle = "width: 20%; min-width: 20vw;"
</script>

<!-- DaisyUI Modal -->
<dialog id={modalId} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <div class="flex items-center gap-2">
      <div class="rounded-lg bg-primary/10 p-2">
        <SquarePen class="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 class="text-lg font-bold">Edit Field Name</h3>
        <p class="text-sm text-muted-foreground">
          Change the name of your field
        </p>
      </div>
    </div>

    <div class="space-y-4 p-4">
      <Input
        id="name"
        bind:value={newFieldName}
        placeholder="Enter new field name"
        class="w-full"
      />
    </div>

    <div class="modal-action">
      <form method="dialog" class="flex w-full gap-2 sm:w-auto">
        <Button
          variant="outline"
          class="flex-1 sm:flex-none"
          on:click={closeModal}
        >
          Cancel
        </Button>
        <Button class="flex-1 sm:flex-none" on:click={handleEditField}>
          Save changes
        </Button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<Card>
  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
    <div class="flex items-center space-x-2">
      <LandPlot class="h-6 w-6" />
      <CardTitle class="text-2xl font-bold">Fields</CardTitle>
    </div>
    <Button variant="ghost" size="sm" on:click={toggleExpand}>
      {#if isExpanded}
        <ChevronUp class="h-4 w-4" />
      {:else}
        <ChevronDown class="h-4 w-4" />
      {/if}
    </Button>
  </CardHeader>
  <CardContent class="p-0">
    {#if farmName}
      <p class="px-4 py-2 text-sm text-muted-foreground">{farmName}</p>
    {/if}
    {#if farmName && fields.length > 0}
      {#if isExpanded}
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={fieldNameStyle}>Field</TableHead>
                <TableHead style={areaCellStyle}>Area (ha)</TableHead>
                <TableHead style={actionsCellStyle}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each fields as field}
                <TableRow>
                  <TableCell style={fieldNameStyle}>
                    <div class="flex max-w-full items-center space-x-2">
                      <FieldIcon
                        geojson={createGeoJSON(field.boundary)}
                        size={36}
                      />
                      <span class="truncate text-xs font-bold"
                        >{field.name}</span
                      >
                    </div>
                  </TableCell>
                  <TableCell style={areaCellStyle}
                    >{field.area.toFixed(1)}</TableCell
                  >
                  <TableCell style={actionsCellStyle}>
                    <div class="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        aria-label="Edit field"
                        on:click={() => openEditModal(field)}
                      >
                        <SquarePen class="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        aria-label="Go to field"
                        on:click={() => handleLocateField(field.field_id)}
                      >
                        <MapPinned class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        aria-label="Delete field"
                        on:click={() => handleDeleteField(field.field_id)}
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    {:else}
      <div class="py-10 text-center">
        <p class="text-muted-foreground">
          {farmName ? "No fields available" : "No map connected"}
        </p>
      </div>
    {/if}
  </CardContent>
</Card>
