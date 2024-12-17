<script lang="ts">
  import { Menu } from "lucide-svelte"
  import { Button } from "$lib/components/ui/button"
  import { KeySquare } from "lucide-svelte"

  let isMenuOpen = false
</script>

<header
  class="sticky top-0 z-40 w-full border-b border-border/20 bg-neutral backdrop-blur"
>
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
        <div class="items- flex flex-col">
          <span
            class="font-archivo text-3xl font-black leading-none text-neutral-content"
            >SKAN</span
          >
          <span class="text-sm font-medium text-neutral-content/80"
            >Farming</span
          >
        </div>
      </a>

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
          ><KeySquare class="mr-2 h-6 w-6" />
          Get Started</Button
        >
      </nav>

      <Button
        variant="ghost"
        size="icon"
        class="scale-150 text-neutral-content lg:hidden"
        on:click={() => (isMenuOpen = true)}
      >
        <Menu class="h-10 w-10" />
        <span class="sr-only">Open menu</span>
      </Button>
    </div>
  </div>

  {#if isMenuOpen}
    <div class="fixed inset-0 z-50 bg-neutral lg:hidden">
      <div class="flex items-center justify-between p-8">
        <div class="flex items-center gap-4">
          <div class="flex items-center rounded-2xl bg-secondary px-3 py-2">
            <div class="flex h-16 w-16 items-center justify-center">
              <img
                src="/images/gear_2.svg"
                alt="SKAN Gear Logo"
                class="h-full w-full"
              />
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span
              class="font-archivo text-3xl font-black leading-none text-neutral-content"
              >SKAN</span
            >
            <span class="text-sm font-medium text-neutral-content/80"
              >Farming</span
            >
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="scale-150 text-neutral-content"
          on:click={() => (isMenuOpen = false)}
        >
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
          <span class="sr-only">Close menu</span>
        </Button>
      </div>
      <nav class="flex flex-col gap-6 p-8">
        <a
          href="#features"
          class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
          >Features</a
        >
        <a
          href="#team"
          class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
          >Team</a
        >
        <a
          href="#pricing"
          class="p-3 text-2xl font-semibold text-neutral-content hover:text-secondary"
          >Pricing</a
        >
        <Button
          variant="secondary"
          class="mt-4 px-8 py-6 text-2xl font-bold text-secondary-content"
          ><KeySquare class="mr-2 h-6 w-6" />Get Started</Button
        >
      </nav>
    </div>
  {/if}
</header>

<style>
  .font-archivo {
    font-family: "Archivo", Arial, sans-serif;
  }
</style>
