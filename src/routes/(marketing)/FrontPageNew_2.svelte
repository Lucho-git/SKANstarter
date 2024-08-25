<script>
  import { onMount } from "svelte"
  import { browser } from "$app/environment"

  import cool_line_map from "$lib/animations/cool_line_map.json"

  let LottiePlayer

  onMount(async () => {
    if (browser) {
      const module = await import("@lottiefiles/svelte-lottie-player")
      LottiePlayer = module.LottiePlayer
    }
  })
</script>

<div class="hero mt-12 min-h-[60vh]">
  <div class="hero-content flex-col-reverse lg:flex-row">
    <div class="mt-8 w-full lg:mt-0 lg:w-5/12">
      <a
        href="/features"
        class="card bg-base-100 shadow-xl transition duration-300 hover:bg-base-200"
      >
        <div class="card-body">
          <!-- Animation container -->
          <div class="min-h-4/5 mx-auto w-4/5">
            {#if browser && LottiePlayer}
              <svelte:component
                this={LottiePlayer}
                src={cool_line_map}
                autoplay={true}
                loop={true}
                controls={false}
                renderer="svg"
                background="transparent"
              />
            {/if}
          </div>
          <div class="card-actions mt-4 justify-center">
            <span
              class="btn btn-ghost btn-lg mt-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent md:text-5xl"
            >
              Features
            </span>
          </div>
        </div>
      </a>
    </div>
    <div class="mt-6 w-full lg:ml-12 lg:mt-0 lg:w-7/12">
      <div
        class="mt-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-bold text-transparent md:text-5xl"
      >
        What is SKAN?
      </div>
      <div
        class="mt-8 flex flex-col place-content-center content-center gap-6 lg:flex-row"
      >
        <div class="mt-6 flex min-w-[270px] lg:mt-0 lg:min-w-[420px]">
          <div class="my-auto">
            <div class="mt-6 px-4 text-xl md:text-3xl">
              <span class="font-bold">SKAN</span> is a product for farmers and
              tractor operators. <br /><br />It uses an
              <span class="font-bold">AI algorithm</span>
              to assess the shape of your paddock and find the
              <span class="font-bold">most efficient</span>
              way to work it. <br /><br />Useful all year round from
              <span class="font-bold"
                >seeding, spraying, fertilising to harvest.</span
              >
              Our goal is to reduce machine operating hours for all farmers.
              <!-- <br /><br /><br />
              <span class="font-bold">SKAN</span> has leveraged AI to analyse
              your paddocks. Our <span class="font-bold">technology</span> will
              find the most efficient routes for
              <span class="font-bold"
                >Seeding, Spraying, Fertilising to Harvest.</span
              > -->
              <br />

              <br />
              <!-- <a href="/features" class="link"> Find out how. </a> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
