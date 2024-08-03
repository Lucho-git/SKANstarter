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
    <div class="w-full lg:w-5/12">
      <div class="w-4/5 mx-auto" bind:this={animationContainer}></div>
    </div>
    <div class="w-full lg:w-7/12 mt-6 lg:mt-0">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
      >
        See it in Action
      </div>
      <div class="mt-6 text-lg md:text-xl">
        <a href="/login?tab=sign_up" class="link font-bold"
          >Upload your paddock boundary files.</a
        >
      </div>
      <div class="mt-6 text-lg md:text-xl">
        Our <span class="font-bold">pathfinder</span>
        will show you an optimized route to most effectively seed, spray or harvest
        your fields.
      </div>
      <div class="mt-6">
        <a href="/login?tab=sign_up">
          <button class="btn btn-primary btn-wide">See it in Action</button>
        </a>
      </div>
    </div>
  </div>
</div>
