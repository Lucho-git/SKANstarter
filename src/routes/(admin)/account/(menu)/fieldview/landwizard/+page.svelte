<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

  import * as Card from "$lib/components/ui/card/index.js"
  import * as Carousel from "$lib/components/ui/carousel/index.js"
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import { Check, X } from "lucide-svelte"
  import type { CarouselAPI } from "$lib/components/ui/carousel/context.js"
  import GeoJSONMap from "$lib/components/GeoJsonMap.svelte"
  import { toast } from "svelte-sonner"

  export let data

  interface Paddock {
    name: string
    boundary: GeoJSON.Polygon | GeoJSON.MultiPolygon
    properties: Record<string, any>
    status: null | "accepted" | "rejected"
    area?: number
    isMultiPolygon: boolean
  }

  let paddocks: Paddock[] = []

  onMount(() => {
    console.log("Component mounted")
    console.log("Processed data:", data.processedData)

    if (data.processedData.paddocks) {
      paddocks = data.processedData.paddocks.map((paddock: any) => {
        const isMultiPolygon = paddock.boundary.type === "MultiPolygon"
        return {
          ...paddock,
          status: isMultiPolygon ? "rejected" : null,
          area: undefined,
          isMultiPolygon,
        }
      })
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
    })
  }

  $: allPaddocksProcessed = paddocks.every((paddock) => paddock.status !== null)

  function updateName(index: number, event: Event) {
    const input = event.target as HTMLInputElement
    paddocks[index].name = input.value
    paddocks = [...paddocks]
    console.log(`Updated name for paddock ${index}:`, paddocks[index].name)
  }

  function acceptPaddock(index: number) {
    if (!paddocks[index].isMultiPolygon) {
      console.log("Accepting paddock at index:", index)
      paddocks[index].status = "accepted"
      paddocks = [...paddocks]
      scrollToNext()
    }
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
    console.log("Accepting all non-MultiPolygon paddocks")
    paddocks = paddocks.map((paddock) => ({
      ...paddock,
      status: paddock.isMultiPolygon ? "rejected" : "accepted",
    }))
  }

  async function finish() {
    console.log("Finished processing paddocks:", paddocks)

    const map_id = data.connectedMap.id

    const promise = fetch("/api/files/upload_fields", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        map_id: map_id,
        fields: paddocks,
      }),
    }).then(async (response) => {
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error)
      }
      return result
    })

    toast.promise(promise, {
      loading: "Submitting paddocks...",
      success: (result) => {
        const successCount = result.insertedFields.length
        return successCount === 1
          ? `Paddock "${result.insertedFields[0].name}" was uploaded.`
          : `${successCount} paddocks were uploaded.`
      },
      error: (err) => err.message,
    })

    try {
      const result = await promise

      // Handle partial rejections
      if (result.rejectedFields && result.rejectedFields.length > 0) {
        const rejectionReasons = result.rejectedFields.reduce((acc, field) => {
          acc[field.reason] = (acc[field.reason] || 0) + 1
          return acc
        }, {})

        let rejectionMessage = `${result.rejectedFields.length} paddock(s) were rejected:`
        for (const [reason, count] of Object.entries(rejectionReasons)) {
          rejectionMessage += `\n${count} ${count === 1 ? "paddock" : "paddocks"} rejected for ${reason}`
        }
        toast.error(rejectionMessage, { duration: 7000 })
      }
    } catch (error) {
      console.error("Error submitting fields:", error)
    } finally {
      // Redirect to fieldview page after a short delay to allow toasts to be seen
      setTimeout(() => {
        goto(`/account/fieldview/`)
      }, 500) // 2 second delay
    }
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
                  <div class="mx-auto aspect-[3/2] w-full max-w-[300px]">
                    <GeoJSONMap
                      geojson={paddock.boundary}
                      width={300}
                      height={200}
                      bind:areaHectares={paddock.area}
                    />
                  </div>
                  <div class="text-center text-sm">
                    {paddock.area?.toFixed(2) ?? "N/A"} hectares
                  </div>
                  <div class="text-center">
                    <Button
                      on:click={() => acceptPaddock(index)}
                      variant={paddock.status === "accepted"
                        ? "default"
                        : "outline"}
                      class="mx-1.5 inline-block h-10 w-10 rounded-full p-0 align-middle leading-[2.5rem]"
                      disabled={paddock.isMultiPolygon}
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
                  {#if paddock.isMultiPolygon}
                    <div class="text-center text-sm text-red-500">
                      MultiPolygon detected. This paddock will be automatically
                      rejected.
                    </div>
                  {/if}
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
        Load
      </Button>
    </Card.Footer>
  </Card.Root>
</div>
