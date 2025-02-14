<script lang="ts">
  import { goto } from "$app/navigation"
  import { Button } from "$lib/components/ui/button"
  import { Card } from "$lib/components/ui/card"
  import BlurFade from "$lib/components/magic/blur-fade/BlurFade.svelte"
  import BorderBeam from "$lib/components/magic/border-beam/BorderBeam.svelte"
  import ShineBorder from "$lib/components/magic/shine-border/ShineBorder.svelte"
  import * as Tabs from "$lib/components/ui/tabs"
  import { Check, Minus, Plus, Users, X } from "lucide-svelte"
  import { writable } from "svelte/store"
  import { page } from "$app/stores"

  export let freePlanName = "AgSKAN Free"
  export let freePlanDescription = "Try it yourself or join existing map"
  export let proPlanName = "AgSkan Pro"
  export let proPlanDescription = "Share your map"
  export let ignoreUrlParams = false // Add this new prop

  export let currentPlanId: string | null = null
  export let stripePriceIds = {
    monthly: "price_1PkkO8K3At0l0k1HqvxEEBw2",
    yearly: {
      full: "price_1PdxlVK3At0l0k1HoEgkFynm",
      discount: "price_1PdxlUK3At0l0k1Hu6tlYnHe",
      test: "price_1Qrxo8K3At0l0k1Hz7ybpTts",
    },
  }
  export let useFullPrice = true
  export let additionalDiscountActive = false

  export let freePlanFeatures = [
    "Join existing teams map",
    "Create your own map",
    "Test all features",
    "Basic support",
    {
      text: "Invite team members to your maps",
      disabled: true,
    },
  ]

  export let proPlanFeatures = [
    "Invite team members to your map",
    "Priority phone support",
    "Custom onboarding assistance",
    "Unlimited maps & resources",
    "Adjustable team size anytime",
  ]

  let BLUR_FADE_DELAY = 0.04
  let isTestDiscount = false

  const billingPeriod = writable("annual")

  let seats = 2
  const BASE_PRICE = 45.625

  $: {
    if (!ignoreUrlParams) {
      const discountCode = $page.url.searchParams.get("discountcode")
      isTestDiscount = discountCode === "test"
      console.log("Discount code:", discountCode)
      console.log("Is test discount:", isTestDiscount)
    } else {
      isTestDiscount = false
    }
  }

  $: pricePerSeat =
    isTestDiscount && $billingPeriod === "annual"
      ? BASE_PRICE * 0.25
      : $billingPeriod === "annual"
        ? BASE_PRICE * (2 / 3)
        : BASE_PRICE

  $: totalPrice = seats * pricePerSeat
  $: monthlyTotal = seats * BASE_PRICE
  $: annualTotal = seats * BASE_PRICE * 12
  $: annualDiscountedTotal = isTestDiscount
    ? seats * (BASE_PRICE * 0.25) * 12
    : seats * (BASE_PRICE * (2 / 3)) * 12
  $: annualSavings = annualTotal - annualDiscountedTotal

  $: {
    console.log("Billing period:", $billingPeriod)
    console.log("Use full price:", useFullPrice)
    console.log("Is test discount:", isTestDiscount)
    console.log("Price IDs:", stripePriceIds)
  }

  $: stripePriceId = (() => {
    if (!stripePriceIds) {
      console.error("stripePriceIds is not initialized")
      return ""
    }

    if ($billingPeriod === "monthly") {
      return stripePriceIds.monthly || ""
    }

    if (isTestDiscount && stripePriceIds.yearly?.test) {
      return stripePriceIds.yearly.test
    }

    if (useFullPrice && stripePriceIds.yearly?.full) {
      return stripePriceIds.yearly.full
    }

    return stripePriceIds.yearly?.discount || ""
  })()

  $: {
    console.log("Selected price ID:", stripePriceId)
  }

  $: proUpgradeUrl = `/account/subscribe/${stripePriceId || ""}?seats=${seats}${
    additionalDiscountActive ? "&discount=true" : ""
  }${isTestDiscount ? "&discountcode=test" : ""}`

  $: {
    console.log("Final upgrade URL:", proUpgradeUrl)
  }

  function incrementSeats() {
    if (seats < 10) seats++
    console.log("Upgrade url after increment:", proUpgradeUrl)
  }

  function decrementSeats() {
    if (seats > 1) seats--
    console.log("Upgrade url after decrement:", proUpgradeUrl)
  }
</script>

