<script lang="ts">
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "$lib/components/ui/accordion"

  const faqs = [
    {
      question: "How do I setup AgSKAN?",
      answer:
        "Follow this link to watch a short tutorial about setting up AgSKAN. How to setup AgSKAN in 4 minutes",
    },
    {
      question: "How much does AgSKAN cost?",
      answer:
        "AgSKAN costs $1 per day, per user. In the billing section a 'seat' is a person who will be using the app on your farm, including you as the owner/manager. Select as many seats as you need for your operation, you as the owner of the account will pay for these seats which will give your account the authority to host all of the other users on your live map. ie. You (map owner) + 2 full time operators = 3 seats. This would be $3 per day to make sure the farm is running smoothly, priceless!",
    },
    {
      question: "Will AgSKAN work for seeding?",
      answer:
        "It certainly will. Use AgSKAN in the sprayer to 'paint' a live map of where treflan has been sprayed. The seeder driver will be able to see this on his shared live map, ensuring they never seed anything that hasn't been sprayed yet. Use the pin drop function to mark where the fill up truck is parked so the whole seeding crew can stay in the loop. Everyone can access the map on their phone on the go. This will save you time and money. Setup the seeding rig with AgSKAN so the operator can use our one touch function to mark rocks and stumps on the fly. You can see these obstacles live on everyone's map making stump/rock picking a breeze. To set up a sprayer and seeder for 2025 it would only cost you $2 a day, all you need is a phone or tablet!",
    },
    {
      question: "Will AgSKAN work for harvest?",
      answer:
        "It certainly will. Use AgSKAN in the headers to 'paint' a live map of what has been harvested. The chaser bin driver will be able to see this on his shared live map and know where to find the headers at all times. Avoiding that two-way radio going off all day in your ear! \"Copy, headers? Where are you guys?\" Use the pin drop function to mark where the field bins are parked so the whole harvest crew (including the trucks) can stay in the loop. Everyone can access the map on their phone on the go. This will save you time and money. To setup 2 headers, a chaser bin and a truck it would only cost you $4 a day!",
    },
    {
      question: "Will AgSKAN work for rock/stump picking?",
      answer:
        "It certainly will. Set up any of your tractors with AgSKAN so the operator can use our one touch function to mark rocks and stumps on the fly. You can see these obstacles live on everyone's map making stump/rock picking a breeze.",
    },
    {
      question: "Do I need any hardware to run AgSKAN?",
      answer:
        "No you don't. AgSKAN will run on any mobile device with an internet connection. You can use IOS and Android phones or tablets. We are completely machine agnostic meaning we will work in any colour/brand/age of machine. You can setup AgSKAN in under 10 minutes.",
    },
    {
      question: "Can I upload my paddock boundaries onto the AgSKAN map?",
      answer:
        "Yes you can. It is a very simple process and shouldn't take more than 5 minutes if you have the paddock files on hand. Follow this short video to find out how to do it. How to setup AgSKAN in 4 minutes",
    },
    {
      question: "Will AgSKAN work if I don't have paddock boundary files?",
      answer:
        "It certainly will. Just jump straight onto the map and start trailing, skip the map upload step.",
    },
    {
      question: "How do I connect people to my map?",
      answer:
        "You are looking for the map ID link, share this between your operators so you can join onto a live map. If you can't find that, watch this short 4 minute video. How to setup AgSKAN in 4 minutes",
    },
  ]
</script>

<section class="bg-base-100">
  <div class="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-12 text-center text-3xl font-bold text-base-content">
        Frequently Asked Questions
      </h2>

      <Accordion type="single" collapsible class="w-full">
        {#each faqs as faq, i}
          <AccordionItem value="item-{i}">
            <AccordionTrigger class="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        {/each}
      </Accordion>
    </div>
  </div>
</section>
