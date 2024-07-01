import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { o as oauthProviders, s as sharedAppearance, A as Auth } from "../../../../../chunks/login_config.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `${$$result.head += `<!-- HEAD_svelte-1jhj6lf_START -->${$$result.title = `<title>Sign up</title>`, ""}<!-- HEAD_svelte-1jhj6lf_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-xsromu">Sign Up</h1> ${validate_component(Auth, "Auth").$$render(
    $$result,
    {
      supabaseClient: data.supabase,
      view: "sign_up",
      redirectTo: `${data.url}/auth/callback`,
      showLinks: false,
      providers: oauthProviders,
      socialLayout: "horizontal",
      appearance: sharedAppearance,
      additionalData: void 0
    },
    {},
    {}
  )} <div class="text-l text-content mt-4 mb-2" data-svelte-h="svelte-wweko1">Have an account? <a class="underline" href="/login/sign_in">Sign in</a>.</div>`;
});
export {
  Page as default
};
