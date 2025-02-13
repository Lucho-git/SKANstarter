<script lang="ts">
  import { onMount } from "svelte"
  import { Card, CardContent } from "$lib/components/ui/card"
  import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogOverlay,
    DialogPortal,
  } from "$lib/components/ui/dialog"
  import { Checkbox } from "$lib/components/ui/checkbox"
  import {
    MapPin,
    Search,
    SortAsc,
    SortDesc,
    Trash2,
    ChevronDown,
    X,
  } from "lucide-svelte"
  import { DateTime } from "luxon"
  import {
    getPinsFromMapId,
    deletePins,
    type MapMarker,
  } from "$lib/utils/pinsFromMapId"
  import IconSVG from "../../../../components/IconSVG.svelte"

  export let mapMarkers: number
  export let isPaidSubscription: boolean
  export let markerLimit: number
  export let mapId: string

  let loading = true
  let error: any = null
  let markers: MapMarker[] = []
  let searchQuery = ""
  let sortDirection: "asc" | "desc" = "desc"
  let selectedPins = new Set<number>()

  // Pagination variables
  let itemsPerPage = 40
  let currentPage = 1

  function getMarkerIcon(iconName: string) {
    const cleanIconName = iconName.replace("custom-svg-", "")

    if (iconName.startsWith("custom-svg-")) {
      return {
        type: "svg",
        name: cleanIconName,
      }
    } else if (iconName.startsWith("ionic-")) {
      return {
        type: "ionic",
        name: iconName.replace("ionic-", ""),
      }
    } else {
      return {
        type: "default",
        name: "📍",
      }
    }
  }

  async function loadPins() {
    loading = true
    const { data, error: pinError } = await getPinsFromMapId(mapId)
    console.log("Pins Data", data)

    if (pinError) {
      error = pinError
      loading = false
      return
    }

    markers = data || []
    loading = false
  }

  async function handleBulkDelete() {
    try {
      const pinIdsToDelete = Array.from(selectedPins)
      const error = await deletePins(pinIdsToDelete)

      if (error) {
        console.error("Error deleting pins:", error)
        return
      }

      await loadPins()
      clearSelection()
    } catch (err) {
      console.error("Error in handleBulkDelete:", err)
    }
  }

  onMount(() => {
    loadPins()
  })

  $: filteredMarkers = markers
    .filter((marker) =>
      marker.marker_data.properties.icon
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime()
      const dateB = new Date(b.updated_at).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

  $: paginatedMarkers = filteredMarkers.slice(0, currentPage * itemsPerPage)
  $: hasMorePages = filteredMarkers.length > currentPage * itemsPerPage

  $: isAllSelected =
    filteredMarkers.length > 0 &&
    filteredMarkers.every((marker) => selectedPins.has(marker.id))

  function loadMore() {
    if (hasMorePages) {
      currentPage++
    }
  }

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement
    if (
      target.scrollHeight - target.scrollTop <= target.clientHeight + 100 &&
      hasMorePages
    ) {
      loadMore()
    }
  }

  function toggleSort() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc"
  }

  function formatDate(dateString: string) {
    return DateTime.fromISO(dateString).toRelative()
  }

  function togglePin(id: number) {
    if (selectedPins.has(id)) {
      selectedPins.delete(id)
    } else {
      selectedPins.add(id)
    }
    selectedPins = selectedPins
  }

  function toggleAllPins() {
    if (isAllSelected) {
      selectedPins.clear()
    } else {
      filteredMarkers.forEach((marker) => selectedPins.add(marker.id))
    }
    selectedPins = selectedPins
  }

  function clearSelection() {
    selectedPins.clear()
    selectedPins = selectedPins
  }
</script>

