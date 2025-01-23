<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import "../../app.css"
  import Navbar from "./Navbar.svelte"
  import Footer from "./Footer.svelte"

  export let data
</script>

<div class="min-h-screen bg-background">
  <Navbar />
  <div>
    <slot />
  </div>
  <Footer />
</div>
