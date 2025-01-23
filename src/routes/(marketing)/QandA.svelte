<script lang="ts">
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "$lib/components/ui/accordion"
  import BlurFade from "$lib/components/magic/blur-fade/BlurFade.svelte"

  let BLUR_FADE_DELAY = 0.04

  const faqs = [
    {
      question: "How do I setup AgSKAN?",
      answer: `
          <p>Getting started is quick and easy. Follow our <a href="/support?guide=quick-start" class="text-primary hover:underline">setup guide</a> to watch a short tutorial about setting up AgSKAN in under 4 minutes.</p>`,
    },
    {
      question: "How much does AgSKAN cost?",
      answer: `
          <p class="mb-4">AgSKAN costs $1 per day, per user.</p>
          <p>In the billing section, a 'seat' represents each person who will be using the app on your farm, including you as the owner/manager. As the account owner, you'll pay for all seats, which gives your account the authority to host other users on your live map.</p>
          <p class="mt-4 p-4 bg-base-300 rounded-lg">
            <strong>Example:</strong> You (map owner) + 2 full-time operators = 3 seats<br>
            Total cost: $3 per day for complete farm operation visibility
          </p>`,
    },
    {
      question: "Will AgSKAN work for seeding?",
      answer: `
          <div class="space-y-4">
            <p>AgSKAN transforms your seeding operation with real-time mapping and collaboration:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Use the sprayer to 'paint' a live map of sprayed areas</li>
              <li>Seeder operators can view the live map to ensure they only seed sprayed areas</li>
              <li>Mark fill-up truck locations with pin drops for the entire seeding crew</li>
              <li>Track and mark obstacles like rocks and stumps with one-touch marking</li>
              <li>Access the map on any mobile device</li>
            </ul>
            <p class="mt-4 p-4 bg-base-300 rounded-lg">
              <strong>Cost Example:</strong> Setting up a sprayer and seeder for 2025 costs just $2 per day, using only phones or tablets
            </p>
          </div>`,
    },
    {
      question: "Will AgSKAN work for harvest?",
      answer: `
          <div class="space-y-4">
            <p>AgSKAN streamlines harvest operations by connecting your entire team:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Headers 'paint' a live map of harvested areas</li>
              <li>Chaser bin drivers can locate headers instantly without radio calls</li>
              <li>Mark field bin locations visible to all crew members</li>
              <li>Complete visibility for truck drivers and the entire harvest team</li>
              <li>Access from any mobile device</li>
            </ul>
            <p class="mt-4 p-4 bg-base-300 rounded-lg">
              <strong>Cost Example:</strong> Full harvest setup (2 headers + chaser bin + truck) = $4 per day
            </p>
          </div>`,
    },
    {
      question: "Will AgSKAN work for rock/stump picking?",
      answer: `
          <div class="space-y-4">
            <p>AgSKAN simplifies obstacle management across your operation:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>One-touch function to mark rocks and stumps instantly</li>
              <li>Live updates visible to all operators</li>
              <li>Streamlined obstacle clearing process</li>
              <li>Works in any tractor or vehicle</li>
            </ul>
          </div>`,
    },
    {
      question: "Do I need any hardware to run AgSKAN?",
      answer: `
          <div class="space-y-4">
            <p>AgSKAN is designed to work with devices you already own:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Works on any iOS or Android phone or tablet</li>
              <li>Only requires an internet connection</li>
              <li>Compatible with all machine brands and ages</li>
              <li>No additional hardware needed</li>
            </ul>
            <p>Check out our <a href="/support?guide=mobile-setup" class="text-primary hover:underline">mobile setup guide</a> to get started.</p>
          </div>`,
    },
    {
      question: "Can I upload my paddock boundaries onto the AgSKAN map?",
      answer: `
          <div class="space-y-4">
            <p>Yes, uploading paddock boundaries is quick and simple:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Takes less than 5 minutes with existing paddock files</li>
              <li>Simple step-by-step process</li>
              <li>Supports common boundary file formats</li>
            </ul>
            <p>Follow our <a href="/support?guide=upload-boundaries" class="text-primary hover:underline">paddock boundary guide</a> for detailed instructions.</p>
          </div>`,
    },
    {
      question: "Will AgSKAN work if I don't have paddock boundary files?",
      answer: `
          <p>You can start using AgSKAN immediately without paddock boundaries. Simply open the map and begin tracking - the boundary files are optional and can be added later if needed.</p>`,
    },
    {
      question: "How do I connect people to my map?",
      answer: `
          <div class="space-y-4">
            <p>Connecting team members is straightforward using the map ID link:</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>Share the map ID link with your operators</li>
              <li>Team members can instantly join your live map</li>
              <li>No complicated setup required</li>
            </ul>
            <p>Need help finding the map ID? Check our <a href="/support?guide=share-map" class="text-primary hover:underline">sharing guide</a> for step-by-step instructions.</p>
          </div>`,
    },
  ]
</script>

<section class="bg-base-200">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h2 class="mb-12 text-center text-3xl font-bold text-base-content">
          Frequently Asked Questions
        </h2>
      </BlurFade>

      <Accordion type="single" collapsible class="w-full space-y-4">
        {#each faqs as faq, i}
          <BlurFade delay={BLUR_FADE_DELAY * 1.2 + i * 0.05}>
            <AccordionItem value="item-{i}" class="border-b-0">
              <AccordionTrigger
                class="rounded-lg bg-base-200 px-6 py-4 text-left hover:bg-base-300 [&[data-state=open]]:bg-base-300"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent class="px-6 py-4">
                {@html faq.answer}
              </AccordionContent>
            </AccordionItem>
          </BlurFade>
        {/each}
      </Accordion>
    </div>
  </div>
</section>

<style>
  /* Remove default border from accordion items */
  :global([data-state="open"] > .accordion-trigger) {
    background-color: hsl(var(--b3));
  }
</style>
