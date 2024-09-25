<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { profileStore } from "../../../../stores/profileStore"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { mapActivityStore } from "../../../../stores/mapActivityStore"

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
  <div class="stats w-full text-xs shadow sm:text-sm md:text-base">
    <div class="stat place-items-center p-2 sm:p-4">
      <div class="stat-title">Pin Drops</div>
      <div class="stat-value text-3xl sm:text-3xl md:text-4xl">
        {mapMarkers}{#if !isPaidSubscription}/{masterSubscription.marker_limit}{/if}
      </div>
      <div class="stat-desc">
        {#if isPaidSubscription}
          Unlimited Drops
        {:else}
          Total markers
        {/if}
      </div>
    </div>

    <div class="stat place-items-center p-2 sm:p-4">
      <div class="stat-title">Vehicles</div>
      <div class="stat-value text-3xl sm:text-3xl md:text-4xl">
        {vehicles}/{masterSubscription.current_seats}
      </div>
      <div class="stat-desc">Active Vehicles</div>
    </div>

    <div class="stat place-items-center p-2 sm:p-4">
      <div class="stat-title">Trail Coordinates</div>
      <div class="stat-value text-3xl sm:text-3xl md:text-4xl">
        {formatNumber(trailCoordinates)}
      </div>
      <div class="stat-desc">
        {#if isPaidSubscription}
          Unlimited Trails
        {:else}
          Limit: 100K coordinates
        {/if}
      </div>
    </div>
  </div>
{/if}
