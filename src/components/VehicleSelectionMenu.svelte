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
  import * as Tabs from "$lib/components/ui/tabs"
  import * as Popover from "$lib/components/ui/popover"
  import * as Accordion from "$lib/components/ui/accordion"
  import { ScrollArea } from "$lib/components/ui/scroll-area"

  import {
    Edit,
    Truck,
    Paintbrush,
    Maximize,
    Minimize,
    Info,
    ChevronsLeftRight,
  } from "lucide-svelte"

  const dispatch = createEventDispatcher()

  export let showMenu = false
  export let currentVehicleType
  export let currentVehicleSize // Size in pixels
  export let currentVehicleColor
  export let currentVehicleSwath

  let activeTab = "vehicles"
  let usedColors = []

  $: vehicles = [
    { type: "FourWheelDriveTractor", bodyColor: "green", size: 60, swath: 4 },
    { type: "TowBetweenSeeder", bodyColor: "red", size: 60, swath: 12 },
    { type: "TowBehindSeeder", bodyColor: "red", size: 60, swath: 12 },
    { type: "TowBehindSeederTracks", bodyColor: "red", size: 60, swath: 12 },
    { type: "TowBehindBoomspray", bodyColor: "red", size: 60, swath: 36 },
    { type: "SelfPropelledBoomspray", bodyColor: "red", size: 60, swath: 36 },
    { type: "ThreePointBoomspray", bodyColor: "red", size: 60, swath: 36 },
    { type: "FarmUte", bodyColor: "red", size: 60, swath: 4 },
    { type: "FrontWheelChaserBin", bodyColor: "red", size: 60, swath: 12 },
    { type: "FourWheelDriveChaserBin", bodyColor: "red", size: 60, swath: 12 },
    { type: "HeaderDuals", bodyColor: "red", size: 60, swath: 12 },
    { type: "HeaderSingles", bodyColor: "red", size: 60, swath: 12 },
    { type: "HeaderTracks", bodyColor: "red", size: 60, swath: 12 },
    { type: "SelfPropelledSwather", bodyColor: "red", size: 60, swath: 12 },
    { type: "Spreader", bodyColor: "red", size: 60, swath: 12 },
    { type: "Truck", bodyColor: "red", size: 60, swath: 4 },
    { type: "CabOverTruck", bodyColor: "red", size: 60, swath: 4 },
    { type: "CabOverRoadTrain", bodyColor: "red", size: 60, swath: 4 },
    { type: "Baler", bodyColor: "red", size: 60, swath: 12 },
    { type: "Mower", bodyColor: "red", size: 60, swath: 12 },
    { type: "SelfPropelledMower", bodyColor: "red", size: 60, swath: 12 },
    { type: "Telehandler", bodyColor: "red", size: 60, swath: 12 },
    { type: "Loader", bodyColor: "red", size: 60, swath: 4 },
    { type: "SimpleTractor", bodyColor: "red", size: 60, swath: 4 },
    { type: "Pointer", bodyColor: "green", size: 60, swath: 4 },
    { type: "CombineHarvester", bodyColor: "yellow", size: 60, swath: 12 },
    { type: "Excavator", bodyColor: "orange", size: 60, swath: 4 },
    { type: "Tractor", bodyColor: "green", size: 60, swath: 4 },
    { type: "WheelLoader", bodyColor: "yellow", size: 60, swath: 4 },
    { type: "WorkCar", bodyColor: "red", size: 60, swath: 4 },
    { type: "Airplane", bodyColor: "blue", size: 60, swath: 50 },
  ]

  let swathValue = [12] // Default value, adjust as needed

  $: initialVehicle =
    vehicles.find((v) => v.type === currentVehicleType) || vehicles[0]

  $: selectedVehicle = {
    ...initialVehicle,
    swath: currentVehicleSwath || initialVehicle.swath,
  }

  $: {
    if (selectedVehicle.swath !== swathValue[0]) {
      swathValue = [selectedVehicle.swath]
    }
  }

  function updateSwath(value) {
    const newValue = Array.isArray(value) ? value[0] : value
    swathValue = [newValue]
    selectedVehicle = { ...selectedVehicle, swath: newValue }
  }

  $: hasChanged =
    selectedVehicle.type !== initialVehicle.type ||
    selectedVehicle.bodyColor !== initialVehicle.bodyColor ||
    selectedVehicle.size !== initialVehicle.size ||
    selectedVehicle.swath !== initialVehicle.swath

  $: console.log("swathValue:", swathValue)

  let isMobile = false

  const colors = ["Red", "Blue", "Green", "Yellow", "Orange", "Purple"]

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
          swath: currentVehicleSwath,
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
    swathValue = [vehicle.swath || 12.0]
  }

  function confirmSelection() {
    toast.success(
      `Selected Vehicle: [${selectedVehicle.bodyColor} ${selectedVehicle.type}]`,
    )

    dispatch("vehicleSelected", {
      ...selectedVehicle,
      size: selectedVehicle.size,
      swath: swathValue[0],
    })

    dispatch("closeMenu")
  }

  function cancelSelection() {
    dispatch("closeMenu")
  }

  function selectColor(bodyColor) {
    selectedVehicle = { ...selectedVehicle, bodyColor }
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
                <div class="space-y-4 p-4">
                  <Card.Root>
                    <Card.Header class="flex items-center">
                      <Card.Title class="flex items-center">
                        Swath Width
                        <Button
                          variant="ghost"
                          size="icon"
                          class="ml-2"
                          on:click={() => {
                            toast.info("About Swath Width", {
                              description:
                                "Swath width is the area covered by your vehicle in one pass. Proper swath setting ensures correct trailing visuals.",
                              duration: 7000,
                            })
                          }}
                        >
                          <Info class="h-4 w-4" />
                        </Button>
                      </Card.Title>
                    </Card.Header>
                    <Card.Content>
                      <div class="mb-4 grid grid-cols-3 gap-2">
                        {#each [4, 8, 10, 12, 24, 36] as preset}
                          <button
                            class="rounded-full px-3 py-1 text-sm {selectedVehicle.swath ===
                            preset
                              ? 'bg-primary text-white'
                              : 'bg-gray-200'}"
                            on:click={() => updateSwath(preset)}
                          >
                            {preset}m
                          </button>
                        {/each}
                      </div>
                      <div class="flex items-center space-x-2">
                        <Minimize class="h-5 w-5" />
                        <Slider
                          value={swathValue}
                          onValueChange={updateSwath}
                          min={2}
                          max={50}
                          step={1}
                          class="flex-grow [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-gray-100 [&_[role=slider]]:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_2px_2px_5px_rgba(0,0,0,0.1)] [&_[role=track]]:h-2 [&_[role=track]]:bg-gray-200 [&_[role=track]]:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]"
                        />
                        <span class="font-semibold">{swathValue[0]}m</span>
                      </div>
                    </Card.Content>
                  </Card.Root>
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
