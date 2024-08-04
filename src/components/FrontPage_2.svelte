<script>
  import { onMount } from "svelte"
  import lottie from "lottie-web"
  import animationData from "./animations/CoolLineMap.json"
  let animationContainer

  onMount(() => {
    const animation = lottie.loadAnimation({
      container: animationContainer,
      //   path: "/animations/CoolLineMap.json",
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

<div class="hero min-h-[60vh] mt-12">
  <div class="hero-content flex-col lg:flex-row-reverse">
    <div class="w-full lg:w-5/12">
      <div class="w-4/5 mx-auto" bind:this={animationContainer}></div>
    </div>
    <div class="w-full lg:w-7/12 mt-6 lg:mt-0 lg:mr-12">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mt-4"
      >
        What does it do?
      </div>
      <div
        class="flex flex-col lg:flex-row mt-8 gap-6 place-content-center content-center"
      >
        <div class="min-w-[270px] lg:min-w-[420px] flex mt-6 lg:mt-0">
          <div class="my-auto">
            <div class="px-4 mt-6 text-lg md:text-xl">
              Our <span class="font-bold">technology</span>
              uses mathematical algorithms and GPS scanning technology to assess
              various shapes, sizes and obstacles in any given paddock to determine
              the most efficient way to traverse these paddocks.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
