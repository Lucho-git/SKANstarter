<script lang="ts">
  import { Map, Clock, Upload, PinIcon } from "lucide-svelte"
  import * as Dialog from "$lib/components/ui/dialog"
  import BlurFade from "$lib/components/magic/blur-fade/BlurFade.svelte"

  let dialogOpen = false
  let selectedFeature: (typeof agskanFeatures)[0] | null = null
  let BLUR_FADE_DELAY = 0.04

  const agskanFeatures = [
    {
      icon: Map,
      title: "Real Time Tracking",
      desc: "Monitor your operators in real time using just a phone or tablet.",
      bgColor: "bg-blue-200",
      longDesc:
        "Track your operators in real-time with our intuitive mobile interface. Get instant updates on position, speed, and activity status. Perfect for coordinating multiple vehicles and ensuring efficient paddock coverage.",
    },
    {
      icon: Clock,
      title: "Seeding Assist",
      desc: "Paint live trails where the sprayer has been for the planter to follow this seeding.",
      bgColor: "bg-green-200",
      longDesc:
        "Our seeding assist feature creates visual trails of sprayer paths, allowing planters to follow with precision. This ensures perfect alignment and eliminates guesswork in follow-up operations.",
    },
    {
      icon: Upload,
      title: "Paddock Upload",
      desc: "Upload your paddock boundaries to display on a live shared map.",
      bgColor: "bg-yellow-200",
      longDesc:
        "Easily upload and manage your paddock boundaries. Our system supports various file formats and automatically optimizes the display for all connected devices, ensuring everyone works with the same accurate information.",
    },
    {
      icon: PinIcon,
      title: "Pin Drops",
      desc: "Mark rocks and stumps in real time with a single click.",
      bgColor: "bg-red-200",
      longDesc:
        "Instantly mark and share obstacle locations with your entire team. Each pin can include custom notes and photos, creating a comprehensive hazard map that helps prevent equipment damage and ensures operator safety.",
    },
  ]

  function openDialog(feature: typeof selectedFeature) {
    selectedFeature = feature
    dialogOpen = true
  }
</script>

<section class="bg-base-100">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="grid gap-12 lg:grid-cols-2">
      <div class="space-y-8">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h3 class="text-2xl font-bold text-base-content">AgSKAN Features</h3>
        </BlurFade>

        <div class="grid gap-6 sm:grid-cols-2">
          {#each agskanFeatures as feature, i}
            <BlurFade delay={BLUR_FADE_DELAY * 1.2 + i * 0.05}>
              <div
                class="group h-[130px] cursor-pointer rounded-lg bg-base-200 p-6 transition-all hover:bg-primary hover:text-primary-content"
                on:click={() => openDialog(feature)}
                on:keydown={(e) => e.key === "Enter" && openDialog(feature)}
                role="button"
                tabindex="0"
              >
                <div class="flex h-full items-start space-x-4">
                  <svelte:component
                    this={feature.icon}
                    class="h-6 w-6 flex-shrink-0 transition-colors group-hover:text-primary-content"
                  />
                  <div class="flex flex-col">
                    <h4 class="font-semibold">{feature.title}</h4>
                    <p class="mt-1 text-sm opacity-90">{feature.desc}</p>
                  </div>
                </div>
              </div>
            </BlurFade>
          {/each}
        </div>
      </div>

      <BlurFade delay={BLUR_FADE_DELAY * 1.4}>
        <div class="relative flex items-center justify-center">
          <div class="w-[90%] max-w-md">
            <div class="aspect-[4/3] w-full overflow-hidden rounded-lg">
              <img
                src="/images/landing-pics/WEB01.png"
                alt="Farm Management Hero 1"
                class="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  </div>
</section>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="bg-black/80" />
    <Dialog.Content
      class="fixed left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-base-100 p-6 sm:w-full"
    >
      {#if selectedFeature}
        <Dialog.Header>
          <Dialog.Title class="flex items-center gap-2">
            <svelte:component this={selectedFeature.icon} class="h-6 w-6" />
            {selectedFeature.title}
          </Dialog.Title>
          <Dialog.Description class="mt-2">
            {selectedFeature.longDesc}
          </Dialog.Description>
        </Dialog.Header>

        <div class="relative mt-6 aspect-video overflow-hidden rounded-lg">
          <div
            class={`h-full w-full ${selectedFeature.bgColor} flex items-center justify-center`}
          >
            <span class="text-lg font-medium">Animation Coming Soon</span>
          </div>
        </div>

        <Dialog.Footer class="mt-6">
          <Dialog.Close class="btn">Close</Dialog.Close>
        </Dialog.Footer>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
