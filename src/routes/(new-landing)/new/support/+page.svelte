<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Card } from "$lib/components/ui/card"
  import * as Accordion from "$lib/components/ui/accordion"
  import {
    Map,
    Users,
    Share2,
    MapPin,
    Smartphone,
    PlaySquare,
    MessageCircle,
    Cog,
  } from "lucide-svelte"

  interface SupportSection {
    icon: any
    title: string
    content: string
    videoId?: string
  }

  const supportSections: SupportSection[] = [
    {
      icon: PlaySquare,
      title: "Quick Start: How to Setup AgSKAN in 4 Minutes",
      content:
        "Get started with AgSKAN quickly with our comprehensive setup guide.",
      videoId: "KMAOcSfhw4c",
    },
    {
      icon: Map,
      title: "How to Create a Map",
      content:
        "Assuming you have signed up the first step is to create a map that everyone can join.",
      videoId: "4IV4gJP3nbk",
    },
    {
      icon: Cog,
      title: "How to Create an Operation",
      content:
        "Once you have a map, create an operation specific to the task you will be completing on the farm.",
      videoId: "dgaJDRirYK0",
    },
    {
      icon: Users,
      title: "How to Authorise Users",
      content:
        "Before you invite users to your map you will need to authorise your account to host these users. Select how many 'seats' you will require based on the number of employees. Farm owner + two employees will mean 3 seats.",
      videoId: "gSTzDnsL0vA",
    },
    {
      icon: Share2,
      title: "How to Share Map ID",
      content:
        "Share your Map ID with your operators, this will link you all to a shared live map.",
      videoId: "cJWKTK9maIs",
    },
    {
      icon: MapPin,
      title: "How to Upload Paddock Boundaries",
      content:
        "Follow these steps to upload your digital paddock boundaries, they will display on your live map for everyone to see. This is not a mandatory step, AgSKAN will work perfectly fine without them.",
      videoId: "8Ed09K5NNtg",
    },
    {
      icon: Smartphone,
      title: "AgSKAN on Mobile",
      content:
        "This step is usually for the operators, this will set up a phone or tablet with AgSKAN so they can use the live trailing and pin drop system. Note, for live trailing to work effectively operators will need to keep the application open.",
      videoId: "pyxZ0H82ktY",
    },
  ]

  let accordionValue = "item-0"
</script>

<div class="container mx-auto px-4 pb-16">
  <div class="h-12"></div>

  <!-- Header Section -->
  <div class="mx-auto mb-16 max-w-3xl text-center">
    <h1 class="mb-6 text-4xl font-bold">Support Center</h1>
    <p class="text-lg text-base-content/90">
      AgSKAN is a great tool for helping with everyday farm management, it can
      be set up in less than 10 minutes. Follow these simple steps to get your
      farm started.
    </p>
  </div>

  <div class="mx-auto max-w-3xl space-y-16">
    <!-- Support Sections Accordion -->
    <div class="rounded-lg bg-base-100 p-6">
      <h2 class="mb-6 text-2xl font-semibold">Setup Guides</h2>
      <Accordion.Root
        type="single"
        bind:value={accordionValue}
        class="space-y-4"
      >
        {#each supportSections as section, i}
          <Accordion.Item value={`item-${i}`}>
            <Accordion.Trigger
              class="flex w-full items-center justify-between rounded-lg bg-base-200 px-6 py-4 text-left transition-colors hover:bg-base-300"
            >
              <div class="flex items-center gap-3">
                <svelte:component
                  this={section.icon}
                  class="h-5 w-5 text-primary"
                />
                <span class="text-lg font-medium">{section.title}</span>
              </div>
            </Accordion.Trigger>
            <Accordion.Content class="mt-2 space-y-4 px-6 py-4">
              <div class="grid gap-8 md:grid-cols-2">
                <div class="space-y-4">
                  <p class="font-medium text-base-content/90">
                    {section.content}
                  </p>
                </div>
                <div
                  class="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-base-200"
                >
                  <iframe
                    class="h-full w-full"
                    src={`https://www.youtube.com/embed/${section.videoId}?si=DoroVYQHQ31om0cO`}
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        {/each}
      </Accordion.Root>
    </div>

    <!-- Help Chat Section -->
    <div class="rounded-lg bg-base-100 p-6">
      <div class="space-y-6 text-center">
        <div class="flex items-center justify-center gap-3">
          <MessageCircle class="h-6 w-6 text-primary" />
          <h2 class="text-2xl font-semibold">Need More Help?</h2>
        </div>
        <p class="font-medium text-base-content/90">
          For any issues whilst using the app please use the in app chat
          feature, this will link you directly with the SKAN team who will
          respond as soon as possible.
        </p>
        <Button variant="outline">
          <MessageCircle class="mr-2 h-4 w-4" />
          Open Chat Support
        </Button>
      </div>
    </div>
  </div>
</div>
