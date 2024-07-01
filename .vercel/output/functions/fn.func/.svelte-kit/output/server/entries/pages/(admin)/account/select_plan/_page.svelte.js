import { c as create_ssr_component, e as each, v as validate_component } from "../../../../../chunks/ssr.js";
import { P as PricePlanBox, a as PricingFAQ } from "../../../../../chunks/PricingFAQ.js";
import { p as pricingPlans } from "../../../../../chunks/pricing_plans.js";
let currentPlanId = "";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-1dceu6j_START -->${$$result.title = `<title>Select a Plan</title>`, ""}<!-- HEAD_svelte-1dceu6j_END -->`, ""} <div class="text-center content-center mb-12 mt-4 flex items-center place-content-center"><div class="flex flex-col w-full px-6"><div><h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-afbe4a">Select a Plan</h1> <div class="mt-0 flex flex-col lg:flex-row gap-10 justify-center flex-wrap">${each(pricingPlans, (plan) => {
    return `${validate_component(PricePlanBox, "PricePlanBox").$$render(
      $$result,
      {
        plan,
        isCurrentPlan: plan.id === currentPlanId,
        callToAction: plan.id === "free" ? "Select Plan" : "Sold Out",
        isDisabled: plan.id === "enterprise" || plan.id === "pro",
        isHighlighted: plan.id === "free"
      },
      {},
      {}
    )}`;
  })}</div></div></div></div> ${validate_component(PricingFAQ, "PricingFAQ").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
