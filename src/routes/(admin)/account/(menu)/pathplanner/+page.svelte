<!-- App.svelte -->
<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte"
  import type { Writable } from "svelte/store"
  import FarmingSimulation from "../../../../../components/FarmingSimulation.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("pathplanner")

  let farmData = {
    name: "My Farm",
    crops: ["Wheat", "Corn", "Potatoes"],
    area: 100,
  }

  function updateFarmData() {
    farmData.area += 10
  }
</script>

<!-- ... -->

<div class="responsive-layout">
  <div class="relative cursor-pointer" style="padding-bottom: 56.25%;">
    <div class="absolute inset-0">
      <FarmingSimulation {farmData} {updateFarmData} />
    </div>
  </div>
</div>
