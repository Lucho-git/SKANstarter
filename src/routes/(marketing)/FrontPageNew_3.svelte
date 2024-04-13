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
      path: "/animations/FileOnBlob.json",
    })

    return () => {
      animation.destroy()
    }
  })
</script>

<div class="hero min-h-[60vh] mt-12">
  <div class="hero-content flex-col lg:flex-row">
    <div class="w-full lg:w-7/12 mt-6 lg:mt-0 lg:mr-12">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mt-4"
      >
        Let's Get Pathing
      </div>
      <div
        class="flex flex-col lg:flex-row mt-8 gap-6 place-content-center content-center"
      >
        <div class="min-w-[270px] lg:min-w-[420px] flex mt-6 lg:mt-0">
          <div class="my-auto">
            <div class="px-4 mt-6 text-xl md:text-3xl">
              See how we can optimize your paddocks.<br />
              <a href="/login/sign_up" class="link font-bold"
                >Upload your paddock boundary files</a
              >
              <br />
              <br /> Let us work our magic and we'll generate you your very own
              <span class="font-bold">PaddockPath</span>.<br /><br /> An
              optimized route to most effectively work your fields. Something
              you can use to help train new staff and even show the veterans a
              thing or two.
              <br />
              <div class="mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full lg:w-5/12 mt-8 lg:mt-0">
      <a
        href="/login/sign_up"
        class="card bg-base-100 shadow-xl hover:bg-base-200 transition duration-300"
      >
        <div class="card-body">
          <div class="w-4/5 mx-auto" bind:this={animationContainer}></div>
          <div class="card-actions justify-center mt-4">
            <span
              class="btn btn-ghost btn-lg text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary mt-4"
              >Upload Files</span
            >
          </div>
        </div>
      </a>
    </div>
  </div>
</div>
