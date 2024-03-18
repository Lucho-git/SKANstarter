<script>
  import { onMount } from "svelte"
  import lottie from "lottie-web"

  const teamMembers = [
    {
      name: "Lachie",
      role: "Technical Founder",
      bio: "Lachie is a Software Engineer and has been involved in multiple <strong class='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500'>startup's</strong> and <strong class='text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500'>tech innovations</strong>. His dad grew up on a farm in WA, Lachie may be removed from agriculture but it's certainly in his history, he is striving for a better agriculture industry for the future.",
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Ryan",
      role: "Managing Founder",
      bio: "Ryan is a <strong class='text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500'>carpenter</strong> by trade, growing up in Perth, WA he had a calling for greener pastures in his early 20's. He has now been working full time in the <strong class='text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500'>agricultural industry</strong> for the past 5 years and has countless machine operating hours under his belt. This is a problem he lives and breathes every day, and that's why he is so energised to fix it.",
      image: "https://via.placeholder.com/150",
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
    class="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600"
  >
    Our Story
  </h1>

  <div class="mb-12 max-w-3xl mx-auto">
    <p class="text-lg">
      Ryan and Lachie grew up together and have been mates for over <strong
        class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500"
        >20 years</strong
      >. We both chose vastly different career paths but somehow ended up right
      back together all these years later. We are combining the life skills and
      knowledge we have acquired since entering the workforce to sole an
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
            class="mask mask-squircle h-48 w-48 object-cover"
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
      class="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600"
    >
      Our Vision
    </h2>
    <p class="mb-6">
      It's simple, we want to <strong
        class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500"
        >reduce input costs</strong
      >
      for farmers, we want to
      <strong
        class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500"
        >reduce machine hours</strong
      >
      every year,
      <strong
        class="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500"
        >reduce carbon emissions</strong
      > and make genuine, real world improvements for the farmers who work tirelessly
      to feed the world.
    </p>
  </div>

  <div class="mt-12 max-w-3xl mx-auto">
    <!-- Add the Lottie animation container -->
    <div bind:this={animationContainer} class="farming-animation"></div>
  </div>
</div>
