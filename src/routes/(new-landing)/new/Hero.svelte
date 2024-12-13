<!-- Hero.svelte -->
<script lang="ts">
  import { ArrowRight } from "lucide-svelte"
</script>

<div
  class="relative bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]"
>
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="grid items-center gap-12 md:grid-cols-2">
      <div class="space-y-8">
        <h1
          class="text-5xl font-bold leading-tight text-base-content md:text-6xl"
        >
          Your Farming Co-Pilot
        </h1>
        <p class="text-xl leading-relaxed text-base-content/80">
          Transforming paddock operations through smart tracking and
          optimization
        </p>
        <div class="flex space-x-4">
          <a
            href="#contact"
            class="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-primary-content transition-colors hover:bg-primary/90"
          >
            Get Started
            <ArrowRight class="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
      <div class="relative">
        <div class="aspect-[4/3] w-full rounded-lg bg-base-100 shadow-xl">
          <svg
            class="h-full w-full text-base-content/20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="14" x="3" y="5" rx="2" />
            <path d="M7 15h0M3 10h18" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</div>
