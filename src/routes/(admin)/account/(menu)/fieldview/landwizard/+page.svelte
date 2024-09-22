<script lang="ts">
  import { onMount } from "svelte"
  import * as Card from "$lib/components/ui/card/index.js"
  import * as Carousel from "$lib/components/ui/carousel/index.js"
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import { Check, X } from "lucide-svelte"
  import type { CarouselAPI } from "$lib/components/ui/carousel/context.js"
  import GeoJSONMap from "$lib/components/GeoJSONMap.svelte"

  export let data

  interface Paddock {
    name: string
    boundary: GeoJSON.Polygon
    properties: Record<string, any>
    status: null | "accepted" | "rejected"
  }

  let paddocks: Paddock[] = []

  onMount(() => {
    console.log("Component mounted")
    console.log("Processed data:", data.processedData)

    if (data.processedData.paddocks) {
      paddocks = data.processedData.paddocks.map((paddock: any) => ({
        ...paddock,
        status: null,
      }))
    }
  })

  let api: CarouselAPI
  let currentIndex = 0
  let count = 0

  $: if (api) {
    count = api.scrollSnapList().length
    currentIndex = api.selectedScrollSnap()
    api.on("select", () => {
      currentIndex = api.selectedScrollSnap()
      console.log("Current index changed:", currentIndex)
    })
  }

  $: {
    console.log("Current paddocks state:", paddocks)
    console.log(
      "All paddocks processed:",
      paddocks.every((paddock) => paddock.status !== null),
    )
  }

  $: allPaddocksProcessed = paddocks.every((paddock) => paddock.status !== null)

  function updateName(index: number, event: Event) {
    const input = event.target as HTMLInputElement
    paddocks[index].name = input.value
    paddocks = [...paddocks]
    console.log(`Updated name for paddock ${index}:`, paddocks[index].name)
  }

  function acceptPaddock(index: number) {
    console.log("Accepting paddock at index:", index)
    paddocks[index].status = "accepted"
    paddocks = [...paddocks]
    scrollToNext()
  }

  function rejectPaddock(index: number) {
    console.log("Rejecting paddock at index:", index)
    paddocks[index].status = "rejected"
    paddocks = [...paddocks]
    scrollToNext()
  }

  function scrollToNext() {
    if (currentIndex < count - 1) {
      api.scrollNext()
    }
  }

  function acceptAll() {
    console.log("Accepting all paddocks")
    paddocks = paddocks.map((paddock) => ({ ...paddock, status: "accepted" }))
  }

  function finish() {
    console.log("Finished processing paddocks:", paddocks)
    // Handle finishing logic here (e.g., navigate to another page or update state)
  }
</script>

<div class="container mx-auto px-4">
  <Card.Root class="mx-auto w-full max-w-4xl">
    <Card.Header>
      <Card.Title class="flex justify-center text-2xl font-bold"
        >Paddock Collection</Card.Title
      >
    </Card.Header>
    <Card.Content>
      <Carousel.Root
        bind:api
        class="mx-auto"
        style="width: 100%; max-width: 50vw;"
      >
        <Carousel.Content>
          {#each paddocks as paddock, index (index)}
            <Carousel.Item class="w-full">
              <Card.Root class="bg-white shadow-md dark:bg-gray-700">
                <div class="flex flex-col space-y-2 p-2 sm:space-y-4 sm:p-4">
                  <Input
                    type="text"
                    value={paddock.name}
                    on:input={(e) => updateName(index, e)}
                    class="w-full bg-transparent text-base font-semibold sm:text-lg"
                  />
                  <div
                    class="flex aspect-video w-full items-center justify-center rounded-md bg-gray-100 p-1 dark:bg-gray-600 sm:p-2"
                  >
                    <div class="h-full max-h-[200px] w-full max-w-[300px]">
                      <GeoJSONMap
                        geojson={paddock.boundary}
                        width="300"
                        height="200"
                      />
                    </div>
                  </div>
                  <div class="text-center">
                    <Button
                      on:click={() => acceptPaddock(index)}
                      variant={paddock.status === "accepted"
                        ? "default"
                        : "outline"}
                      class="mx-1.5 inline-block h-10 w-10 rounded-full p-0 align-middle leading-[2.5rem]"
                    >
                      <Check class="inline-block h-5 w-5 align-middle" />
                    </Button>
                    <Button
                      on:click={() => rejectPaddock(index)}
                      variant={paddock.status === "rejected"
                        ? "default"
                        : "outline"}
                      class="mx-1.5 inline-block h-10 w-10 rounded-full p-0 align-middle leading-[2.5rem]"
                    >
                      <X class="inline-block h-5 w-5 align-middle" />
                    </Button>
                  </div>
                </div>
              </Card.Root>
            </Carousel.Item>
          {/each}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
      </Carousel.Root>
      <div class="mt-4 flex flex-wrap justify-center">
        {#each paddocks as paddock, index}
          <div
            class="m-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-in-out"
            class:bg-green-200={index === currentIndex}
            class:bg-muted={index !== currentIndex}
            class:outline-black-500={index === currentIndex}
            class:outline-2={index === currentIndex}
            class:outline={index === currentIndex}
          >
            {#if paddock.status === "accepted"}
              <div
                class="flex h-full w-full items-center justify-center rounded-full bg-green-500"
              >
                <Check class="h-3 w-3 text-white" />
              </div>
            {:else if paddock.status === "rejected"}
              <div
                class="flex h-full w-full items-center justify-center rounded-full bg-red-500"
              >
                <X class="h-3 w-3 text-white" />
              </div>
            {/if}
          </div>
          {#if (index + 1) % 10 === 0}
            <div class="w-full"></div>
          {/if}
        {/each}
      </div>
    </Card.Content>
    <Card.Footer class="flex justify-center space-x-4">
      <Button on:click={acceptAll} variant="outline">Accept All</Button>
      <Button
        on:click={finish}
        class="bg-black"
        disabled={!allPaddocksProcessed}
      >
        Finish
      </Button>
    </Card.Footer>
  </Card.Root>
</div>
