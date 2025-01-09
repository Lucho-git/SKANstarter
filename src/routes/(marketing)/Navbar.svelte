<script lang="ts">
  import { Menu } from "lucide-svelte"
  import { Button } from "$lib/components/ui/button"
  import { KeySquare } from "lucide-svelte"
  import { cn } from "$lib/utils"
  import AnimatedShinyText from "$lib/components/magic/animated-shiny-text/AnimatedShinyText.svelte"

  let isMenuOpen = false
</script>

<nav class="z-50 w-full bg-neutral shadow-sm">
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
        <div class="flex flex-col justify-center">
          <span
            class="font-archivo text-5xl font-black leading-none text-neutral-content"
            >SKAN</span
          >
        </div>
      </a>

      <!-- Desktop Menu -->
      <nav class="hidden items-center gap-12 lg:flex">
        <a
          href="/support"
          class="text-xl font-semibold text-neutral-content hover:text-secondary"
          >Support</a
        >
        <a
          href="/team"
          class="text-xl font-semibold text-neutral-content hover:text-secondary"
          >Team</a
        >
        <a
          href="/pricing"
          class="text-xl font-semibold text-neutral-content hover:text-secondary"
          >Pricing</a
        >
        <div class="rounded-full bg-secondary px-6 py-3">
          <AnimatedShinyText
            shimmerWidth={200}
            class="text-2xl font-bold text-secondary-content"
          >
            <a href="/login" class="inline-flex items-center">
              <KeySquare class="mr-2 h-6 w-6" />
              Login
            </a>
          </AnimatedShinyText>
        </div>
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
            href="/support"
            class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
            on:click={() => (isMenuOpen = false)}
          >
            Support
          </a>
          <a
            href="/team"
            class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
            on:click={() => (isMenuOpen = false)}
          >
            Team
          </a>
          <a
            href="/pricing"
            class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
            on:click={() => (isMenuOpen = false)}
          >
            Pricing
          </a>
          <div class="rounded-full bg-secondary px-8 py-4">
            <AnimatedShinyText
              shimmerWidth={200}
              class="text-2xl font-bold text-secondary-content"
            >
              <a
                href="/login"
                class="inline-flex items-center"
                on:click={() => (isMenuOpen = false)}
              >
                <KeySquare class="mr-2 h-6 w-6" />
                Login
              </a>
            </AnimatedShinyText>
          </div>
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
