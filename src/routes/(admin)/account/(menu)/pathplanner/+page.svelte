<!-- App.svelte -->
<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte"
  import type { Writable } from "svelte/store"
  import FarmingSimulation from "../../../../../components/FarmingSimulation.svelte"
  import TypeFormSurvey from "../../../../../components/TypeFormSurvey.svelte"
  import FeatheryForm from "../../../../../components/FeatheryForm.svelte"
  import FarmDataAnimation from "../../../../../components/FarmDataAnimation.svelte"
  import FarmDataGsap from "../../../../../components/FarmDataGSAP.svelte"
  import MapViewer from "../../../../../components/MapViewer.svelte"

  import StubContainer from "../../../../../components/StubContainer.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("pathplanner")
</script>

<!-- <FarmingSimulation {farmData} {updateFarmData} /> -->

<!-- ... -->

<div class="app-container">
  <FarmDataGsap />
</div>

<style>
  .app-container {
    display: flex;
    width: 100%;
    height: 100vh;
  }
</style>
