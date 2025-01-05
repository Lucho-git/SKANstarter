<script>
  import { onMount } from "svelte"
  import lottie from "lottie-web"
  import animationData from "$lib/animations/FileOnBlob.json"

  let animationContainer

  onMount(() => {
    const animation = lottie.loadAnimation({
      container: animationContainer,
      animationData,
      renderer: "svg",
      loop: true,
      autoplay: true,
    })

    return () => {
      animation.destroy()
    }
  })
</script>

<div class="hero mt-12 min-h-[60vh]">
  <div class="hero-content flex-col lg:flex-row">
    <div class="mt-6 w-full lg:mr-12 lg:mt-0 lg:w-7/12">
      <div
        class="mt-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent md:text-5xl"
      >
        Let's Get Pathing
      </div>
      <div
        class="mt-8 flex flex-col place-content-center content-center gap-6 lg:flex-row"
      >
        <div class="mt-6 flex min-w-[270px] lg:mt-0 lg:min-w-[420px]">
          <div class="my-auto">
            <div class="mt-6 px-4 text-xl md:text-3xl">
              See how we can optimize your paddocks.<br />
              <a href="/old/login?tab=sign_up" class="link font-bold"
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
    <div class="mt-8 w-full lg:mt-0 lg:w-5/12">
      <a
        href="/old/login?tab=sign_up"
        class="card bg-base-100 shadow-xl transition duration-300 hover:bg-base-200"
      >
        <div class="card-body">
          <div class="mx-auto w-4/5" bind:this={animationContainer}></div>
          <div class="card-actions mt-4 justify-center">
            <span
              class="btn btn-ghost btn-lg mt-4 bg-gradient-to-r from-accent to-secondary bg-clip-text text-3xl font-bold text-transparent md:text-5xl"
              >Upload Files</span
            >
          </div>
        </div>
      </a>
    </div>
  </div>
</div>
