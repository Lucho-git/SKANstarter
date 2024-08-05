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

<div class="app-container">
  <div class="w-full max-w-4xl mx-auto">
    <div class="alert alert-info w-full mt-2 mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-current shrink-0 w-6 h-6"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path></svg
      >
      <div>
        <h3 class="font-bold">Coming Soon: PathPlanner Feature</h3>
        <div class="text-sm">
          We're working on an exciting new PathPlanner feature. Stay tuned for
          updates!
        </div>
      </div>
    </div>

    <FarmDataGsap />
  </div>
</div>

<style>
  .app-container {
    display: flex;
    width: 100%;
    min-height: 100vh;
    padding: 1rem;
  }
</style>
