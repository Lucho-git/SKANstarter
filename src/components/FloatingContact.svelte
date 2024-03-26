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
      class="h-8 w-8"
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
      <div class="card w-80 bg-base-100 shadow-xl">
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
          <h3 class="card-title text-2xl font-bold mb-4">Got Questions?</h3>
          <p class="text-lg font-bold mb-4">Let's Chat</p>
          <div class="flex items-center mb-4">
            <a href="tel:+61439405248" class="btn btn-circle btn-primary mr-4">
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </a>
            <span>0439 405 248</span>
          </div>
          <div class="flex items-center mb-4">
            <a
              href="mailto:ryan@skanfarming.com"
              class="btn btn-circle btn-primary mr-4"
            >
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
            <span>ryan@skanfarming.com</span>
          </div>
          <div class="flex items-center mb-4">
            <a
              href="https://twitter.com/SKANfarming"
              target="_blank"
              class="btn btn-circle btn-primary mr-4"
            >
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
                  d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                />
              </svg>
            </a>
            <span>twitter.com/SKANfarming</span>
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
