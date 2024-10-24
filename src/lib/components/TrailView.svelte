<script lang="ts">
  import type { Map } from "mapbox-gl"
  import TrailManager from "$lib/components/TrailManager.svelte"
  import TrailHighlighter from "$lib/components/TrailHighlighter.svelte"

  export let map: Map

  let trailManagerAPI
  let highlighterAPI

  export { trailManagerAPI, highlighterAPI }
</script>

<TrailManager {map} bind:trailManagerAPI>
  <TrailHighlighter {map} bind:highlighterAPI />
</TrailManager>
