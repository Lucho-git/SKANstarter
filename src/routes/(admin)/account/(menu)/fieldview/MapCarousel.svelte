<!-- MapCarousel.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import * as Dialog from "$lib/components/ui/dialog/index.js"
  import * as Card from "$lib/components/ui/card/index.js"
  import * as Carousel from "$lib/components/ui/carousel/index.js"
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import { Check, X } from "lucide-svelte"
  import { menuStore } from "../../../../../stores/menuStore"
  import type { CarouselAPI } from "$lib/components/ui/carousel/context.js"

  let maps = [
    { title: "World Map", status: null },
    { title: "Europe Map", status: null },
    { title: "Asia Map", status: null },
    { title: "America Map", status: null },
    { title: "World Map", status: null },
    { title: "Europe Map", status: null },
    { title: "Asia Map", status: null },
    { title: "America Map", status: null },
    { title: "World Map", status: null },
    { title: "Europe Map", status: null },
    { title: "Asia Map", status: null },
    { title: "America Map", status: null },
  ]

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

  $: allMapsProcessed = maps.every((map) => map.status !== null)

  function updateTitle(index: number, event: Event) {
    const input = event.target as HTMLInputElement
    maps[index].title = input.value
    maps = [...maps]
  }

  function acceptMap(index: number) {
    console.log("Accepting map at index:", index)
    maps[index].status = "accepted"
    maps = [...maps]
  }

  function rejectMap(index: number) {
    console.log("Rejecting map at index:", index)
    maps[index].status = "rejected"
    maps = [...maps]
  }

  function acceptAll() {
    console.log("Accepting all maps")
    maps = maps.map((map) => ({ ...map, status: "accepted" }))
  }

  function finish() {
    console.log("Finished processing maps:", maps)
    closeModal()
  }

  function closeModal() {
    menuStore.update((state) => ({ ...state, showMapCarouselModal: false }))
  }
</script>

<Dialog.Root open={$menuStore.showMapCarouselModal} on:close={closeModal}>
  <Dialog.Content
    class="w-full rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px]"
  >
    <Dialog.Header>
      <Dialog.Title class="mb-4 text-2xl font-bold">Map Collection</Dialog.Title
      >
    </Dialog.Header>
    <div class="p-4">
      <Carousel.Root bind:api class="w-full">
        <Carousel.Content>
          {#each maps as map, index (index)}
            <Carousel.Item class="w-full">
              <Card.Root class="bg-white shadow-md dark:bg-gray-700">
                <div class="flex flex-col space-y-2 p-2 sm:space-y-4 sm:p-4">
                  <Input
                    type="text"
                    value={map.title}
                    on:input={(e) => updateTitle(index, e)}
                    class="w-full bg-transparent text-base font-semibold sm:text-lg"
                  />
                  <div
                    class="aspect-video w-full rounded-md bg-gray-100 p-1 dark:bg-gray-600 sm:p-2"
                  >
                    <svg
                      viewBox="0 0 100 100"
                      class="h-1/2 w-1/3"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10,40 Q30,20 50,40 T90,40 M10,50 Q30,30 50,50 T90,50 M10,60 Q30,40 50,60 T90,60"
                        fill="none"
                        stroke="#4B5563"
                        stroke-width="2"
                      />
                      <circle cx="25" cy="45" r="5" fill="#4B5563" />
                      <circle cx="75" cy="55" r="5" fill="#4B5563" />
                    </svg>
                  </div>
                  <div class="text-center">
                    <Button
                      on:click={() => acceptMap(index)}
                      variant={map.status === "accepted"
                        ? "default"
                        : "outline"}
                      class="mx-1.5 inline-block h-10 w-10 rounded-full p-0 align-middle leading-[2.5rem]"
                    >
                      <Check class="inline-block h-5 w-5 align-middle" />
                    </Button>
                    <Button
                      on:click={() => rejectMap(index)}
                      variant={map.status === "rejected"
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
      <div class="mt-4 flex justify-center space-x-2">
        {#each maps as map, index}
          <div
            class="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-in-out"
            class:bg-green-200={index === currentIndex}
            class:bg-muted={index !== currentIndex}
            class:outline-black-500={index === currentIndex}
            class:outline-2={index === currentIndex}
            class:outline={index === currentIndex}
          >
            {#if map.status === "accepted"}
              <div
                class="flex h-full w-full items-center justify-center rounded-full bg-green-500"
              >
                <Check class="h-3 w-3 text-white" />
              </div>
            {:else if map.status === "rejected"}
              <div
                class="flex h-full w-full items-center justify-center rounded-full bg-red-500"
              >
                <X class="h-3 w-3 text-white" />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <Dialog.Footer class="flex justify-center space-x-4">
      <Button on:click={acceptAll} variant="outline">Accept All</Button>
      <Button on:click={finish} class="bg-black" disabled={!allMapsProcessed}>
        Finish
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
