import { c as create_ssr_component } from "../../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-19m11km_START -->${$$result.title = `<title>Current Password Incorrect</title>`, ""}<!-- HEAD_svelte-19m11km_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-18zj9bb">Current Password Incorrect</h1> <p data-svelte-h="svelte-pomge2">You attempted edit your account with an incorrect current password, and have
  been logged out.</p> <p class="mt-6" data-svelte-h="svelte-18x569e">If you remember your password <a href="/login/sign_in" class="link">sign in</a> and try again.</p> <p class="mt-6" data-svelte-h="svelte-1ujv07y">If you forget your password <a href="/login/forgot_password" class="link">reset it</a>.</p>`;
});
export {
  Page as default
};
