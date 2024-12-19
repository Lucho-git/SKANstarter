<script>
  import Marquee from "$lib/components/magic/marquee/Marquee.svelte"

  const partners = [
    {
      name: "ABC Rural",
      logo: "/images/partnerLogos/ABCRural.png",
      alt: "ABC Rural logo",
    },
    {
      name: "Agribusiness Connect",
      logo: "/images/partnerLogos/AgribusinessConnect.png",
      alt: "Agribusiness Connect logo",
    },
    {
      name: "Agristart",
      logo: "/images/partnerLogos/agristart.png",
      alt: "Agristart logo",
    },
    {
      name: "Agtech and Logistics Hub",
      logo: "/images/partnerLogos/Agtech-and-Logistics-Hub.svg",
      alt: "Agtech and Logistics Hub logo",
    },
    {
      name: "Datafarming",
      logo: "/images/partnerLogos/Datafarming.svg",
      alt: "Datafarming logo",
    },
    {
      name: "Innovation Cluster",
      logo: "/images/partnerLogos/innovationcluster.png",
      alt: "Innovation Cluster logo",
    },
    {
      name: "Beanstalk",
      logo: "/images/partnerLogos/Beanstalk.png",
      alt: "Beanstalk logo",
    },
    {
      name: "Farm Weekly",
      logo: "/images/partnerLogos/farm_weekly.png",
      alt: "Farm Weekly logo",
    },
    {
      name: "GRDC",
      logo: "/images/partnerLogos/GRDC.png",
      alt: "GRDC logo",
    },
    {
      name: "Generation Ag",
      logo: "/images/partnerLogos/generationag.png",
      alt: "Generation Ag logo",
    },
    {
      name: "Mingenew Irwin Group",
      logo: "/images/partnerLogos/Mingenew-Irwin-Group.png",
      alt: "Mingenew Irwin Group logo",
    },
  ]
</script>

<div
  class="relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-[#f5f3e8] md:shadow-xl"
>
  <Marquee reverse pauseOnHover class="[--duration:20s]">
    {#each partners as partner}
      <div class="mx-8 flex items-center justify-center">
        <img
          src={partner.logo}
          alt={partner.alt}
          class="h-16 w-auto max-w-[200px] object-contain transition-all duration-200"
          loading="lazy"
        />
      </div>
    {/each}
  </Marquee>
  <div
    class="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#f5f3e8]"
  ></div>
  <div
    class="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#f5f3e8]"
  ></div>
</div>
