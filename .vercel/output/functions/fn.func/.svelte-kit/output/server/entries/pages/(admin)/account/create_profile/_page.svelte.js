import { c as create_ssr_component, f as escape, d as add_attribute } from "../../../../../chunks/ssr.js";
/* empty css                         */import "devalue";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { form } = $$props;
  let { session, profile } = data;
  let fullName = profile?.full_name ?? "";
  let companyName = profile?.company_name ?? "";
  let website = profile?.website ?? "";
  const fieldError = (liveForm, name) => {
    let errors = liveForm?.errorFields ?? [];
    return errors.includes(name);
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  {
    {
      if (form) {
        console.log("Form result:", form);
      }
    }
  }
  return `${$$result.head += `<!-- HEAD_svelte-uj7g5q_START -->${$$result.title = `<title>Create Profile</title>`, ""}<!-- HEAD_svelte-uj7g5q_END -->`, ""} <div class="text-center content-center max-w-lg mx-auto min-h-[100vh] mb-12 flex items-center place-content-center"><div class="flex flex-col w-64 lg:w-80"><div><h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-1vtnms7">Create Profile</h1> <form class="form-widget" method="POST" action="/account/api?/updateProfile"><div class="mt-4"><label for="fullName" class="label" data-svelte-h="svelte-g3q01w"><span class="label-text">Name</span></label> <input id="fullName" name="fullName" type="text" placeholder="Your full name" class="${escape(fieldError(form, "fullName") ? "input-error" : "", true) + " mt-1 input input-bordered w-full max-w-xs border-2 border-primary"}"${add_attribute("value", form?.fullName ?? fullName, 0)} required></div> <div class="mt-4"><label for="companyName" class="label" data-svelte-h="svelte-16532ax"><span class="label-text">Company Name</span></label> <input id="companyName" name="companyName" type="text" placeholder="Homewood Farms" class="${escape(fieldError(form, "companyName") ? "input-error" : "", true) + " mt-1 input input-bordered w-full max-w-xs"}"${add_attribute("value", form?.companyName ?? companyName, 0)}></div> <div class="mt-4"><label for="website" class="label" data-svelte-h="svelte-1fqkhyk"><span class="label-text">Company Website</span></label> <input id="website" name="website" type="text" placeholder="Company.com" class="${escape(fieldError(form, "website") ? "input-error" : "", true) + " mt-1 input input-bordered w-full max-w-xs"}"${add_attribute("value", form?.website ?? website, 0)}></div> ${form?.errorMessage ? `<div class="mt-4"></div> <p class="text-red-700 text-sm font-bold text-center mt-3">${escape(form?.errorMessage)}</p>` : ``} <div class="mt-4"><input type="submit" class="btn btn-primary mt-3 btn-wide"${add_attribute("value", "Create Profile", 0)} ${""}></div></form> <div class="text-sm text-slate-800 mt-14">You are logged in as ${escape(session?.user?.email)}.
        <br> <a class="underline" href="/account/sign_out" data-svelte-h="svelte-le6ier">Sign out</a></div></div></div></div>`;
});
export {
  Page as default
};
