<script>
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  function handleLearnMoreClick() {
    dispatch("scrollToLearnMore")
  }
</script>

<div
  class="hero min-h-[900px] relative flex flex-col justify-center"
  style="background-image: url('/images/fieldpic_1.jpeg'); background-size: cover;"
>
  <div class="hero-overlay bg-opacity-40 absolute inset-0"></div>
  <div class="hero-content text-left text-secondary pt-0 relative z-10">
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