<div class="relative overflow-hidden">
  <div class="container mx-auto px-4">
    <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
      <div class="mb-8">
        <div
          class="hidden md:flex md:flex-wrap md:items-center md:justify-center md:gap-4"
        >
          <div class="flex h-[52px] items-center rounded-lg bg-base-200 p-1.5">
            <Tabs.Root
              value={$billingPeriod}
              onValueChange={(value) => billingPeriod.set(value)}
              class="w-[200px]"
            >
              <Tabs.List class="grid h-full grid-cols-2">
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
                    class="absolute -right-3 -top-2 rounded-lg bg-gradient-to-r from-secondary to-accent px-1.5 py-0.5 text-[10px] font-bold text-black"
                    >-33%</span
                  >
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </div>

          <div
            class="flex h-[52px] items-center gap-2 rounded-lg bg-base-200 p-1.5"
          >
            <Users class="ml-3 h-5 w-5 text-base-content/70" />
            <Button
              size="icon"
              variant="outline"
              class="h-8 w-8 rounded-lg border-base-content/20 hover:bg-base-100"
              on:click={decrementSeats}
            >
              <Minus class="h-4 w-4" />
            </Button>
            <div class="w-12 text-center">
              <span class="font-bold">{seats}</span>
              <span class="-mt-1 block text-xs text-base-content/70">seats</span
              >
            </div>
            <Button
              size="icon"
              variant="outline"
              class="h-8 w-8 rounded-lg border-base-content/20 hover:bg-base-100"
              on:click={incrementSeats}
            >
              <Plus class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="flex justify-center md:hidden">
          <div class="inline-flex rounded-xl bg-base-200 p-1.5">
            <Tabs.Root
              value={$billingPeriod}
              onValueChange={(value) => billingPeriod.set(value)}
              class="w-[160px]"
            >
              <Tabs.List class="grid grid-cols-2">
                <Tabs.Trigger
                  value="monthly"
                  class="rounded-lg px-3 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Monthly
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="annual"
                  class="relative rounded-lg px-3 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Annual
                  <span
                    class="absolute -right-2 -top-2 rounded-lg bg-gradient-to-r from-secondary to-accent px-1.5 py-0.5 text-[10px] font-bold text-black"
                    >-33%</span
                  >
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>

            <div class="mx-2 my-1 w-px bg-base-content/10"></div>

            <div class="flex items-center gap-1">
              <Users class="mr-1 h-4 w-4 text-base-content/70" />
              <Button
                size="icon"
                variant="outline"
                class="h-8 w-8 rounded-lg border-base-content/20 hover:bg-base-100"
                on:click={decrementSeats}
              >
                <Minus class="h-4 w-4" />
              </Button>
              <div class="w-8 text-center">
                <span class="font-bold">{seats}</span>
                <span class="-mt-1 block text-[10px] text-base-content/70"
                  >seats</span
                >
              </div>
              <Button
                size="icon"
                variant="outline"
                class="h-8 w-8 rounded-lg border-base-content/20 hover:bg-base-100"
                on:click={incrementSeats}
              >
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BlurFade>

    <div
      class="mx-auto grid max-w-{currentPlanId === 'free'
        ? '2xl'
        : '5xl'} gap-8 md:grid-cols-{currentPlanId === 'free' ? '1' : '2'}"
    >
      {#if currentPlanId !== "free"}
        <BlurFade delay={BLUR_FADE_DELAY * 2} class="order-last md:order-first">
          <article
            class="h-full rounded-3xl border border-gray-700/70 bg-base-300 bg-gradient-to-br from-base-300 via-base-300 to-base-200 p-8"
          >
            <div class="text-center">
              <h3 class="mb-2 text-2xl font-bold">{freePlanName}</h3>
              <p class="mb-8 text-base-content/70">{freePlanDescription}</p>

              <div
                class="mx-auto mb-8 w-fit rounded-2xl border border-base-content/10 bg-base-200/50 p-6 shadow-sm"
              >
                <div class="flex flex-col items-center gap-2">
                  <div class="text-4xl font-bold">Free</div>
                  <div class="text-base-content/70">
                    no credit card required
                  </div>
                </div>
              </div>

              {#if currentPlanId === "free"}
                <Button class="mb-8 w-full" variant="outline" disabled
                  >Current Plan</Button
                >
              {:else}
                <form action="/account/subscribe/free_plan" method="GET">
                  <Button class="mb-8 w-full" variant="outline" type="submit">
                    Get Started
                  </Button>
                </form>
              {/if}

              <div class="space-y-4 text-left">
                {#each freePlanFeatures as feature}
                  <li class="flex items-center gap-2">
                    {#if typeof feature === "string"}
                      <Check class="h-5 w-5 text-success" />
                      <span>{feature}</span>
                    {:else}
                      <X class="h-5 w-5 text-error" />
                      <span class="text-base-content/50 line-through"
                        >{feature.text}</span
                      >
                    {/if}
                  </li>
                {/each}
              </div>
            </div>
          </article>
        </BlurFade>
      {/if}

      <BlurFade
        delay={BLUR_FADE_DELAY * 2.5}
        class={currentPlanId === "free"
          ? "mx-auto w-full max-w-lg"
          : "order-first md:order-last"}
      >
        <article
          class="relative h-full rounded-3xl border border-gray-700/70 bg-base-200 bg-gradient-to-br from-base-200 via-base-200 to-base-100 p-8"
        >
          <BorderBeam color="#FF7700" size={150} duration={12} />
          <div class="text-center">
            <h3 class="mb-2 text-2xl font-bold">{proPlanName}</h3>
            <p class="mb-8 text-base-content/70">{proPlanDescription}</p>

            <div class="relative mx-auto mb-8 w-fit">
              {#if $billingPeriod === "annual"}
                <div class="absolute -right-2 -top-2 z-10">
                  <div
                    class="rounded-lg bg-gradient-to-r from-secondary to-accent px-3 py-1 text-sm font-medium text-black shadow-md"
                  >
                    Save ${Math.round(annualSavings)}
                  </div>
                </div>
              {/if}

              <div
                class="relative rounded-2xl border border-base-content/10 bg-base-300/50 p-6 shadow-xl backdrop-blur-sm"
              >
                <BorderBeam color="#FF7700" size={80} duration={12} />
                <div class="flex flex-col items-center gap-4">
                  <div class="flex flex-col items-center gap-2">
                    <div class="text-4xl font-bold">
                      ${Math.round(totalPrice)}
                    </div>
                    <div class="text-base-content/70">per month</div>
                  </div>
                  <div class="rounded-lg bg-base-200/80 px-4 py-2">
                    <div class="flex items-center gap-3">
                      <Users class="h-5 w-5 text-primary" />
                      <div class="flex flex-col">
                        <span class="font-semibold"
                          >{seats} {seats === 1 ? "seat" : "seats"}</span
                        >
                        <span class="text-xs text-base-content/70"
                          >Team size</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {#if additionalDiscountActive && $billingPeriod === "annual"}
              <div class="mb-4 mt-2 flex items-center justify-center gap-2">
                <div class="badge badge-secondary">Extra 50% OFF</div>
                <a
                  href="https://safestyle.com.au/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="badge badge-accent relative text-black"
                >
                  $500 SafeStyle raffle
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="absolute right-0 top-0 -mr-1 -mt-1 h-3 w-3 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            {/if}

            <div class="mb-4">
              {#if currentPlanId === "pro"}
                <ShineBorder
                  color={["#FF057A", "#FF7700"]}
                  class="!block !min-h-0 w-full !min-w-0 bg-transparent"
                  borderWidth={1}
                >
                  <div
                    class="hover:from-secondary-focus hover:to-accent-focus -m-3 w-full rounded-lg bg-gradient-to-r from-secondary to-accent text-center font-semibold text-secondary-content transition-all duration-300"
                  >
                    <button class="w-full whitespace-nowrap px-4 py-2" disabled>
                      Current Plan
                    </button>
                  </div>
                </ShineBorder>
              {:else}
                <div class="relative">
                  <form
                    method="GET"
                    action={proUpgradeUrl}
                    class="absolute inset-0 z-20 opacity-0"
                  >
                    <input type="hidden" name="seats" value={seats} />
                    <button type="submit" class="h-full w-full">
                      <span class="sr-only">Upgrade Now</span>
                    </button>
                  </form>

                  <ShineBorder
                    color={["#FF057A", "#FF7700"]}
                    class="!block !min-h-0 w-full !min-w-0 bg-transparent"
                    borderWidth={2}
                  >
                    <div
                      class="hover:from-secondary-focus hover:to-accent-focus -m-3 w-full rounded-lg bg-gradient-to-r from-secondary to-accent text-center font-semibold text-secondary-content transition-all duration-300"
                    >
                      <div class="w-full whitespace-nowrap px-4 py-2">
                        Upgrade Now
                      </div>
                    </div>
                  </ShineBorder>
                </div>

                {#if seats === 1}
                  <div class="mt-2 text-center text-sm text-warning">
                    ⚠️ At least 2 seats recommended to invite additional team
                    members
                  </div>
                {/if}
              {/if}
            </div>

            <p class="mb-8 text-sm text-base-content/70">
              {seats}
              {seats === 1 ? "license" : "licenses"} for A${Math.round(
                $billingPeriod === "annual"
                  ? annualDiscountedTotal
                  : monthlyTotal,
              )}, billed {$billingPeriod === "annual" ? "annually" : "monthly"}
            </p>

            <div class="space-y-4 text-left">
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
</div>
