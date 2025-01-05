<script lang="ts">
  import { onMount } from "svelte"
  import { PUBLIC_SITE_NAME } from "$env/static/public"
  import FrontPageDisplay from "./FrontPageDisplay.svelte"
  import FrontPageNew_1 from "./FrontPageNew_1.svelte"
  import FrontPageNew_2 from "./FrontPageNew_2.svelte"
  import FrontPageNew_3 from "./FrontPageNew_3.svelte"
  //   import FrontPage_4 from "../../components/FrontPage_4.svelte"
  //   import ThemeSwitcher from "../../components/ThemeSwitcher.svelte" No use for these can delete

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
<div class="hide-on-mobile" bind:this={frontPageNew1}>
  <FrontPageNew_1 />
</div>
<div class="hide-on-mobile">
  <FrontPageNew_2 />
</div>
<div class="hide-on-mobile">
  <FrontPageNew_3 />
</div>

<style>
  @media (max-width: 768px) {
    .hide-on-mobile {
      display: none;
    }
  }
</style>
