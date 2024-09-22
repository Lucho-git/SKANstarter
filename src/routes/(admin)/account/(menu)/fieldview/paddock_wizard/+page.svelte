<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import * as Carousel from "$lib/components/ui/carousel"
  import {
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
  } from "lucide-svelte"

  let maps = [
    { shape: "🗺️", name: "World Map", status: null },
    { shape: "🌎", name: "Globe", status: null },
    { shape: "🏙️", name: "City Map", status: null },
    { shape: "🏞️", name: "Terrain Map", status: null },
  ]

  let currentIndex = 0
  let api: any

  function updateProgress(newApi: any) {
    api = newApi
    currentIndex = api.selectedScrollSnap()
  }

  function handleAction(status: "confirm" | "reject") {
    maps[currentIndex].status = status
    if (currentIndex < maps.length - 1) {
      api.scrollNext()
    }
  }

  function handleAcceptAll() {
    maps = maps.map((map) => ({ ...map, status: "confirm" }))
    api.scrollTo(maps.length - 1)
  }

  function handleFinish() {
    console.log("Finished:", maps)
  }

  function handleExit() {
    console.log("Exiting Map Wizard")
    // Add your exit logic here
  }

  $: allMapsProcessed = maps.every((map) => map.status !== null)
</script>

<div class="container relative mx-auto max-w-3xl p-4">
  <Button
    onclick={handleExit}
    variant="ghost"
    size="icon"
    class="absolute left-4 top-4"
  >
    <CircleAlert class="h-6 w-6" />
  </Button>

  <h1 class="mb-6 text-center text-3xl font-bold">Map Wizard</h1>

  <div class="relative px-12">
    <Carousel.Root class="w-full" onselect={(e) => updateProgress(e.detail)}>
      <Carousel.Content>
        {#each maps as map, index}
          <Carousel.Item>
            <div class="rounded-lg bg-card p-6 shadow-lg">
              <div class="mb-4 rounded-lg bg-secondary p-4">
                <div class="text-center text-6xl">{map.shape}</div>
              </div>
              <div class="relative">
                <Input
                  type="text"
                  value={map.name}
                  class="mb-4 pr-10 text-center text-lg font-semibold"
                />
                <CircleAlert
                  class="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground"
                  size={20}
                />
              </div>
              <div class="mt-8 flex justify-center space-x-8">
                <Button
                  onclick={() => handleAction("confirm")}
                  variant={map.status === "confirm" ? "default" : "outline"}
                  class="h-16 w-16 rounded-full p-0"
                >
                  <Check
                    class={`h-8 w-8 ${map.status === "confirm" ? "text-primary-foreground" : "text-primary"}`}
                  />
                </Button>
                <Button
                  onclick={() => handleAction("reject")}
                  variant={map.status === "reject" ? "destructive" : "outline"}
                  class="h-16 w-16 rounded-full p-0"
                >
                  <X
                    class={`h-8 w-8 ${map.status === "reject" ? "text-destructive-foreground" : "text-destructive"}`}
                  />
                </Button>
              </div>
            </div>
          </Carousel.Item>
        {/each}
      </Carousel.Content>
      <Carousel.Previous
        class="absolute -left-4 top-1/2 -translate-y-1/2 transform"
      >
        <Button variant="outline" size="icon">
          <ChevronLeft class="h-4 w-4" />
        </Button>
      </Carousel.Previous>
      <Carousel.Next
        class="absolute -right-4 top-1/2 -translate-y-1/2 transform"
      >
        <Button variant="outline" size="icon">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </Carousel.Next>
    </Carousel.Root>
  </div>

  <div class="mt-8 flex items-center justify-center space-x-2">
    {#each maps as map, index}
      <div
        class="flex h-4 w-4 items-center justify-center rounded-full"
        class:bg-muted={map.status === null}
        class:bg-primary={map.status === "confirm"}
        class:bg-destructive={map.status === "reject"}
      >
        {#if map.status === null}
          <div class="h-2 w-2 rounded-full bg-foreground"></div>
        {:else if map.status === "confirm"}
          <Check class="h-3 w-3 text-primary-foreground" />
        {:else}
          <X class="h-3 w-3 text-destructive-foreground" />
        {/if}
      </div>
    {/each}
  </div>
  <p class="mt-2 text-center">Map {currentIndex + 1} of {maps.length}</p>

  <div class="mt-8 flex justify-center space-x-4">
    <Button onclick={handleAcceptAll} variant="secondary">Accept All</Button>
    <Button onclick={handleFinish} disabled={!allMapsProcessed}>Finish</Button>
  </div>
</div>
