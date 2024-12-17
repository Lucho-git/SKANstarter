<script lang="ts">
  import { Menu } from "lucide-svelte"
  import { Button } from "$lib/components/ui/button"
  import { KeySquare } from "lucide-svelte"

  let isMenuOpen = false
</script>

<!-- Add a spacer div to push content down -->
<div class="h-24"></div>

<nav class="fixed top-0 z-50 w-full bg-neutral shadow-sm">
  <div class="container">
    <div class="flex h-24 items-center justify-between">
      <a href="/" class="flex items-center gap-2">
        <div class="flex items-center rounded-2xl bg-secondary px-3 py-2">
          <div class="flex h-14 w-14 items-center justify-center">
            <img
              src="/images/gear_2.svg"
              alt="SKAN Gear Logo"
              class="h-full w-full"
            />
          </div>
        </div>
        <div class="flex flex-col">
          <span
            class="font-archivo text-3xl font-black leading-none text-neutral-content"
            >SKAN</span
          >
          <span class="text-sm font-medium text-neutral-content/80"
            >Farming</span
          >
        </div>
      </a>

      <!-- Desktop Menu -->
      <nav class="hidden items-center gap-12 lg:flex">
        <a
          href="#features"
          class="text-xl font-semibold text-neutral-content hover:text-secondary"
          >Features</a
        >
        <a
          href="#team"
          class="text-xl font-semibold text-neutral-content hover:text-secondary"
          >Team</a
        >
        <a
          href="#pricing"
          class="text-xl font-semibold text-neutral-content hover:text-secondary"
          >Pricing</a
        >
        <Button
          variant="secondary"
          class="px-6 py-6 text-2xl font-bold text-secondary-content"
        >
          <KeySquare class="mr-2 h-6 w-6" />
          Get Started
        </Button>
      </nav>

      <!-- Mobile Menu Button -->
      <Button
        variant="ghost"
        size="icon"
        class="scale-150 text-neutral-content lg:hidden"
        on:click={() => (isMenuOpen = !isMenuOpen)}
      >
        {#if isMenuOpen}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10"
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
        {:else}
          <Menu class="h-10 w-10" />
        {/if}
        <span class="sr-only">Toggle menu</span>
      </Button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if isMenuOpen}
    <div class="border-t border-neutral-content/10 lg:hidden">
      <div class="container py-4">
        <nav class="flex flex-col gap-6">
          <a
            href="#features"
            class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
            on:click={() => (isMenuOpen = false)}
          >
            Features
          </a>
          <a
            href="#team"
            class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
            on:click={() => (isMenuOpen = false)}
          >
            Team
          </a>
          <a
            href="#pricing"
            class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
            on:click={() => (isMenuOpen = false)}
          >
            Pricing
          </a>
          <Button
            variant="secondary"
            class="mt-4 px-8 py-6 text-2xl font-bold text-secondary-content"
            on:click={() => (isMenuOpen = false)}
          >
            <KeySquare class="mr-2 h-6 w-6" />
            Get Started
          </Button>
        </nav>
      </div>
    </div>
  {/if}
</nav>

<style>
  .font-archivo {
    font-family: "Archivo", Arial, sans-serif;
  }
</style>
