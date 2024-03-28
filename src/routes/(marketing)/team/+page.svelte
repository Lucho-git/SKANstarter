<script>
  import { onMount } from "svelte"
  import lottie from "lottie-web"

  const teamMembers = [
    {
      name: "Lachie",
      role: "Technical Founder",
      bio: "Lachie is a Software Engineer and has been involved in multiple <strong>startup's</strong> and <strong>tech innovations</strong>. His dad grew up on a farm in WA, Lachie may be removed from agriculture but it's certainly in his history, he is striving for a better agriculture industry for the future.",
      image: "/images/lach-gif.gif",
    },
    {
      name: "Ryan",
      role: "Managing Founder",
      bio: "Ryan is a <strong>carpenter</strong> by trade, growing up in Perth, WA he had a calling for greener pastures in his early 20's. He has now been working full time in the <strong>agricultural industry</strong> for the past 5 years and has countless machine operating hours under his belt. This is a problem he lives and breathes every day, and that's why he is so energised to fix it.",
      image: "/images/ryan.jpg",
    },
  ]

  let animationContainer

  onMount(() => {
    lottie.loadAnimation({
      container: animationContainer,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/animations/TractorBothWays.json",
    })
  })
</script>

<div class="container mx-auto px-4 py-8">
  <h1
    class="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
  >
    Our Story
  </h1>

  <div class="mb-12 max-w-3xl mx-auto">
    <p class="text-lg">
      Ryan and Lachie grew up together and have been mates for over <strong
        >20 years</strong
      >. We both chose vastly different career paths but somehow ended up right
      back together all these years later. We are combining the life skills and
      knowledge we have acquired since entering the workforce to solve an
      immense, real world problem that hits home for both of us.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    {#each teamMembers as member}
      <div class="card shadow-md">
        <figure class="px-10 pt-10">
          <img
            src={member.image}
            alt={member.name}
            class="mask mask-squircle h-64 w-64 object-cover"
          />
        </figure>
        <div class="card-body items-center text-center">
          <h2 class="card-title">{member.name}</h2>
          <p class="text-gray-500">{member.role}</p>
          <p>{@html member.bio}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-12 max-w-3xl mx-auto text-center">
    <h2
      class="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent"
    >
      Our Vision
    </h2>
    <p class="mb-6">
      It's simple, we want to <strong>reduce input costs</strong> for farmers,
      we want to <strong>reduce machine hours</strong> every year,
      <strong>reduce carbon emissions</strong> and make genuine, real world improvements
      for the farmers who work tirelessly to feed the world.
    </p>
  </div>

  <div class="mt-12 max-w-3xl mx-auto">
    <!-- Add the Lottie animation container -->
    <div class="mx-auto overflow-hidden">
      <div
        bind:this={animationContainer}
        class="farming-animation w-full h-full transform scale-150"
      ></div>
    </div>
  </div>
</div>
