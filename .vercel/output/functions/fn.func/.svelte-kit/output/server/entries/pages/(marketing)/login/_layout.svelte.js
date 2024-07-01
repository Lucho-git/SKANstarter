import { c as create_ssr_component } from "../../../../chunks/ssr.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="text-center content-center max-w-lg mx-auto min-h-[70vh] mb-12 flex items-center place-content-center"><div class="flex flex-col w-64 lg:w-80">${slots.default ? slots.default({}) : ``}</div></div>`;
});
export {
  Layout as default
};
