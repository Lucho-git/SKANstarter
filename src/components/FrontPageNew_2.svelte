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
      path: "/animations/CoolLineMap.json",
    })

    return () => {
      animation.destroy()
    }
  })
</script>

<div class="hero min-h-[60vh] mt-12">
  <div class="hero-content flex-col-reverse lg:flex-row">
    <div class="w-full lg:w-5/12 mt-8 lg:mt-0">
      <a
        href="/blog"
        class="card bg-base-100 shadow-xl hover:bg-base-200 transition duration-300"
      >
        <div class="card-body">
          <div class="w-4/5 mx-auto" bind:this={animationContainer}></div>
          <div class="card-actions justify-center mt-4">
            <span
              class="btn btn-ghost btn-lg text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mt-4"
              >Features</span
            >
          </div>
        </div>
      </a>
    </div>
    <div class="w-full lg:w-7/12 mt-6 lg:mt-0 lg:ml-12">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mt-4"
      >
        What is SKAN?
      </div>
      <div
        class="flex flex-col lg:flex-row mt-8 gap-6 place-content-center content-center"
      >
        <div class="min-w-[270px] lg:min-w-[420px] flex mt-6 lg:mt-0">
          <div class="my-auto">
            <div class="px-4 mt-6 text-xl md:text-3xl">
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
              <!-- <a href="/blog" class="link"> Find out how. </a> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
