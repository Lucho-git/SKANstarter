import { c as create_ssr_component, v as validate_component } from "../../../../../chunks/ssr.js";
import { o as oauthProviders, s as sharedAppearance, A as Auth } from "../../../../../chunks/login_config.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `${$$result.head += `<!-- HEAD_svelte-1ebwcft_START -->${$$result.title = `<title>Forgot Password</title>`, ""}<!-- HEAD_svelte-1ebwcft_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-61zidk">Forgot Password</h1> ${validate_component(Auth, "Auth").$$render(
    $$result,
    {
      supabaseClient: data.supabase,
      view: "forgotten_password",
      redirectTo: `${data.url}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`,
      providers: oauthProviders,
      socialLayout: "horizontal",
      showLinks: false,
      appearance: sharedAppearance,
      additionalData: void 0
    },
    {},
    {}
  )} <div class="text-l text-slate-800 mt-4" data-svelte-h="svelte-xcx411">Remember your password? <a class="underline" href="/login/sign_in">Sign in</a>.</div>`;
});
export {
  Page as default
};
