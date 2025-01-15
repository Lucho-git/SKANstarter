<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Card } from "$lib/components/ui/card"
  import BlurFade from "$lib/components/magic/blur-fade/BlurFade.svelte"
  import BorderBeam from "$lib/components/magic/border-beam/BorderBeam.svelte"
  import ShineBorder from "$lib/components/magic/shine-border/ShineBorder.svelte"
  import * as Tabs from "$lib/components/ui/tabs"
  import { Check, Minus, Plus, Users } from "lucide-svelte"
  import { writable } from "svelte/store"

  let BLUR_FADE_DELAY = 0.04

  // Billing period store
  const billingPeriod = writable("annual")

  // Number of seats counter
  let seats = 1
  const BASE_PRICE = 45
  $: pricePerSeat = $billingPeriod === "annual" ? BASE_PRICE * 0.8 : BASE_PRICE
  $: totalPrice = seats * pricePerSeat

  // Calculate annual savings
  $: monthlyTotal = seats * BASE_PRICE
  $: annualTotal = seats * BASE_PRICE * 12
  $: annualDiscountedTotal = seats * (BASE_PRICE * 0.8) * 12
  $: annualSavings = annualTotal - annualDiscountedTotal

  function incrementSeats() {
    if (seats < 10) seats++
  }

  function decrementSeats() {
    if (seats > 1) seats--
  }

  const freePlanFeatures = [
    "Join other maps with unlimited resources",
    "1 Map Creation",
    "100 active pin drops",
    "100,000 Trail tokens",
    "Real time location updates",
  ]

  const proPlanFeatures = [
    "Invite others to share your map",
    "Customizable number of seats",
    "Unlimited map creation",
    "Unlimited pin drops",
    "Unlimited Trail credits",
    "All vehicles unlocked",
  ]
</script>

<div class="container mx-auto px-4 py-16">
  <BlurFade delay={BLUR_FADE_DELAY}>
    <div class="mb-16 text-center">
      <h1 class="mb-4 text-4xl font-bold">Pricing plans</h1>
      <p class="text-lg text-base-content/80">
        Start for free, upgrade when you're ready
      </p>
    </div>
  </BlurFade>

  <!-- Controls Container -->
  <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
    <div class="mb-16 flex flex-wrap items-center justify-center gap-4">
      <!-- Billing Period Tabs -->
      <div class="rounded-lg bg-base-200 p-1.5">
        <Tabs.Root
          value={$billingPeriod}
          onValueChange={(value) => billingPeriod.set(value)}
          class="w-[200px]"
        >
          <Tabs.List class="grid grid-cols-2">
            <Tabs.Trigger
              value="monthly"
              class="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Monthly
            </Tabs.Trigger>
            <Tabs.Trigger
              value="annual"
              class="relative rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Annual
              <span
                class="absolute -right-1 -top-1 rounded-lg bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
                >-20%</span
              >
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      <!-- Seats Counter -->
      <div class="flex items-center gap-2 rounded-lg bg-base-200 p-1.5">
        <Users class="ml-3 h-5 w-5 text-base-content/70" />
        <Button
          size="icon"
          variant="ghost"
          class="h-8 w-8 rounded-lg"
          on:click={decrementSeats}
        >
          <Minus class="h-4 w-4" />
        </Button>
        <div class="w-12 text-center">
          <span class="font-bold">{seats}</span>
          <span class="-mt-1 block text-xs text-base-content/70">seats</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          class="h-8 w-8 rounded-lg"
          on:click={incrementSeats}
        >
          <Plus class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </BlurFade>

  <!-- Pricing Cards -->
  <div class="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
    <!-- Free Plan -->
    <BlurFade delay={BLUR_FADE_DELAY * 2}>
      <article
        class="h-full rounded-3xl border border-gray-700/70 bg-background p-8"
      >
        <div>
          <h3 class="mb-2 text-2xl font-bold">🚜 SKAN Member</h3>
          <p class="mb-6 text-base-content/70">
            Join an existing map as an operator
          </p>

          <div class="mb-8 flex items-baseline gap-2">
            <div class="text-3xl font-bold">Free</div>
            <div class="text-base-content/70">no credit card required</div>
          </div>

          <Button class="mb-8 w-full" variant="outline">Get Started</Button>

          <div class="space-y-4">
            {#each freePlanFeatures as feature}
              <div class="flex items-center gap-2">
                <Check class="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </div>
            {/each}
          </div>
        </div>
      </article>
    </BlurFade>

    <!-- Pro Plan -->
    <BlurFade delay={BLUR_FADE_DELAY * 2.5}>
      <article
        class="relative h-full rounded-3xl border border-gray-700/70 bg-background p-8"
      >
        <BorderBeam color="#FF7700" size={150} duration={12} />
        <div>
          <h3 class="mb-2 text-2xl font-bold">⭐ SKAN Founder</h3>
          <p class="mb-6 text-base-content/70">Full access with custom seats</p>

          <div class="mb-8 flex items-baseline justify-between">
            <div class="flex items-baseline gap-2">
              <div class="text-3xl font-bold">${Math.round(totalPrice)}</div>
              <div class="text-base-content/70">per month</div>
            </div>
            <div class="min-w-[120px] text-right">
              {#if $billingPeriod === "annual"}
                <div
                  class="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 text-sm font-medium text-white shadow-sm"
                >
                  Save ${Math.round(annualSavings)}
                </div>
              {/if}
            </div>
          </div>

          <div class="mb-4">
            <ShineBorder
              color={["#FF057A", "#FF7700"]}
              class="w-full cursor-pointer"
            >
              <div
                class="w-full rounded-lg bg-background px-4 py-2 text-center font-semibold"
              >
                Upgrade Now
              </div>
            </ShineBorder>
          </div>

          <p class="mb-8 text-center text-sm text-base-content/70">
            {seats}
            {seats === 1 ? "license" : "licenses"} for A${Math.round(
              $billingPeriod === "annual"
                ? annualDiscountedTotal
                : monthlyTotal,
            )}, billed {$billingPeriod === "annual" ? "annually" : "monthly"}
          </p>

          <div class="space-y-4">
            {#each proPlanFeatures as feature}
              <div class="flex items-center gap-2">
                <Check class="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </div>
            {/each}
          </div>
        </div>
      </article>
    </BlurFade>
  </div>
</div>
