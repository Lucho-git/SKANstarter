<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Card } from "$lib/components/ui/card"
  import { Linkedin } from "lucide-svelte"
  import MagicCard from "$lib/components/magic/magiccard/MagicCard.svelte"

  interface TeamMember {
    name: string
    role: string
    bio: string
    linkedIn: string
    gradientColor: string
  }

  const teamMembers: TeamMember[] = [
    {
      name: "Lachie",
      role: "Technical Founder",
      bio: "Lachie is a Software Engineer and has been involved in multiple <strong>startup's</strong> and <strong>tech innovations</strong>. His dad grew up on a farm in WA, Lachie may be removed from agriculture but it's certainly in his history, he is striving for a better agriculture industry for the future.",
      linkedIn: "https://www.linkedin.com/company/skan-australia/",
      gradientColor: "#2EFFBD",
    },
    {
      name: "Ryan",
      role: "Managing Founder",
      bio: "Ryan is a <strong>carpenter</strong> by trade, growing up in Perth, WA he had a calling for greener pastures in his early 20's. He has now been working full time in the <strong>agricultural industry</strong> for the past 5 years and has countless machine operating hours under his belt. This is a problem he lives and breathes every day, and that's why he is so energised to fix it.",
      linkedIn: "https://www.linkedin.com/in/ryan-skamp-a3b41a2b2/",
      gradientColor: "#FF7700",
    },
  ]
</script>

<div class="container mx-auto px-4 pb-16">
  <div class="h-12"></div>

  <!-- Our Story Section -->
  <div class="mx-auto max-w-4xl">
    <h1 class="mb-8 text-center text-4xl font-bold">Our Story</h1>
    <Card class="mb-12 p-6">
      <p class="text-lg leading-relaxed text-base-content/90">
        Ryan and Lachie grew up together and have been mates for over 20 years.
        We both chose vastly different career paths but somehow ended up right
        back together all these years later. We are combining the life skills
        and knowledge we have acquired since entering the workforce to solve an
        immense, real world problem that hits home for both of us.
      </p>
    </Card>

    <!-- Team Photo -->
    <div class="mb-12">
      <div class="overflow-hidden rounded-xl bg-base-100">
        <div class="aspect-video">
          <img
            src="/images/team.jpg"
            alt="SKAN Team"
            class="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>

    <!-- Team Member Bios -->
    <div class="mb-24 grid gap-8 md:grid-cols-2">
      {#each teamMembers as member}
        <a
          href={member.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          class="block h-full"
        >
          <MagicCard
            gradientColor={member.gradientColor}
            gradientOpacity={0.1}
            gradientSize={300}
          >
            <div class="group w-full p-6">
              <div class="mb-4 flex items-start justify-between">
                <div>
                  <h3 class="mb-2 text-2xl font-bold">
                    {member.name}
                  </h3>
                  <h4 class="text-xl text-primary">{member.role}</h4>
                </div>
                <Linkedin
                  class="h-5 w-5 text-primary transition-all duration-300 group-hover:text-[{member.gradientColor}]"
                />
              </div>
              <p class="text-base-content/90">{@html member.bio}</p>
            </div>
          </MagicCard>
        </a>
      {/each}
    </div>

    <!-- Our Vision Section -->
    <div class="mb-24">
      <h2 class="mb-8 text-center text-4xl font-bold">Our Vision</h2>
      <Card class="p-6">
        <p class="text-lg leading-relaxed text-base-content/90">
          It's simple, we want to reduce input costs for farmers, we want to
          reduce machine hours every year, reduce carbon emissions and make
          genuine, real world improvements for the farmers who work tirelessly
          to feed the world.
        </p>
      </Card>
    </div>
  </div>
</div>
