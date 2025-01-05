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

  let touchStartX = 0
  let touchEndX = 0

  function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX
  }

  function handleTouchMove(event) {
    touchEndX = event.touches[0].clientX
  }

  function handleTouchEnd() {
    const touchDistance = touchEndX - touchStartX

    if (touchDistance > 50) {
      previousSlide()
    } else if (touchDistance < -50) {
      nextSlide()
    }

    touchStartX = 0
    touchEndX = 0
  }
</script>

<div
  class="carousel relative w-full"
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}
>
  <div
    class="carousel-inner relative flex h-[900px] w-full items-center justify-center overflow-hidden"
  >
    <div
      class="carousel-items absolute left-0 top-0 flex h-full w-full transition-transform duration-500 ease-in-out"
      style="transform: translateX(-{currentSlide * 100}%);"
    >
      {#each images as image}
        <div class="carousel-item relative h-full w-full flex-shrink-0">
          <div
            class="hero relative h-full w-full"
            style="background-image: url('{image}'); background-size: cover;"
          >
            <div
              class="hero-overlay absolute inset-0 bg-black bg-opacity-45"
            ></div>
          </div>
        </div>
      {/each}
    </div>
    <div class="hero-content absolute z-10 text-center text-secondary">
      <div class="w-full max-w-6xl">
        <h1 class="mb-5 text-7xl font-bold">Unlock Your Farm's Potential</h1>
        <div class="flex justify-center">
          <a href="/old/login?tab=sign_up">
            <button class="btn btn-primary mr-4">Get Started</button>
          </a>
          <button on:click={handleLearnMoreClick}>Learn More</button>
        </div>
      </div>
    </div>
  </div>
  <div
    class="absolute left-5 right-5 top-1/2 z-20 flex -translate-y-1/2 transform justify-between"
  >
    <button class="btn btn-circle" on:click={previousSlide}>❮</button>
    <button class="btn btn-circle" on:click={nextSlide}>❯</button>
  </div>
</div>

<div class="mt-4 flex justify-center">
  {#each images as _, index}
    <button
      class="mx-1 h-3 w-3 rounded-full"
      class:bg-primary={currentSlide === index}
      class:bg-gray-300={currentSlide !== index}
      on:click={() => goToSlide(index)}
    ></button>
  {/each}
</div>
