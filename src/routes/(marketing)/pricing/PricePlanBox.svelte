<script lang="ts">
  export let plan: any
  export let isCurrentPlan: boolean
  export let callToAction: string
  export let isDisabled: boolean
  export let isHighlighted: boolean
  // Add any other props needed for customization
</script>

<div
  class="flex-none card card-bordered shadow-xl flex-1 flex-grow min-w-[260px] max-w-[310px] p-6"
  class:border-primary={isHighlighted}
  class:border-gray-200={!isHighlighted}
>
  <div class="flex flex-col h-full">
    <div class="text-xl font-bold">{plan.name}</div>
    <p class="mt-2 text-sm text-gray-500 leading-relaxed">
      {plan.description}
    </p>
    <div class="mt-auto pt-4 text-sm text-gray-600">
      Plan Includes:
      <ul class="list-disc list-inside mt-2 space-y-1">
        {#each plan.features as feature}
          <li>{feature}</li>
        {/each}
      </ul>
    </div>
    <div class="pt-8">
      <span class="text-4xl font-bold">{plan.price}</span>
      <span class="text-gray-400">{plan.priceIntervalName}</span>
      <div class="mt-6 pt-4 flex-1 flex flex-row items-center">
        {#if isCurrentPlan}
          <div
            class="btn btn-outline btn-success no-animation w-[80%] mx-auto cursor-default"
          >
            Current Plan
          </div>
        {:else}
          <a
            href={isDisabled
              ? "#"
              : `/account/subscribe/${plan?.stripe_price_id ?? "free_plan"}`}
            class="btn btn-primary w-[80%] mx-auto"
            class:btn-disabled={isDisabled}
          >
            {callToAction}
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>
