<script>
  import { onMount } from "svelte"
  import lottie from "lottie-web"

  let animationContainer

  onMount(() => {
    const animation = lottie.loadAnimation({
      container: animationContainer,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/animations/MovingTractor.json",
    })

    return () => {
      animation.destroy()
    }
  })
</script>

<div class="hero min-h-[60vh]">
  <div class="py-12 w-full">
    <div class="max-w-6xl mx-auto">
      <div
        class="text-lg md:text-3xl font-bold text-base-content mb-8 md:mb-12 text-center space-y-6"
      >
        <p class="mb-2 md:mb-4">
          <span
            class="decoration-secondary decoration-4 md:decoration-[6px] bg-clip-text text-transparent bg-gradient-to-r from-primary to-base-content"
            >Operating Expenses</span
          > getting out of hand?
        </p>
        <p class="mb-2 md:mb-4">
          <span
            class="decoration-secondary decoration-4 md:decoration-[6px] bg-clip-text text-transparent bg-gradient-to-r from-primary to-base-content"
            >Fuel</span
          > Prices hitting home?
        </p>
        <p class="mb-2 md:mb-4">
          <span
            class="decoration-secondary decoration-4 md:decoration-[6px] bg-clip-text text-transparent bg-gradient-to-r from-primary to-base-content"
            >Skilled</span
          > Labour hard to find?
        </p>
        <p>
          You <span
            class="decoration-secondary decoration-4 md:decoration-[6px] bg-clip-text text-transparent bg-gradient-to-r from-primary to-base-content"
            >are not alone</span
          >
        </p>
        <br />
      </div>
      <div class="flex flex-col lg:flex-row">
        <div
          class="text-3xl md:text-4xl font-bold text-base-content px-2 mb-8 md:mb-12 lg:mr-8 lg:w-1/2"
          style="line-height: 1.2;"
        >
          <p class="mb-2 md:mb-4">
            <span
              class="   decoration-secondary decoration-4 md:decoration-[6px] bg-clip-text text-transparent bg-gradient-to-r from-primary to-base-content"
              >SKAN</span
            > will save you
          </p>
          <br />
          <div class="flex flex-col items-start space-y-6">
            <div class="flex items-center">
              <svg
                class="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>Time</p>
            </div>
            <div class="flex items-center">
              <svg
                class="h-6 w-6 mr-2"
                viewBox="0 0 122.88 95.45"
                fill="currentColor"
                stroke="currentColor"
              >
                <use xlink:href="/images/farm-tractor-icon.svg#icon"></use>
              </svg>
              <p>Machine Hours</p>
            </div>
            <div class="flex items-center">
              <svg
                class="h-6 w-6 mr-2"
                viewBox="0 0 964.000000 1280.000000"
                fill="currentColor"
              >
                <use xlink:href="/images/fuel1.svg#icon"></use>
              </svg>
              <p>Fuel</p>
            </div>
            <div class="flex items-center">
              <svg
                class="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>Bills</p>
            </div>
            <div class="flex items-center">
              <svg
                class="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.727 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p>Stress</p>
            </div>
          </div>
        </div>

        <div class="lg:w-1/2">
          <a
            href="/login?tab=sign_up"
            class="card bg-base-100 shadow-xl hover:bg-base-200 transition duration-300"
          >
            <div class="card-body">
              <!-- Animation container -->
              <div class="w-4/5 mx-auto" bind:this={animationContainer}></div>
              <div class="card-actions justify-center mt-4">
                <span
                  class="btn btn-ghost btn-lg text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mt-4"
                  >PaddockPath</span
                >
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
