<script lang="ts">
  import {
    Map,
    Clock,
    BarChart,
    Users,
    Navigation,
    LineChart,
    Shield,
    Workflow,
  } from "lucide-svelte"
  import { Button } from "$lib/components/ui/button"

  const agskanFeatures = [
    {
      icon: Map,
      title: "Real-time Tracking",
      desc: "Monitor your assets in real-time across your farm operations",
    },
    {
      icon: Clock,
      title: "Time Management",
      desc: "Optimize operational schedules and improve efficiency",
    },
    {
      icon: BarChart,
      title: "Smart Analytics",
      desc: "Data-driven insights to enhance decision making",
    },
    {
      icon: Users,
      title: "Team Coordination",
      desc: "Seamless communication and task management",
    },
  ]

  const paddockFeatures = [
    {
      icon: Navigation,
      title: "Precise Mapping",
      desc: "Accurate field mapping and navigation",
    },
    {
      icon: LineChart,
      title: "Yield Tracking",
      desc: "Monitor and optimize crop performance",
    },
    {
      icon: Shield,
      title: "Boundary Control",
      desc: "Define and manage paddock boundaries",
    },
    {
      icon: Workflow,
      title: "Work Planning",
      desc: "Efficient operation scheduling",
    },
  ]
</script>

<!-- Mission Statement Section -->
<section class="bg-base-100">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <h2 class="text-3xl font-bold text-base-content">
        Empowering Farm Operations
      </h2>
      <p class="mt-4 text-xl text-base-content/80">
        We enhance paddock efficiency by providing real-time tracking and
        optimization tools for your farming operations team.
      </p>
      <Button variant="default" class="mt-8">Learn More</Button>
    </div>
  </div>
</section>

<!-- AgSKAN Section -->
<section class="bg-base-200">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="grid gap-12 lg:grid-cols-2">
      <div class="space-y-8">
        <h3 class="text-2xl font-bold text-base-content">AgSKAN Features</h3>
        <div class="grid gap-6 sm:grid-cols-2">
          {#each agskanFeatures as feature}
            <div
              class="group rounded-lg bg-base-100 p-6 transition-all hover:bg-primary hover:text-primary-content"
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
          <div class="aspect-[4/3] w-full rounded-lg bg-base-100">
            <svg
              class="h-full w-full text-base-content/20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="14" x="3" y="5" rx="2" />
              <path d="M7 15h0M3 10h18" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PaddockPath Section -->
<section class="bg-base-100">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="grid gap-12 lg:grid-cols-2">
      <div class="relative order-2 flex items-center justify-center lg:order-1">
        <div class="w-[90%] max-w-md">
          <div class="aspect-[4/3] w-full rounded-lg bg-base-200">
            <svg
              class="h-full w-full text-base-content/20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 9V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
              <path d="M3 16c0 2 2 3 3 3s3-1 3-3-2-3-3-3-3 1-3 3" />
              <path d="M15 16c0 2 2 3 3 3s3-1 3-3-2-3-3-3-3 1-3 3" />
              <path d="M3 9h18" />
              <path d="M9 16h6" />
            </svg>
          </div>
        </div>
      </div>

      <div class="order-1 space-y-8 lg:order-2">
        <h3 class="text-2xl font-bold text-base-content">
          PaddockPath Mapping
        </h3>
        <div class="grid gap-6 sm:grid-cols-2">
          {#each paddockFeatures as feature}
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
        <Button variant="default">Learn More</Button>
      </div>
    </div>
  </div>
</section>
