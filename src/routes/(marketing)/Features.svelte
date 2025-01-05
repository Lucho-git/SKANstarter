<script lang="ts">
  import {
    Map,
    Clock,
    Upload,
    PinIcon,
    Navigation,
    Calculator,
    Droplet,
    MapPin,
  } from "lucide-svelte"
  import { Button } from "$lib/components/ui/button"

  const agskanFeatures = [
    {
      icon: Map,
      title: "Real Time Tracking",
      desc: "Monitor your operators in real time using just a phone or tablet.",
    },
    {
      icon: Clock,
      title: "Seeding Assist",
      desc: "Paint live trails where the sprayer has been for the planter to follow this seeding.",
    },
    {
      icon: Upload,
      title: "Paddock Upload",
      desc: "Upload your paddock boundaries to display on a live shared map.",
    },
    {
      icon: PinIcon,
      title: "Pin Drops",
      desc: "Mark rocks and stumps in real time with a single click.",
    },
  ]

  const paddockFeatures = [
    {
      icon: Navigation,
      title: "Path Recreate",
      desc: "Automatically recreate previously travelled paddock paths to show to a new operator live on their phone.",
    },
    {
      icon: Calculator,
      title: "Mapping Algorithm",
      desc: "Let our advanced mapping algorithm calculate the most efficient way to work a paddock in real time.",
    },
    {
      icon: Droplet,
      title: "Fill Up Locations",
      desc: "Calculate the most efficient places to fill up seeders, sprayers and spreaders, saving time and money.",
    },
    {
      icon: MapPin,
      title: "Live Turning Instructions",
      desc: "Just like Google Maps, we guide operators around the paddock in the most efficient way.",
    },
  ]
</script>

<!-- AgSKAN Section -->
<section class="bg-base-100">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="grid gap-12 lg:grid-cols-2">
      <div class="space-y-8">
        <h3 class="text-2xl font-bold text-base-content">AgSKAN Features</h3>
        <div class="grid gap-6 sm:grid-cols-2">
          {#each agskanFeatures as feature}
            <div
              class="group rounded-lg bg-base-200 p-6 transition-all hover:bg-primary hover:text-primary-content"
            >
              <div class="flex items-start space-x-4">
                <svelte:component
                  this={feature.icon}
                  class="h-6 w-6 flex-shrink-0 transition-colors group-hover:text-primary-content"
                />
                <div>
                  <h4 class="font-semibold">{feature.title}</h4>
                  <p class="mt-1 text-sm opacity-90">{feature.desc}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

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
    </div>
  </div>
</section>

<!-- PaddockPath Section -->
<section class="bg-base-200">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="grid gap-12 lg:grid-cols-2">
      <div class="relative order-2 flex items-center justify-center lg:order-1">
        <div class="w-[90%] max-w-md">
          <div class="aspect-[4/3] w-full overflow-hidden rounded-lg">
            <img
              src="/images/landing-pics/WEB01.png"
              alt="Farm Management Hero 1"
              class="h-full w-full object-cover opacity-90"
            />
            <div
              class="absolute inset-0 flex items-center justify-center bg-base-200/10 backdrop-blur-sm"
            >
              <div class="rounded-lg bg-primary px-4 py-2 text-primary-content">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="order-1 space-y-8 lg:order-2">
        <div class="space-y-4">
          <h3 class="text-2xl font-bold text-base-content">PaddockPath</h3>
          <p class="text-base-content/80">
            Advanced AI-powered navigation and optimization for your paddock
            operations
          </p>
        </div>
        <div class="grid gap-6 sm:grid-cols-2">
          {#each paddockFeatures as feature}
            <div
              class="group relative rounded-lg bg-base-100 p-6 transition-all hover:bg-primary hover:text-primary-content"
            >
              <div class="flex items-start space-x-4">
                <svelte:component
                  this={feature.icon}
                  class="h-6 w-6 flex-shrink-0 transition-colors group-hover:text-primary-content"
                />
                <div>
                  <h4 class="font-semibold">{feature.title}</h4>
                  <p class="mt-1 text-sm opacity-90">{feature.desc}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
        <div class="space-y-4">
          <Button variant="outline">Join the Waitlist</Button>
          <p class="text-sm text-base-content/70">
            Be the first to know when PaddockPath launches
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
