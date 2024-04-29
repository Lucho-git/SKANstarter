<script>
  import { onMount } from "svelte"
  import lottie from "lottie-web"

  const teamMembers = [
    {
      name: "Lachie",
      role: "Technical Founder",
      bio: "Lachie is a Software Engineer and has been involved in multiple <strong>startup's</strong> and <strong>tech innovations</strong>. His dad grew up on a farm in WA, Lachie may be removed from agriculture but it's certainly in his history, he is striving for a better agriculture industry for the future.",
      image: "/images/lach-gif.gif",
      linkedInUrl: "https://www.linkedin.com/in/lachlan-f-ross/",
    },
    {
      name: "Ryan",
      role: "Managing Founder",
      bio: "Ryan is a <strong>carpenter</strong> by trade, growing up in Perth, WA he had a calling for greener pastures in his early 20's. He has now been working full time in the <strong>agricultural industry</strong> for the past 5 years and has countless machine operating hours under his belt. This is a problem he lives and breathes every day, and that's why he is so energised to fix it.",
      image: "/images/ryan.jpg",
      linkedInUrl: "https://www.linkedin.com/in/ryan-skamp-a3b41a2b2/",
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
      <a
        href={member.linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="group"
      >
        <div
          class="card shadow-md group-hover:shadow-lg transition duration-300 transform group-hover:-translate-y-1 h-full border-2 border-transparent group-hover:border-primary group-hover:bg-base-200 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg relative"
        >
          <div
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300"
          >
            <svg
              class="w-6 h-6 text-blue-500 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
              ></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            <svg
              class="w-4 h-4 text-gray-600 inline-block ml-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
              ></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>
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
      </a>
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
