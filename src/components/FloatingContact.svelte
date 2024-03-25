<!-- FloatingContact.svelte -->
<script>
  let isOpen = false

  function togglePopover() {
    isOpen = !isOpen
  }

  function closePopover() {
    isOpen = false
  }
</script>

<div class="fixed bottom-8 right-8 z-50">
  <button class="btn btn-circle btn-lg btn-primary" on:click={togglePopover}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-8 w-8 sm:h-6 sm:w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  </button>

  {#if isOpen}
    <div class="fixed bottom-8 right-8 z-50">
      <div class="card w-80 h-64 bg-base-100 shadow-xl">
        <div class="card-body relative">
          <button
            class="btn btn-sm btn-circle absolute top-2 right-2"
            on:click={closePopover}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
          <h3 class="card-title">Got Questions?</h3>
          <p class="text-lg font-bold">Let's Chat</p>
          <div class="mt-4">
            <p>Phone: 0439 405 248</p>
            <p>Email: ryan@skanfarming.com</p>
          </div>
          <div class="mt-4">
            <p>We're here to help!</p>
            <p>Feel free to reach out to us anytime.</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
