<script lang="ts">
  import { PUBLIC_SITE_NAME } from "$env/static/public"
  import FrontPageDisplay from "../../components/FrontPageDisplay.svelte"
  import FrontPageNew_1 from "../../components/FrontPageNew_1.svelte"
  import FrontPage_2 from "../../components/FrontPage_2.svelte"
  import FrontPage_3 from "../../components/FrontPage_3.svelte"
  import FrontPage_4 from "../../components/FrontPage_4.svelte"
</script>

<svelte:head>
  <title>{PUBLIC_SITE_NAME}</title>
  <meta name="description" content="{PUBLIC_SITE_NAME} Home Page" />
</svelte:head>
<!-- "Maximize your harvest with our AI-driven, precision paddock pathfinding solution
Maximize your harvest with our AI-Optimized pathfinding solution -->

<FrontPageDisplay />
<FrontPageNew_1 />
<FrontPage_2 />
<FrontPage_3 />
<FrontPage_4 />
