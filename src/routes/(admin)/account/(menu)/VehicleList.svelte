<!-- VehicleList.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import { Skeleton } from "$lib/components/ui/skeleton"

  export let vehicles: Array<{
    full_name: string
    user_id: string
    last_update: string
    vehicle_marker: {
      type: string
      color: string
      size: string
    }
  }> | null = null

  let loading = true

  function getTimeSinceLastUpdate(lastUpdate: string) {
    const now = new Date()
    const updateTime = new Date(lastUpdate)
    const diffInSeconds = Math.floor(
      (now.getTime() - updateTime.getTime()) / 1000,
    )

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  onMount(() => {
    loading = false
  })
</script>

<div class="card mt-4 bg-base-200 shadow-xl">
  <div class="card-body">
    <h3 class="card-title">Active Vehicles</h3>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#if loading || !vehicles}
        {#each Array(6) as _}
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <Skeleton class="mb-2 h-6 w-3/4" />
              <Skeleton class="mb-2 h-4 w-full" />
              <Skeleton class="mb-2 h-4 w-2/3" />
              <Skeleton class="mt-2 h-8 w-full" />
            </div>
          </div>
        {/each}
      {:else}
        {#each vehicles as vehicle}
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h4 class="card-title flex justify-between">
                {vehicle.full_name}
                <div class="badge badge-primary">
                  {vehicle.vehicle_marker.type}
                </div>
              </h4>
              <p class="text-sm">
                Last update: {getTimeSinceLastUpdate(vehicle.last_update)}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div
                    class="mr-2 h-3 w-3 rounded-full"
                    style="background-color: {vehicle.vehicle_marker.color};"
                  ></div>
                  <span class="text-sm">{vehicle.vehicle_marker.color}</span>
                </div>
                <span class="text-sm">Size: {vehicle.vehicle_marker.size}</span>
              </div>
              <div class="card-actions mt-2 justify-end">
                <button class="btn btn-error btn-sm">Kick from Map</button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
