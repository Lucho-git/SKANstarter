<script lang="ts">
  import Hero from "./Hero.svelte"
  import Features from "./Features.svelte"
  import Agskan from "./Agskan.svelte"
  import PaddockPath from "./PaddockPath.svelte"
  import Partners from "./PartnerSection.svelte"
  import QandA from "./QandA.svelte"
  import SignupSection from "./SignupSection.svelte"

  export let data
  $: ({ supabase, url } = data)
</script>

<main class="w-full">
  <Hero />
  <Agskan />
  <PaddockPath />
  <Partners />
  <QandA />
  {#if supabase}
    <SignupSection {supabase} {url} />
  {/if}
</main>