<Dialog>
  <DialogTrigger>
    <Card
      class="group relative cursor-pointer border border-base-300 bg-gradient-to-br from-base-100 to-base-200 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-base-200/80 hover:shadow-lg"
    >
      <div class="absolute right-2 top-2 rounded-full bg-base-content/5 p-1">
        <ChevronDown
          class="h-3 w-3 text-base-content/50 transition-transform duration-200 group-hover:-rotate-180 group-hover:text-primary"
        />
      </div>

      <CardContent class="flex h-full flex-col items-center justify-center p-2">
        <MapPin
          class="mb-1 h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110"
        />
        <p class="text-xs font-semibold text-base-content">Pins</p>
        <span class="text-base font-bold text-base-content">
          {mapMarkers}{#if !isPaidSubscription}/{markerLimit}{/if}
        </span>
        <p class="mt-1 text-center text-[10px] text-base-content/70">
          {#if isPaidSubscription}
            Unlimited Drops
          {:else}
            Total markers
          {/if}
        </p>
      </CardContent>
    </Card>
  </DialogTrigger>

  <DialogPortal>
    <DialogOverlay class="bg-black/80" />
    <DialogContent
      class="min-h-screen rounded-none bg-base-100 sm:min-h-fit sm:max-w-[425px] sm:rounded-xl"
    >
      <DialogHeader>
        <div class="flex items-center gap-2">
          <div class="rounded-lg bg-primary/10 p-2">
            <MapPin class="h-5 w-5 text-primary" />
          </div>
          <div>
            <DialogTitle>Map Pins</DialogTitle>
            <DialogDescription>View and manage your map pins</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="space-y-4 p-4">
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50"
            />
            <input
              type="text"
              placeholder="Search pins..."
              bind:value={searchQuery}
              class="input input-bordered w-full pl-10 text-sm"
            />
          </div>
          <button class="btn btn-ghost btn-sm gap-2" on:click={toggleSort}>
            {#if sortDirection === "asc"}
              <SortAsc class="h-4 w-4" />
            {:else}
              <SortDesc class="h-4 w-4" />
            {/if}
            Date
          </button>
        </div>

        <div
          class="flex items-center justify-between text-sm text-base-content/70"
        >
          <span>
            {filteredMarkers.length} pin{filteredMarkers.length === 1
              ? ""
              : "s"} found
          </span>
          {#if filteredMarkers.length > 0}
            <button
              class="text-xs text-primary hover:underline"
              on:click={toggleAllPins}
            >
              {isAllSelected ? "Deselect all" : "Select all"}
            </button>
          {/if}
        </div>
      </div>

      <div class="max-h-[60vh] overflow-y-auto" on:scroll={handleScroll}>
        <div class="space-y-2 px-4">
          {#if loading}
            {#each Array(5) as _}
              <div class="animate-pulse rounded-lg bg-base-200 p-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded bg-base-300" />
                    <div>
                      <div class="h-4 w-32 rounded bg-base-300" />
                      <div class="mt-2 h-3 w-24 rounded bg-base-300" />
                    </div>
                  </div>
                  <div class="h-5 w-5 rounded bg-base-300" />
                </div>
              </div>
            {/each}
          {:else if error}
            <div class="rounded-lg bg-error/10 p-4 text-error">
              Failed to load pins. Please try again.
            </div>
          {:else}
            {#each paginatedMarkers as marker (marker.id)}
              <div
                class="group flex cursor-pointer items-center justify-between rounded-lg bg-base-200 p-3 hover:bg-base-300"
                on:click={() => togglePin(marker.id)}
                on:keydown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    togglePin(marker.id)
                  }
                }}
                role="checkbox"
                aria-checked={selectedPins.has(marker.id)}
                tabindex="0"
              >
                <div class="flex flex-1 items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-base-300"
                  >
                    {#if getMarkerIcon(marker.marker_data.properties.icon).type === "svg"}
                      <IconSVG
                        icon={getMarkerIcon(marker.marker_data.properties.icon)
                          .name}
                        size="24px"
                      />
                    {:else if getMarkerIcon(marker.marker_data.properties.icon).type === "ionic"}
                      <ion-icon
                        name={getMarkerIcon(marker.marker_data.properties.icon)
                          .name}
                        style="font-size: 24px;"
                      />
                    {:else}
                      <span class="text-xl">📍</span>
                    {/if}
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-base-content">
                      {marker.marker_data.properties.icon}
                    </h4>
                    <p class="text-xs text-base-content/70">
                      {formatDate(marker.updated_at)}
                    </p>
                  </div>
                  <Checkbox
                    checked={selectedPins.has(marker.id)}
                    tabindex="-1"
                  />
                </div>
              </div>
            {/each}

            {#if hasMorePages}
              <div class="flex justify-center py-4">
                <button class="btn btn-ghost btn-sm" on:click={loadMore}>
                  Load More ({filteredMarkers.length - paginatedMarkers.length} remaining)
                </button>
              </div>
            {/if}
          {/if}
        </div>
      </div>

      <DialogFooter class="sm:justify-between">
        {#if selectedPins.size > 0}
          <div class="hidden items-center gap-4 sm:flex">
            <div class="flex items-center gap-2">
              <button class="btn btn-ghost btn-sm" on:click={clearSelection}>
                <X class="h-4 w-4" />
              </button>
              <span class="text-sm font-medium">
                {selectedPins.size} selected
              </span>
            </div>
            <button
              class="btn btn-error btn-sm gap-2"
              on:click={handleBulkDelete}
            >
              <Trash2 class="h-4 w-4" />
              Delete
            </button>
          </div>
        {/if}
        <DialogClose class="btn">Close</DialogClose>
      </DialogFooter>

      {#if selectedPins.size > 0}
        <div
          class="fixed bottom-0 left-0 flex w-full items-center justify-between border-t bg-base-100 p-4 sm:hidden"
        >
          <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-sm" on:click={clearSelection}>
              <X class="h-4 w-4" />
            </button>
            <span class="text-sm font-medium">
              {selectedPins.size} selected
            </span>
          </div>
          <button
            class="btn btn-error btn-sm gap-2"
            on:click={handleBulkDelete}
          >
            <Trash2 class="h-4 w-4" />
            Delete
          </button>
        </div>
      {/if}
    </DialogContent>
  </DialogPortal>
</Dialog>
