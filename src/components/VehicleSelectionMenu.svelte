<script>
  import { createEventDispatcher } from "svelte"
  import { controlStore } from "../stores/controlStore"
  import SVGComponents from "$lib/vehicles/index.js"
  import { onMount } from "svelte"
  import { toast } from "svelte-sonner"

  import { Button } from "$lib/components/ui/button"
  import * as Card from "$lib/components/ui/card"
  import { Label } from "$lib/components/ui/label"
  import { Slider } from "$lib/components/ui/slider"
  import { Truck, Paintbrush, Maximize, Minimize } from "lucide-svelte"
  import { Edit } from "lucide-svelte"
  import * as Tabs from "$lib/components/ui/tabs"

  import * as Accordion from "$lib/components/ui/accordion"
  import { ScrollArea } from "$lib/components/ui/scroll-area"

  let swathValue = [2.0] // Default stubbed value

  const dispatch = createEventDispatcher()

  export let showMenu = false
  export let currentVehicleType
  export let currentVehicleSize // Size in pixels
  export let currentVehicleColor

  let activeTab = "vehicles"

  let usedColors = []

  $: vehicles = [
    { type: "FourWheelDriveTractor", bodyColor: "green", size: 60, swath: 2.0 },
    { type: "TowBetweenSeeder", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "TowBehindSeeder", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "TowBehindSeederTracks", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "TowBehindBoomspray", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "SelfPropelledBoomspray", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "FarmUte", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "FrontWheelChaserBin", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "FourWheelDriveChaserBin", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "HeaderDuals", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "HeaderSingles", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "HeaderTracks", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "SelfPropelledSwather", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "Spreader", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "Truck", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "CabOverTruck", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "CabOverRoadTrain", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "Baler", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "Mower", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "SelfPropelledMower", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "Telehandler", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "ThreePointBoomspray", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "Loader", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "SimpleTractor", bodyColor: "red", size: 60, swath: 1.0 },
    { type: "Pointer", bodyColor: "green", size: 60, swath: 1.5 },
    { type: "CombineHarvester", bodyColor: "yellow", size: 60, swath: 2.0 },
    { type: "Excavator", bodyColor: "orange", size: 60, swath: 1.5 },
    { type: "Tractor", bodyColor: "green", size: 60, swath: 2.0 },
    { type: "WheelLoader", bodyColor: "yellow", size: 60, swath: 1.5 },
    { type: "WorkCar", bodyColor: "red", size: 60, swath: 1.5 },
    { type: "Airplane", bodyColor: "blue", size: 60, swath: 2.0 },
  ]

  $: initialVehicle =
    vehicles.find((v) => v.type === currentVehicleType) || vehicles[0]

  $: selectedVehicle = { ...initialVehicle }

  let isMobile = false
  let isColorSelectionMode = false

  const colors = ["Red", "Blue", "Green", "Yellow", "Orange", "Purple"]
  const sizeOptions = [60, 80, 100] // Example sizes in pixels

  $: currentSizeIndex = sizeOptions.indexOf(selectedVehicle.size)

  let startX = 0
  let startY = 0

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 640
    }
    checkMobile()

    window.addEventListener("resize", checkMobile)

    vehicles = vehicles.map((vehicle) => {
      if (vehicle.type === currentVehicleType) {
        return {
          ...vehicle,
          size: currentVehicleSize || 60,
          bodyColor: currentVehicleColor,
        }
      }
      return {
        ...vehicle,
        bodyColor: cycleRandomItems(colors, usedColors),
      }
    })

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  })

  function selectVehicle(vehicle) {
    selectedVehicle = { ...vehicle }
    swathValue = [vehicle.swath || 2.0] // Use vehicle's swath or default to 2.0
  }

  function confirmSelection() {
    toast.success(
      `Selected Vehicle: [${selectedVehicle.bodyColor} ${selectedVehicle.type}]`,
    )

    dispatch("vehicleSelected", {
      ...selectedVehicle,
      size: selectedVehicle.size,
      swath: selectedVehicle.swath,
    })

    dispatch("closeMenu")
  }

  function cancelSelection() {
    dispatch("closeMenu")
  }

  function toggleSelectionMode(mode) {
    isColorSelectionMode = mode === "color"
  }

  function selectColor(bodyColor) {
    selectedVehicle = { ...selectedVehicle, bodyColor }
  }

  function getSizeInPixels(size) {
    return `${size}px` // Size in pixels
  }

  function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  function cycleRandomItems(array, usedItems) {
    const availableItems = array.filter((item) => !usedItems.includes(item))
    if (availableItems.length === 0) {
      usedItems.length = 0
      return getRandomItem(array)
    }
    const selectedItem = getRandomItem(availableItems)
    usedItems.push(selectedItem)
    return selectedItem
  }

  $: hasChanged =
    selectedVehicle.type !== initialVehicle.type ||
    selectedVehicle.bodyColor !== initialVehicle.bodyColor ||
    selectedVehicle.size !== initialVehicle.size ||
    swathValue[0] !== initialVehicle.swath
