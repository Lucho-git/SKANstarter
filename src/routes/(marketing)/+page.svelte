<script lang="ts">
  import { onMount } from "svelte"
  import { PUBLIC_SITE_NAME } from "$env/static/public"
  import FrontPageDisplay from "../../components/FrontPageDisplay.svelte"
  import FrontPageNew_1 from "../../components/FrontPageNew_1.svelte"
  import FrontPageNew_2 from "../../components/FrontPageNew_2.svelte"
  import FrontPageNew_3 from "../../components/FrontPageNew_3.svelte"
  import FrontPage_4 from "../../components/FrontPage_4.svelte"
  import ThemeSwitcher from "../../components/ThemeSwitcher.svelte"

  let frontPageNew1

  function handleScrollToLearnMore() {
    frontPageNew1.scrollIntoView({ behavior: "smooth" })
  }
</script>

<svelte:head>
  <title>{PUBLIC_SITE_NAME}</title>
  <meta name="description" content="{PUBLIC_SITE_NAME} Home Page" />
</svelte:head>

<!-- <ThemeSwitcher /> -->
<FrontPageDisplay on:scrollToLearnMore={handleScrollToLearnMore} />
<div bind:this={frontPageNew1}>
  <FrontPageNew_1 />
</div>
<FrontPageNew_2 />
<div class="hide-on-mobile">
  <FrontPageNew_3 />
</div>
<!-- <FrontPage_4 /> -->

<style>
  @media (max-width: 768px) {
    .hide-on-mobile {
      display: none;
    }
  }
</style>
