<!-- src/components/FieldsOverview.svelte -->
<script lang="ts">
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
  import {
    MapPinned,
    Trash2,
    ChevronDown,
    ChevronUp,
    LandPlot,
    CircleDot,
    Ruler,
    Settings,
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

  function handleLocateField() {
    toast.info("Locate area coming soon", {
      duration: 3000,
    })
  }

  function handleDeleteField() {
    toast.info("Deletion coming soon", {
      duration: 3000,
    })
  }
</script>

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
        <div class="overflow-hidden">
          <Table class="w-full text-black">
            <TableHeader>
              <TableRow>
                <TableHead class="w-auto">Field</TableHead>
                <TableHead class="w-24">Area (ha)</TableHead>
                <TableHead class="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each fields as field}
                <TableRow>
                  <TableCell class="w-auto">
                    <div class="flex items-center space-x-2">
                      <FieldIcon
                        geojson={createGeoJSON(field.boundary)}
                        size={36}
                      />
                      <span class="truncate text-xs font-bold"
                        >{field.name}</span
                      >
                    </div>
                  </TableCell>
                  <TableCell class="w-24">{field.area.toFixed(2)}</TableCell>
                  <TableCell class="w-20">
                    <div class="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        aria-label="Go to field"
                        on:click={handleLocateField}
                      >
                        <MapPinned class="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        aria-label="Delete field"
                        on:click={handleDeleteField}
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
