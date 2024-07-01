import { c as create_ssr_component, j as getContext, f as escape, e as each, v as validate_component } from "../../../../../../chunks/ssr.js";
import { S as Settings_module } from "../../../../../../chunks/settings_module.js";
import { d as defaultPlanId, p as pricingPlans } from "../../../../../../chunks/pricing_plans.js";
import { P as PricePlanBox, a as PricingFAQ } from "../../../../../../chunks/PricingFAQ.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let adminSection = getContext("adminSection");
  adminSection.set("billing");
  let { data } = $$props;
  let currentPlanId = data.currentPlanId ?? defaultPlanId;
  let currentPlanName = pricingPlans.find((x) => x.id === data.currentPlanId)?.name;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `${$$result.head += `<!-- HEAD_svelte-y42mya_START -->${$$result.title = `<title>Billing</title>`, ""}<!-- HEAD_svelte-y42mya_END -->`, ""} <h1 class="text-2xl font-bold mb-6 text-center">${escape(data.isActiveCustomer ? "Billing" : "Select a Plan")}</h1> ${!data.isActiveCustomer ? `<div class="mt-12 flex flex-col lg:flex-row gap-10 justify-center flex-wrap">${each(pricingPlans, (plan) => {
    return `${validate_component(PricePlanBox, "PricePlanBox").$$render(
      $$result,
      {
        plan,
        isCurrentPlan: plan.id === currentPlanId,
        isHighlighted: plan.id === currentPlanId,
        callToAction: "Sold Out",
        isDisabled: plan.id === "enterprise" || plan.id === "pro"
      },
      {},
      {}
    )}`;
  })}</div> ${validate_component(PricingFAQ, "PricingFAQ").$$render($$result, {}, {}, {})} ${data.hasEverHadSubscription ? `<div class="mt-10" data-svelte-h="svelte-13z1v1l"><a href="/account/billing/manage" class="link">View past invoices</a></div>` : ``}` : `${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Subscription",
      editable: false,
      fields: [
        {
          id: "plan",
          label: "Current Plan",
          initialValue: currentPlanName || ""
        }
      ],
      editButtonTitle: "Manage Subscripton",
      editLink: "/account/billing/manage"
    },
    {},
    {}
  )}`}`;
});
export {
  Page as default
};
