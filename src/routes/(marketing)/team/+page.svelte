<script>
  const teamMembers = [
    {
      name: "Lachie",
      role: "Technical Founder",
      bio: "Lachie is a Software Engineer and has been involved in multiple startup's and tech innovations. His dad grew up on a farm in WA, Lachie may be removed from agriculture but it's certainly in his history, he is striving for a better agriculture industry for the future.",
      image: "path/to/lachie-image.jpg",
    },
    {
      name: "Ryan",
      role: "Managing Founder",
      bio: "Ryan is a carpenter by trade, growing up in Perth, WA he had a calling for greener pastures in his early 20's. He has now been working full time in the agricultural industry for the past 5 years and has countless machine operating hours under his belt. This is a problem he lives and breathes every day, and that's why he is so energised to fix it.",
      image: "path/to/ryan-image.jpg",
    },
  ]
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8 text-center">Our Story</h1>

  <div class="mb-12 max-w-3xl mx-auto">
    <p class="text-lg">
      Ryan and Lachie grew up together and have been mates for over 20 years. We
      both chose vastly different career paths but somehow ended up right back
      together all these years later. We are combining the life skills and
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
          <p>{member.bio}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
