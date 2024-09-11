<script>
  import { fly } from "svelte/transition"
  import { subscribeToPushNotifications } from "$lib/pushNotifications"

  let showBanner = true

  function closeBanner() {
    showBanner = false
  }

  async function enableNotifications() {
    await subscribeToPushNotifications(/* userId */)
    showBanner = false
  }
</script>

{#if showBanner}
  <div
    class="z-200 fixed left-0 right-0 top-0 flex justify-center"
    transition:fly={{ y: -100, duration: 500 }}
  >
    <div class="alert m-2 shadow-lg sm:w-full md:w-2/3 lg:w-1/3">
      <div class="flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="mx-2 h-6 w-6 stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span
          >We'd like to show you notifications to keep you up to date with
          development and changes to your farm</span
        >
      </div>
      <div class="flex-none">
        <button class="btn btn-primary btn-sm" on:click={enableNotifications}>
          Get notifications
        </button>
        <button class="btn btn-ghost btn-sm" on:click={closeBanner}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}
