<script lang="ts">
  import { ArrowRight } from "lucide-svelte"
  import { Button } from "$lib/components/ui/button"
  import {
    Root,
    Content,
    Item,
    Previous,
    Next,
  } from "$lib/components/ui/carousel"
  import { cn } from "$lib/utils"
  import { onMount } from "svelte"
  import type { EmblaCarouselType } from "embla-carousel"

  // Images array for carousel
  const images = [
    { src: "/images/landing-pics/WEB01.png", alt: "Farm Management Hero 1" },
    { src: "/images/landing-pics/WEB03.png", alt: "Farm Management Hero 1" },
    { src: "/images/landing-pics/WEB05.png", alt: "Farm Management Hero 1" },
    { src: "/images/landing-pics/WEB06.png", alt: "Farm Management Hero 1" },
  ]

  let mounted = false
  let selectedIndex = 0
  let carousel: EmblaCarouselType

  const scrollTo = (index: number) => {
    if (carousel) {
      carousel.scrollTo(index)
    }
  }

  function onSelect() {
    if (carousel) {
      selectedIndex = carousel.selectedScrollSnap()
    }
  }

  onMount(() => {
    mounted = true
  })

  $: if (carousel) {
    carousel.on("select", onSelect)
  }
</script>

<div class="relative bg-base-200">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="grid items-center gap-12 md:grid-cols-2">
      <div class="space-y-8">
        <h1
          class="text-5xl font-bold leading-tight text-base-content md:text-6xl"
        >
          Your Farming Co-Pilot
        </h1>
        <div class="space-y-4">
          <p class="text-xl leading-relaxed text-base-content/80">
            Practical employee tracking and operator navigation. Google Maps for
            the paddock.
          </p>
        </div>
        <div class="flex space-x-4">
          <Button variant="default" asChild>
            <a href="/login" class="inline-flex items-center">
              Get Started
              <ArrowRight class="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>

      <div class="relative">
        {#if mounted}
          <Root bind:api={carousel} opts={{ loop: true }} class="w-full">
            <Content>
              {#each images as { src, alt }}
                <Item>
                  <div
                    class="aspect-[4/3] w-full overflow-hidden rounded-lg shadow-xl"
                  >
                    <img {src} {alt} class="h-full w-full object-cover" />
                  </div>
                </Item>
              {/each}
            </Content>

            <Previous />
            <Next />

            <div
              class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            >
              {#each images as _, i}
                <button
                  on:click={() => scrollTo(i)}
                  aria-label="Navigate"
                  class={cn(
                    "h-2.5 w-2.5 rounded-full transition-all",
                    selectedIndex === i
                      ? "scale-125 bg-white"
                      : "bg-white/50 hover:bg-white/75",
                  )}
                  aria-selected={selectedIndex === i}
                  data-carouselbutton={i}
                />
              {/each}
            </div>
          </Root>
        {:else}
          <!-- Fallback while client-side code is loading -->
          <div class="aspect-[4/3] w-full overflow-hidden rounded-lg shadow-xl">
            <img
              src={images[0].src}
              alt={images[0].alt}
              class="h-full w-full object-cover"
            />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
