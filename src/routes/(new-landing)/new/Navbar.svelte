<script lang="ts">
  import { Menu } from "lucide-svelte"
  import { Button } from "$lib/components/ui/button"

  let isMenuOpen = false
</script>

<header
  class="bg-background/80 sticky top-0 z-40 w-full border-b border-border/20 backdrop-blur"
>
  <div class="container">
    <div class="flex h-16 items-center justify-between">
      <a href="/" class="flex items-center gap-2">
        <span class="text-xl font-bold">LOGO</span>
      </a>

      <nav class="hidden items-center gap-6 lg:flex">
        <a
          href="#features"
          class="text-sm text-muted-foreground hover:text-primary">Features</a
        >
        <a
          href="#about"
          class="text-sm text-muted-foreground hover:text-primary">About</a
        >
        <a
          href="#contact"
          class="text-sm text-muted-foreground hover:text-primary">Contact</a
        >
        <Button variant="default">Book a Demo</Button>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        class="lg:hidden"
        on:click={() => (isMenuOpen = true)}
      >
        <Menu class="h-6 w-6" />
        <span class="sr-only">Open menu</span>
      </Button>
    </div>
  </div>

  {#if isMenuOpen}
    <div class="fixed inset-0 z-50 bg-background lg:hidden">
      <div class="flex items-center justify-between p-4">
        <span class="text-xl font-bold">LOGO</span>
        <Button
          variant="ghost"
          size="icon"
          on:click={() => (isMenuOpen = false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span class="sr-only">Close menu</span>
        </Button>
      </div>
      <nav class="flex flex-col gap-2 p-4">
        <a href="#features" class="p-2 text-muted-foreground hover:text-primary"
          >Features</a
        >
        <a href="#about" class="p-2 text-muted-foreground hover:text-primary"
          >About</a
        >
        <a href="#contact" class="p-2 text-muted-foreground hover:text-primary"
          >Contact</a
        >
        <Button variant="default" class="mt-4">Book a Demo</Button>
      </nav>
    </div>
  {/if}
</header>
