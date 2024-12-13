<!-- Layout.svelte -->
<script lang="ts">
  import Navbar from "./Navbar.svelte"
  import Footer from "./Footer.svelte"
</script>

<div class="min-h-screen bg-background">
  <Navbar />
  <div class="mx-auto max-w-[1400px]">
    <slot />
  </div>
  <Footer />
</div>
