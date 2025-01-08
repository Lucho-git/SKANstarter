<script lang="ts">
  import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-svelte"
  import { Root, Content, Item } from "$lib/components/ui/carousel"
  import { cn } from "$lib/utils"
  import { onMount } from "svelte"
  import type { EmblaCarouselType } from "embla-carousel"
  import AnimatedGradientText from "$lib/components/magic/animated-gradient-text/AnimatedGradientText.svelte"

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

  const scrollPrev = () => {
    if (carousel) {
      carousel.scrollPrev()
    }
  }

  const scrollNext = () => {
    if (carousel) {
      carousel.scrollNext()
    }
  }

  function onSelect() {
    if (carousel) {
      selectedIndex = carousel.selectedScrollSnap()
    }
  }

  function startAutoplay() {
    if (carousel) {
      const interval = setInterval(() => {
        if (carousel) {
          carousel.scrollNext()
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }

  onMount(() => {
    mounted = true
  })

  $: if (carousel) {
    carousel.on("select", onSelect)
    startAutoplay()
  }
</script>

<div class="relative bg-base-200">
  <div class="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 sm:py-16 lg:px-8">
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
          <a href="/login" class="group">
            <AnimatedGradientText>
              <span
                class={cn(
                  "animate-gradient inline-flex items-center bg-gradient-to-r from-primary via-accent to-primary bg-[length:var(--bg-size)_100%] bg-clip-text px-6 py-3 text-lg font-medium text-transparent",
                )}
              >
                Sign-Up Free
              </span>
            </AnimatedGradientText>
          </a>
        </div>
      </div>

      <div class="group relative overflow-hidden">
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

            <!-- Internal Navigation Arrows -->
            <button
              on:click={scrollPrev}
              class="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 opacity-0 shadow-lg transition-opacity hover:bg-white group-hover:opacity-100 sm:flex"
              aria-label="Previous slide"
            >
              <ChevronLeft class="h-6 w-6 text-gray-900" />
            </button>
            <button
              on:click={scrollNext}
              class="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 opacity-0 shadow-lg transition-opacity hover:bg-white group-hover:opacity-100 sm:flex"
              aria-label="Next slide"
            >
              <ChevronRight class="h-6 w-6 text-gray-900" />
            </button>

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
