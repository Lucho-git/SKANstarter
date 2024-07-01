import { c as create_ssr_component, b as subscribe, j as getContext, v as validate_component, f as escape, d as add_attribute } from "../../../../../../../chunks/ssr.js";
import { p as page } from "../../../../../../../chunks/stores.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let adminSection = getContext("adminSection");
  adminSection.set("settings");
  let { data } = $$props;
  let { session, supabase } = data;
  let hasPassword = session?.user?.amr?.find((x) => x.method === "password") ? true : false;
  let usingOAuth = session?.user?.amr?.find((x) => x.method === "oauth") ? true : false;
  let sendBtn;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-cgsnq8_START -->${$$result.title = `<title>Change Password</title>`, ""}<!-- HEAD_svelte-cgsnq8_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-56i6u3">Change Password</h1> ${hasPassword ? `${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Change Password",
      editable: true,
      saveButtonTitle: "Change Password",
      successTitle: "Password Changed",
      successBody: "On next sign in, use your new password.",
      formTarget: "/account/api?/updatePassword",
      fields: [
        {
          id: "newPassword1",
          label: "New Password",
          initialValue: "",
          inputType: "password"
        },
        {
          id: "newPassword2",
          label: "Confirm New Password",
          initialValue: "",
          inputType: "password"
        },
        {
          id: "currentPassword",
          label: "Current Password",
          initialValue: "",
          inputType: "password"
        }
      ]
    },
    {},
    {}
  )}` : `<div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow max-w-md"><div class="flex flex-col gap-y-4">${usingOAuth ? `<div class="font-bold" data-svelte-h="svelte-e40ftg">Set Password By Email</div> <div data-svelte-h="svelte-kym5a6">You use oAuth to sign in (&quot;Sign in with Github&quot; or similar). You can
          continue to access your account using only oAuth if you like!</div>` : `<div class="font-bold" data-svelte-h="svelte-wb4o62">Change Password By Email</div>`} <div>The button below will send you an email at ${escape(session?.user?.email)} which will
        allow you to set your password.</div> <button class="${"btn btn-outline btn-wide " + escape("", true)}"${add_attribute("this", sendBtn, 0)}>Send Set Password Email</button> <div class="${"success alert alert-success " + escape("hidden", true)}">Sent email! Please check your inbox and use the link to set your
        password.</div></div></div>`}`;
});
export {
  Page as default
};