</script>

<div
  class="fixed bottom-0 left-0 right-0 z-20 flex transform flex-col rounded-t-lg bg-white p-6 shadow-lg transition-transform duration-300 sm:p-8"
  class:translate-y-full={!showMenu}
  class:translate-y-0={showMenu}
  style={isMobile ? "height: 100%;" : "height: 60vh;"}
>
  <div class="flex flex-grow flex-col overflow-hidden text-black sm:flex-row">
    <div
      class="flex w-full flex-grow flex-col overflow-hidden sm:w-1/2 sm:pr-4"
    >
      <Card.Root class="h-full overflow-hidden border-2 border-gray-300">
        <Tabs.Root
          value={activeTab}
          onValueChange={(value) => (activeTab = value)}
          class="rounded-lg bg-gray-100 p-1 shadow-inner"
        >
          <Tabs.List class="grid w-full grid-cols-3 gap-1">
            <Tabs.Trigger
              value="vehicles"
              class="rounded-md px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              Vehicles
            </Tabs.Trigger>
            <Tabs.Trigger
              value="colors"
              class="rounded-md px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              Colors
            </Tabs.Trigger>
            <Tabs.Trigger
              value="swath"
              class="rounded-md px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              Swath
            </Tabs.Trigger>
          </Tabs.List>

          <div class="flex-grow overflow-hidden">
            <Tabs.Content value="vehicles" class="h-full">
              <ScrollArea class="h-full" type="auto">
                <div class="grid-container p-4">
                  {#each vehicles as vehicle}
                    <Button
                      variant="outline"
                      class="h-24 w-24 border-2 p-2"
                      on:click={() => selectVehicle(vehicle)}
                    >
                      <svelte:component
                        this={SVGComponents[vehicle.type]}
                        bodyColor={vehicle.bodyColor}
                        size="100%"
                      />
                    </Button>
                  {/each}
                </div>
              </ScrollArea>
            </Tabs.Content>
            <Tabs.Content value="colors" class="h-full">
              <ScrollArea class="h-full" type="auto">
                <div class="grid-container p-4">
                  {#each colors as bodyColor}
                    <Button
                      variant="outline"
                      class="h-24 w-24 border-2 p-2"
                      style="background-color: {bodyColor};"
                      on:click={() => selectColor(bodyColor)}
                    ></Button>
                  {/each}
                </div>
              </ScrollArea>
            </Tabs.Content>
            <Tabs.Content value="swath" class="h-full">
              <ScrollArea class="h-full" type="auto">
                <div class="p-4">
                  <Label class="mb-2 block">Swath Width</Label>
                  <Slider bind:value={swathValue} min={2} max={50} step={1} />
                  <p class="mt-2 text-center">{swathValue[0]}m</p>
                </div>
              </ScrollArea>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </Card.Root>
    </div>

    <!-- Vehicle display box -->
    <div class="mt-4 flex w-full flex-col sm:mt-0 sm:w-1/2 sm:pl-4">
      <Card.Root class="h-full w-full">
        <Card.Header class="pb-2 text-center">
          <Card.Title class="max-w-full break-words px-2 text-xl font-semibold">
            {selectedVehicle.type}
          </Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <Button
            variant="outline"
            class="relative flex h-40 w-full items-center justify-center"
            on:click={() => (activeTab = "vehicles")}
          >
            <Edit class="absolute right-2 top-2 h-4 w-4 text-gray-400" />
            <svelte:component
              this={SVGComponents[selectedVehicle.type]}
              bodyColor={selectedVehicle.bodyColor}
              size={`${selectedVehicle.size * 1.8}px`}
            />
          </Button>
          <div class="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              class="relative flex h-20 flex-col items-center justify-center"
              on:click={() => (activeTab = "colors")}
            >
              <Edit class="absolute right-2 top-2 h-4 w-4 text-gray-400" />
              <Paintbrush class="mb-2 h-5 w-5" />
              <span>{selectedVehicle.bodyColor}</span>
            </Button>
            <Button
              variant="outline"
              class="relative flex h-20 flex-col items-center justify-center"
              on:click={() => (activeTab = "swath")}
            >
              <Edit class="absolute right-2 top-2 h-4 w-4 text-gray-400" />
              <Minimize class="mb-2 h-5 w-5" />
              <span>{swathValue[0]}m</span>
            </Button>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>

  <!-- Underneath section: Cancel and Confirm buttons -->
  <div class="mt-6 flex">
    <button class="btn mr-2 flex-1" on:click={cancelSelection}>Cancel</button>
    <button
      class="btn btn-primary ml-2 flex-1"
      on:click={confirmSelection}
      disabled={!hasChanged}
    >
      Confirm
    </button>
  </div>
</div>

<style>
  .btn-circle {
    width: 5rem;
    height: 5rem;
  }

  @media (max-width: 640px) {
    .btn-circle {
      width: 5rem;
      height: 5rem;
    }
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(85px, 1fr));
    gap: 1rem;
  }
</style>
