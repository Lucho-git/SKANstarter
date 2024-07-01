import { c as create_ssr_component, b as subscribe, f as escape } from "../../chunks/ssr.js";
/* empty css                */import { p as page } from "../../chunks/stores.js";
const Error_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let parsedError;
  try {
    parsedError = JSON.parse($page.error.message);
  } catch {
    parsedError = $page.error;
  }
  const error = parsedError;
  console.log("page", $page);
  console.error("Error occurred:", error);
  console.error("URL:", $page.url.href);
  const stackTrace = error.stack || new Error().stack;
  console.error("Stack trace:", stackTrace);
  $$unsubscribe_page();
  return `<div class="hero min-h-[100vh] bg-base-200"><div class="hero-content text-center"><div class="max-w-lg"><h1 class="text-5xl font-bold mb-6" data-svelte-h="svelte-n41i1p">This is embarrassing...</h1> <p class="text-2xl mb-4">${escape(error.userMessage || error.message)}</p> ${error.id || error.errorId ? `<p class="text-xl mb-4">Error ID: ${escape(error.id || error.errorId)}</p>` : ``} ${``} <div class="flex justify-center space-x-4 mt-6 mb-6" data-svelte-h="svelte-1eli2bt"><a href="/" class="btn btn-primary btn-wide">Return Home</a> <a href="/account/" class="btn btn-info btn-wide">Dashboard</a></div></div></div></div>`;
});
export {
  Error_1 as default
};
