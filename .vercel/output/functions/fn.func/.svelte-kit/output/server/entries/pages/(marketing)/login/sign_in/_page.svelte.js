import { c as create_ssr_component, b as subscribe, v as validate_component } from "../../../../../chunks/ssr.js";
import { o as oauthProviders, s as sharedAppearance, A as Auth } from "../../../../../chunks/login_config.js";
import { p as page } from "../../../../../chunks/stores.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-1b18gx1_START -->${$$result.title = `<title>Sign in</title>`, ""}<!-- HEAD_svelte-1b18gx1_END -->`, ""} ${$page.url.searchParams.get("verified") == "true" ? `<div role="alert" class="alert alert-success mb-5" data-svelte-h="svelte-nfggle"><svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>Email verified! Please sign in.</span></div>` : ``} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-1h87fjo">Sign In</h1> ${validate_component(Auth, "Auth").$$render(
    $$result,
    {
      supabaseClient: data.supabase,
      view: "sign_in",
      redirectTo: `${data.url}/auth/callback`,
      providers: oauthProviders,
      socialLayout: "horizontal",
      showLinks: false,
      appearance: sharedAppearance,
      additionalData: void 0
    },
    {},
    {}
  )} <div class="text-l text-slate-800 mt-4" data-svelte-h="svelte-1epm3v2"><a class="underline" href="/login/forgot_password">Forgot password?</a></div> <div class="text-l text-slate-800 mt-3" data-svelte-h="svelte-1u0qhbd">Don&#39;t have an account? <a class="underline" href="/login/sign_up">Sign up</a>.</div>`;
});
export {
  Page as default
};
