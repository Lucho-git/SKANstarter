<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { profileStore } from "../../../../stores/profileStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { mapActivityStore } from "../../../../stores/mapActivityStore"
  import { Card, CardContent } from "$lib/components/ui/card"
  import {
    MapPin,
    Truck,
    Route,
    Trash2,
    Search,
    SortAsc,
    SortDesc,
    Pencil,
    Settings,
    ChevronDown,
    ChevronRight,
    MoreVertical,
  } from "lucide-svelte"
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
  import { DateTime } from "luxon"

  // Stub data for markers
  const markers = [
    {
      id: 1,
      name: "Field Entry Point",
      date: "2024-01-15T10:30:00Z",
      icon: "🌾",
    },
    {
      id: 2,
      name: "Water Source",
      date: "2024-01-14T15:45:00Z",
      icon: "💧",
    },
    {
      id: 3,
      name: "Equipment Storage",
      date: "2024-01-13T08:20:00Z",
      icon: "🔧",
    },
    {
      id: 4,
      name: "Harvest Area A",
      date: "2024-01-12T16:15:00Z",
      icon: "🌱",
    },
    {
      id: 5,
      name: "Maintenance Point",
      date: "2024-01-11T11:00:00Z",
      icon: "⚙️",
    },
    {
      id: 6,
      name: "Field Entry Point",
      date: "2024-01-15T10:30:00Z",
      icon: "🌾",
    },
    {
      id: 7,
      name: "Water Source",
      date: "2024-01-14T15:45:00Z",
      icon: "💧",
    },
    {
      id: 8,
      name: "Equipment Storage",
      date: "2024-01-13T08:20:00Z",
      icon: "🔧",
    },
    {
      id: 9,
      name: "Harvest Area A",
      date: "2024-01-12T16:15:00Z",
      icon: "🌱",
    },
  ]

  let searchQuery = ""
  let sortDirection: "asc" | "desc" = "desc"

  $: filteredMarkers = markers
    .filter(
      (marker) =>
        marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        marker.icon.includes(searchQuery),
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

  function toggleSort() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc"
  }

  function formatDate(dateString: string) {
    return DateTime.fromISO(dateString).toRelative()
  }

  function handleDeletePin(id: number) {
    console.log(`Deleting pin ${id}`)
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    } else {
      return num.toString()
    }
  }

  $: mapMarkers = $mapActivityStore.marker_count
  $: vehicles = $mapActivityStore.connected_profiles.length
  $: trailCoordinates = $mapActivityStore.trail_count
  $: masterSubscription = $connectedMapStore.masterSubscription
  $: loading = !$connectedMapStore || !masterSubscription
  $: isPaidSubscription = masterSubscription?.subscription !== "FREE"
</script>

