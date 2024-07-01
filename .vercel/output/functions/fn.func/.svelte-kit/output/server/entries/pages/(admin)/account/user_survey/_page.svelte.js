import { c as create_ssr_component, b as subscribe, h as createEventDispatcher, f as escape, v as validate_component } from "../../../../../chunks/ssr.js";
import { s as session } from "../../../../../chunks/user.js";
import "../../../../../chunks/supabaseClient.js";
const formId = "7d624884-1198-4af8-b49d-4b8b5efcb85c";
const FeatheryForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => value);
  createEventDispatcher();
  $$unsubscribe_session();
  return `   <div class="max-w-2xl mx-auto p-4 bg-green-200 rounded-lg shadow-md overflow-auto">${`<div id="${"container_" + escape(formId, true)}" class="min-h-[90vh] overflow-auto"></div>`}</div>  `;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-1tnm1ny_START -->${$$result.title = `<title>User Survey</title>`, ""}<!-- HEAD_svelte-1tnm1ny_END -->`, ""} <div class="text-center content-center min-h-[100vh] mb-12 mt-4 flex items-center place-content-center"><div class="flex flex-col w-full px-6"><div><h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-nesswd">User Survey</h1> ${`${validate_component(FeatheryForm, "FeatheryForm").$$render($$result, {}, {}, {})} <button class="btn btn-secondary mt-4" data-svelte-h="svelte-jba738">Skip Survey</button>`}</div></div></div>`;
});
export {
  Page as default
};
