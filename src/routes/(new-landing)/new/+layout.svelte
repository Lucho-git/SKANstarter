<!-- Layout.svelte -->

<script lang="ts">
  import "../../../app.css"

  import Navbar from "./Navbar.svelte"
  import Footer from "./Footer.svelte"
</script>

<div class="min-h-screen bg-background">
  <Navbar />
  <div>
    <slot />
  </div>
  <Footer />
</div>
