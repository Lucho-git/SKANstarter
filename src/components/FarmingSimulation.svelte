<!-- FarmingSimulator.svelte -->
<script lang="ts">
  export let farmData: any
  export let updateFarmData: () => void
</script>

<div class="farming-simulation bg-gray-100 rounded-lg p-4 h-full">
  <h3 class="text-xl font-bold mb-2">{farmData.name}</h3>
  <p>Crops: {farmData.crops.join(", ")}</p>
  <p>Area: {farmData.area} hectares</p>
  <button on:click={updateFarmData}>Expand Farm</button>
</div>
