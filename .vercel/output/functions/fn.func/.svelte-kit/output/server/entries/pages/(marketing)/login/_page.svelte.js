import { c as create_ssr_component } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-t6upee_START -->${$$result.title = `<title>Log In</title>`, ""}<!-- HEAD_svelte-t6upee_END -->`, ""} <div data-svelte-h="svelte-1ph1dbq"><h1 class="text-xl font-bold">Get Started</h1> <a href="/login/sign_up"><button class="btn btn-primary mt-3 btn-wide">Sign Up</button></a> <h1 class="text-xl mt-6">Already have an account?</h1> <a href="/login/sign_in"><button class="btn btn-outline btn-primary mt-3 btn-wide">Sign In</button></a></div>`;
});
export {
  Page as default
};
