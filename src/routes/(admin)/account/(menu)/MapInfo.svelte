<script lang="ts">
  import { onMount } from "svelte"
  import { browser } from "$app/environment"
  import { connectedMapStore } from "../../../../stores/connectedMapStore"
  import { menuStore } from "../../../../stores/menuStore"

  import * as Card from "$lib/components/ui/card"
  import { MapIcon, Copy, Check } from "lucide-svelte"
  import cool_line_map from "$lib/animations/cool_line_map.json"
  import CoolIdleEdit from "$lib/animations/cool_idle_edit.json"
  import idle_edit_green from "$lib/animations/idle_edit_green.json"
  import idle_edit_muted from "$lib/animations/idle_edit_muted.json"
  import idle_edit from "$lib/animations/idle_edit.json"
  import draw_edit_map_color from "$lib/animations/draw_edit_map_color.json"
  import draw_edit_green_map from "$lib/animations/draw_edit_green_map.json"
  import draw_edit_blue_map from "$lib/animations/draw_edit_blue_map.json"
  import draw_edit_big_map from "$lib/animations/draw_edit_big_map.json"
  import draw_edit_map from "$lib/animations/draw_edit_map.json"
  import photo_swap from "$lib/animations/photo_swap.json"
  import add_button from "$lib/animations/add_button.json"
  import rocket_blast from "$lib/animations/rocket_blast.json"
  import settings_gears from "$lib/animations/settings_gears.json"
  import spinning_globe_location from "$lib/animations/spinning_globe_location.json"
  import spinning_globe from "$lib/animations/spinning_globe.json"
  import farm_house from "$lib/animations/farm_house.json"
  import searching_area from "$lib/animations/searching_area.json"
  import searching_idle from "$lib/animations/searching_idle.json"
  import searching_magnify from "$lib/animations/searching_magnify.json"
  import searching_map from "$lib/animations/searching_map.json"
  import searching_tablet from "$lib/animations/searching_tablet.json"

  import { LottiePlayer } from "@lottiefiles/svelte-lottie-player"

  let copied = false

  function copyMapId() {
    if ($connectedMapStore?.id) {
      navigator.clipboard.writeText($connectedMapStore.id)
      copied = true
      setTimeout(() => (copied = false), 2000)
    }
  }

  function goToMapViewer() {
    window.location.href = "/account/mapviewer"
  }

  function createMap() {
    menuStore.update((store) => ({ ...store, showGenerateModal: true }))
  }

  function joinMap() {
    menuStore.update((store) => ({ ...store, showConnectModal: true }))
  }

  function openSettingsModal() {
    menuStore.update((store) => ({ ...store, showSettingsModal: true }))
  }
</script>

<Card.Root
  class="relative w-full overflow-hidden bg-info/20 text-base-content dark:bg-info/40"
>
  <div
    class="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-info-content/20 to-transparent"
  ></div>
  <Card.Header class="relative z-10 flex flex-col items-center">
    <Card.Title class="text-center text-2xl font-bold">
      {$connectedMapStore?.map_name || "No Map Connected"}
      {#if !$connectedMapStore?.map_name}<div class="mt-4" />{/if}
    </Card.Title>
    {#if $connectedMapStore?.id}
      <Card.Description
        class="mt-2 text-center text-base-content/70 dark:text-base-content/90"
      >
        {$connectedMapStore?.owner
          ? `Owned by ${$connectedMapStore.owner}`
          : "Connect to a map to view details"}
      </Card.Description>
      <div class="mt-4 flex justify-center space-x-8">
        <button
          class="flex h-32 w-32 items-center justify-center rounded-full bg-info/30 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-info/40 dark:bg-info/50 dark:hover:bg-info/60"
          on:click={goToMapViewer}
        >
          {#if browser && LottiePlayer}
            <LottiePlayer
              src={spinning_globe}
              autoplay={true}
              loop={true}
              controls={false}
              renderer="svg"
              background="transparent"
              height={100}
              width={100}
            />
          {:else}
            <MapIcon class="h-16 w-16" />
          {/if}
        </button>
        <button
          class="flex h-32 w-32 items-center justify-center rounded-full bg-info/30 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-info/40 dark:bg-info/50 dark:hover:bg-info/60"
          on:click={openSettingsModal}
        >
          {#if browser && LottiePlayer}
            <LottiePlayer
              src={idle_edit_green}
              autoplay={true}
              loop={true}
              speed={0.5}
              controls={false}
              renderer="svg"
              background="transparent"
              height={80}
              width={80}
            />
          {:else}
            <MapIcon class="h-16 w-16" />
          {/if}
        </button>
      </div>
    {:else}
      <div class="mt-4 flex justify-center space-x-8">
        <div class="flex flex-col items-center">
          <button
            class="flex h-32 w-32 items-center justify-center rounded-full bg-info/30 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-info/40 dark:bg-info/50 dark:hover:bg-info/60"
            on:click={createMap}
          >
            {#if browser && LottiePlayer}
              <LottiePlayer
                src={add_button}
                autoplay={true}
                loop={true}
                controls={false}
                speed={0.25}
                renderer="svg"
                background="transparent"
                height={100}
                width={100}
              />
            {:else}
              <MapIcon class="h-16 w-16" />
            {/if}
          </button>
          <p class="text-bold mt-2 text-center text-sm font-bold">Create</p>
        </div>
        <div class="flex flex-col items-center">
          <button
            class="flex h-32 w-32 items-center justify-center rounded-full bg-info/30 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-info/40 dark:bg-info/50 dark:hover:bg-info/60"
            on:click={joinMap}
          >
            {#if browser && LottiePlayer}
              <LottiePlayer
                src={searching_map}
                autoplay={true}
                loop={true}
                controls={false}
                renderer="svg"
                background="transparent"
                height={40}
                width={120}
              />
            {:else}
              <MapIcon class="h-16 w-16" />
            {/if}
          </button>
          <p class="mt-2 text-center text-sm font-bold">Join</p>
        </div>
      </div>
    {/if}
  </Card.Header>
  <Card.Content class="mt relative z-10 w-full">
    {#if $connectedMapStore?.id}
      <div
        class="tooltip w-full"
        data-tip={copied ? "Copied!" : "Click to copy"}
      >
        <button
          class="w-full rounded-lg bg-info/30 p-3 transition-colors duration-200 ease-in-out hover:bg-info/40 dark:bg-info/50 dark:hover:bg-info/60"
          on:click={copyMapId}
        >
          <div class="flex w-full items-center justify-between">
            <span class="text-sm font-medium">Map ID</span>
            <div class="mx-2 h-4 border-l border-info-content/30"></div>
            <span class="flex-grow break-all text-left text-xs font-semibold"
              >{$connectedMapStore.id}</span
            >
            <div class="mx-2 h-4 border-l border-info-content/30"></div>
            {#if copied}
              <Check class="h-4 w-4 flex-shrink-0" />
            {:else}
              <Copy class="h-4 w-4 flex-shrink-0" />
            {/if}
          </div>
        </button>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
