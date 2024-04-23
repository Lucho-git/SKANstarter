<!-- App.svelte -->
<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte"
  import type { Writable } from "svelte/store"
  import FarmingSimulation from "../../../../../components/FarmingSimulation.svelte"
  import TypeFormSurvey from "../../../../../components/TypeFormSurvey.svelte"
  import FeatheryForm from "../../../../../components/FeatheryForm.svelte"
  import FarmDataAnimation from "../../../../../components/FarmDataAnimation.svelte"
  import FarmDataGsap from "../../../../../components/FarmDataGSAP.svelte"

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
  <div class="relative" style="padding-bottom: 63.25%;">
    <div class="absolute inset-0 overflow-auto">
      <!-- <FarmingSimulation {farmData} {updateFarmData} /> -->
      <FarmDataGsap />
    </div>
  </div>
</div>
