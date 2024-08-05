<!-- AlertBanner.svelte -->
<script lang="ts">
  export let title: string
  export let description: string
  export let link: string | null = null
</script>

<div class="w-full max-w-4xl mx-auto mb-6">
  <div
    class="alert bg-gradient-to-r from-secondary to-accent text-secondary-content transition-all duration-300 ease-in-out flex items-center {link
      ? 'cursor-pointer hover:from-secondary-focus hover:to-accent-focus'
      : ''}"
    on:click={() => {
      if (link) {
        window.location.href = link
      }
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-current shrink-0 w-6 h-6 hidden sm:block"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <div class="flex-grow">
      <h3 class="font-bold">{title}</h3>
      <div class="text-sm">
        {description}
      </div>
    </div>
    {#if link}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 ml-2 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    {/if}
  </div>
</div>
