import { c as create_ssr_component, f as escape, e as each, d as add_attribute } from "./ssr.js";
const PricePlanBox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { plan } = $$props;
  let { isCurrentPlan } = $$props;
  let { callToAction } = $$props;
  let { isDisabled } = $$props;
  let { isHighlighted } = $$props;
  if ($$props.plan === void 0 && $$bindings.plan && plan !== void 0)
    $$bindings.plan(plan);
  if ($$props.isCurrentPlan === void 0 && $$bindings.isCurrentPlan && isCurrentPlan !== void 0)
    $$bindings.isCurrentPlan(isCurrentPlan);
  if ($$props.callToAction === void 0 && $$bindings.callToAction && callToAction !== void 0)
    $$bindings.callToAction(callToAction);
  if ($$props.isDisabled === void 0 && $$bindings.isDisabled && isDisabled !== void 0)
    $$bindings.isDisabled(isDisabled);
  if ($$props.isHighlighted === void 0 && $$bindings.isHighlighted && isHighlighted !== void 0)
    $$bindings.isHighlighted(isHighlighted);
  return `<div class="${[
    "flex-none card card-bordered shadow-xl flex-1 flex-grow min-w-[260px] max-w-[310px] p-6",
    (isHighlighted ? "border-primary" : "") + " " + (!isHighlighted ? "border-gray-200" : "")
  ].join(" ").trim()}"><div class="flex flex-col h-full"><div class="text-xl font-bold">${escape(plan.name)}</div> <p class="mt-2 text-sm text-gray-500 leading-relaxed">${escape(plan.description)}</p> <div class="mt-auto pt-4 text-sm text-gray-600">Plan Includes:
      <ul class="list-disc list-inside mt-2 space-y-1">${each(plan.features, (feature) => {
    return `<li>${escape(feature)}</li>`;
  })}</ul></div> <div class="pt-8"><span class="text-4xl font-bold">${escape(plan.price)}</span> <span class="text-gray-400">${escape(plan.priceIntervalName)}</span> <div class="mt-6 pt-4 flex-1 flex flex-row items-center">${isCurrentPlan ? `<div class="btn btn-outline btn-success no-animation w-[80%] mx-auto cursor-default" data-svelte-h="svelte-1o61kwa">Current Plan</div>` : `<a${add_attribute(
    "href",
    isDisabled ? "#" : `/account/subscribe/${plan?.stripe_price_id ?? "free_plan"}`,
    0
  )} class="${["btn btn-primary w-[80%] mx-auto", isDisabled ? "btn-disabled" : ""].join(" ").trim()}">${escape(callToAction)}</a>`}</div></div></div></div>`;
});
const PricingFAQ = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1 class="text-2xl font-bold text-center mt-12" data-svelte-h="svelte-ey4gs">Pricing FAQ</h1> <div class="flex place-content-center" data-svelte-h="svelte-1uxuukq"><div class="join join-vertical max-w-xl py-6 mx-auto"><div class="collapse collapse-arrow join-item border border-primary"><input type="radio" name="faq-accordion"> <div class="collapse-title text-lg font-medium text-center">How do I get started using the free PaddockPath tool?</div> <div class="collapse-content"><p>Simply create an account with SKAN, upload your mapping files from
          your desktop to our portal and wait to receive your maps back with our
          algorithm based mapping guide in your email inbox. We can accept all
          mapping file types.</p></div></div> <div class="collapse collapse-arrow join-item border border-primary"><input type="radio" name="faq-accordion"> <div class="collapse-title text-lg font-medium text-center">How will the pricing system work?</div> <div class="collapse-content"><p>We are open to ideas on how you as a user would prefer to pay for this
          service. The options are on a monthly/yearly subscription basis. Flat
          payment per account, or scalable price based on hectare.</p> <p class="mt-4">We are interested to hear your thoughts. Please find the feedback page
          and leave your thoughts for the team at SKAN.</p></div></div> <div class="collapse collapse-arrow join-item border border-primary"><input type="radio" name="faq-accordion"> <div class="collapse-title text-lg font-medium text-center">How will the live PaddockPath be displayed?</div> <div class="collapse-content"><p>The live PaddockPath will be displayed on either an IOS or Android
          device mounted in whatever machine cab you are utilising.</p></div></div> <div class="collapse collapse-arrow join-item border border-primary"><input type="radio" name="faq-accordion"> <div class="collapse-title text-lg font-medium text-center">When will the live version be available?</div> <div class="collapse-content"><p>We are currently still in the development process of our live version
          of PaddockPath. With your help as a user, by leaving feedback on our
          simplified version of PaddockPath we can generate software that will
          be beneficial to our user base.</p> <p class="mt-4">Please find the feedback page and leave your thoughts for the team at
          SKAN.</p></div></div></div></div>`;
});
export {
  PricePlanBox as P,
  PricingFAQ as a
};