{#if loading}
  <div class="stats w-full text-xs shadow sm:text-sm md:text-base">
    <div class="stat place-items-center p-2 sm:p-4">
      <Skeleton class="mb-2 h-[20px] w-[100px] rounded-full" />
      <Skeleton class="h-[20px] w-[100px] rounded-full" />
      <Skeleton class="mt-2 h-[20px] w-[100px] rounded-full" />
    </div>
    <div class="stat place-items-center p-2 sm:p-4">
      <Skeleton class="mb-2 h-[20px] w-[100px] rounded-full" />
      <Skeleton class="h-[20px] w-[100px] rounded-full" />
      <Skeleton class="mt-2 h-[20px] w-[100px] rounded-full" />
    </div>
    <div class="stat place-items-center p-2 sm:p-4">
      <Skeleton class="mb-2 h-[20px] w-[100px] rounded-full" />
      <Skeleton class="h-[20px] w-[100px] rounded-full" />
      <Skeleton class="mt-2 h-[20px] w-[100px] rounded-full" />
    </div>
  </div>
{:else}
  <div class="container mx-auto px-2 py-2">
    <div class="grid grid-cols-3 gap-2 sm:gap-4">
      <Dialog>
        <DialogTrigger>
          <Card
            class="group relative cursor-pointer border border-base-300 bg-gradient-to-br from-base-100 to-base-200 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-base-200/80 hover:shadow-lg"
          >
            <!-- Expansion indicator in top right -->
            <div
              class="absolute right-2 top-2 rounded-full bg-base-content/5 p-1"
            >
              <ChevronDown
                class="h-3 w-3 text-base-content/50 transition-transform duration-200 group-hover:-rotate-180 group-hover:text-primary"
              />
            </div>

            <CardContent
              class="flex h-full flex-col items-center justify-center p-2"
            >
              <MapPin
                class="mb-1 h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110"
              />
              <p class="text-xs font-semibold text-base-content">Pins</p>
              <span class="text-base font-bold text-base-content">
                {mapMarkers}{#if !isPaidSubscription}/{masterSubscription.marker_limit}{/if}
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
          <DialogContent class="bg-base-100 sm:max-w-[425px]">
            <DialogHeader>
              <div class="flex items-center gap-2">
                <div class="rounded-lg bg-primary/10 p-2">
                  <MapPin class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Map Pins</DialogTitle>
                  <DialogDescription
                    >View and manage your map pins</DialogDescription
                  >
                </div>
              </div>
            </DialogHeader>

            <div class="space-y-4 p-4">
              <!-- Search and Sort Controls -->
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
                <button
                  class="btn btn-ghost btn-sm gap-2"
                  on:click={toggleSort}
                >
                  {#if sortDirection === "asc"}
                    <SortAsc class="h-4 w-4" />
                  {:else}
                    <SortDesc class="h-4 w-4" />
                  {/if}
                  Date
                </button>
              </div>

              <!-- Results count -->
              <div class="text-sm text-base-content/70">
                {filteredMarkers.length} pin{filteredMarkers.length === 1
                  ? ""
                  : "s"} found
              </div>
            </div>

            <div class="max-h-[60vh] overflow-y-auto">
              <div class="space-y-2 px-4">
                {#each filteredMarkers as marker (marker.id)}
                  <div
                    class="flex items-center justify-between rounded-lg bg-base-200 p-3"
                  >
                    <div class="flex items-center gap-3">
                      <div class="text-xl">{marker.icon}</div>
                      <div>
                        <h4 class="text-sm font-semibold text-base-content">
                          {marker.name}
                        </h4>
                        <p class="text-xs text-base-content/70">
                          {formatDate(marker.date)}
                        </p>
                      </div>
                    </div>
                    <button
                      class="btn btn-ghost btn-sm text-error hover:bg-error/20"
                      on:click={() => handleDeletePin(marker.id)}
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                {/each}
              </div>
            </div>
            <DialogFooter>
              <DialogClose class="btn">Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Card
        class="border border-base-300 bg-gradient-to-br from-base-100 to-base-200 backdrop-blur-sm"
      >
        <CardContent
          class="flex h-full flex-col items-center justify-center p-2"
        >
          <Truck class="mb-1 h-4 w-4 text-primary" />
          <p class="text-xs font-semibold text-base-content">Vehicles</p>
          <span class="text-base font-bold text-base-content"
            >{vehicles}/{masterSubscription.current_seats}</span
          >
          <p class="mt-1 text-center text-[10px] text-base-content/70">
            Active Vehicles
          </p>
        </CardContent>
      </Card>

      <Card
        class="border border-base-300 bg-gradient-to-br from-base-100 to-base-200 backdrop-blur-sm"
      >
        <CardContent
          class="flex h-full flex-col items-center justify-center p-2"
        >
          <Route class="mb-1 h-4 w-4 text-primary" />
          <p class="text-xs font-semibold text-base-content">Trail Points</p>
          <span class="text-base font-bold text-base-content"
            >{formatNumber(trailCoordinates)}</span
          >
          <p class="mt-1 text-center text-[10px] text-base-content/70">
            {#if isPaidSubscription}
              Unlimited Trails
            {:else}
              Limit: 100K coordinates
            {/if}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
{/if}
