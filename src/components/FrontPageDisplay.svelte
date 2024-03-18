<script>
  import { createEventDispatcher, onMount } from "svelte"

  const dispatch = createEventDispatcher()

  function handleLearnMoreClick() {
    dispatch("scrollToLearnMore")
  }

  const images = [
    "/images/fieldpic_2.jpg",
    "/images/fieldpic_3.jpg",
    "/images/fieldpic_4.jpg",
    "/images/fieldpic_5.jpg",
    "/images/fieldpic_1.jpg",
  ]

  let currentSlide = 0
  let interval

  function nextSlide() {
    currentSlide = (currentSlide + 1) % images.length
    resetTimer()
  }

  function previousSlide() {
    currentSlide = (currentSlide - 1 + images.length) % images.length
    resetTimer()
  }

  function goToSlide(index) {
    currentSlide = index
    resetTimer()
  }

  function resetTimer() {
    clearInterval(interval)
    interval = setInterval(nextSlide, 5000)
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "ArrowLeft":
        previousSlide()
        break
      case "ArrowRight":
        nextSlide()
        break
    }
  }

  onMount(() => {
    interval = setInterval(nextSlide, 5000)
    window.addEventListener("keydown", handleKeydown)
    return () => {
      clearInterval(interval)
      window.removeEventListener("keydown", handleKeydown)
    }
  })
</script>

<div class="carousel w-full relative">
  <div
    class="carousel-inner relative w-full h-[900px] overflow-hidden flex justify-center items-center"
  >
    <div
      class="carousel-items absolute top-0 left-0 w-full h-full flex transition-transform duration-500 ease-in-out"
      style="transform: translateX(-{currentSlide * 100}%);"
    >
      {#each images as image}
        <div class="carousel-item relative w-full h-full flex-shrink-0">
          <div
            class="hero w-full h-full relative"
            style="background-image: url('{image}'); background-size: cover;"
          >
            <div class="hero-overlay bg-opacity-30 absolute inset-0"></div>
          </div>
        </div>
      {/each}
    </div>
    <div class="hero-content text-center text-secondary absolute z-10">
      <div class="max-w-6xl w-full">
        <h1 class="mb-5 text-7xl font-bold">Unlock Your Farms Potential</h1>
        <div class="flex justify-center">
          <a href="/login/sign_up">
            <button class="btn btn-primary mr-4">Get Started</button>
          </a>
          <button on:click={handleLearnMoreClick}>Learn More</button>
        </div>
      </div>
    </div>
  </div>
  <div
    class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2 z-20"
  >
    <button class="btn btn-circle" on:click={previousSlide}>❮</button>
    <button class="btn btn-circle" on:click={nextSlide}>❯</button>
  </div>
</div>

<div class="flex justify-center mt-4">
  {#each images as _, index}
    <button
      class="w-3 h-3 rounded-full mx-1"
      class:bg-primary={currentSlide === index}
      class:bg-gray-300={currentSlide !== index}
      on:click={() => goToSlide(index)}
    ></button>
  {/each}
</div>
