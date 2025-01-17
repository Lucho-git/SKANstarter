<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { profileStore } from "../../../../stores/profileStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { mapActivityStore } from "../../../../stores/mapActivityStore"
  import { Card, CardContent } from "$lib/components/ui/card"
  import { MapPin, Truck, Route } from "lucide-svelte"

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
      <Card
        class="border border-base-300 bg-gradient-to-br from-base-100 to-base-200 backdrop-blur-sm"
      >
        <CardContent
          class="flex h-full flex-col items-center justify-center p-2"
        >
          <MapPin class="mb-1 h-4 w-4 text-primary" />
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
