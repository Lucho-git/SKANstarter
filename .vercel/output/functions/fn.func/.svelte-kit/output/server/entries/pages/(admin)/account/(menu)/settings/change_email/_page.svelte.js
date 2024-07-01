import { c as create_ssr_component, j as getContext, v as validate_component } from "../../../../../../../chunks/ssr.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let adminSection = getContext("adminSection");
  adminSection.set("settings");
  let { data } = $$props;
  let { session } = data;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `${$$result.head += `<!-- HEAD_svelte-oxf6bt_START -->${$$result.title = `<title>Change Email</title>`, ""}<!-- HEAD_svelte-oxf6bt_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-19ti8ej">Settings</h1> ${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Change Email",
      editable: true,
      successTitle: "Email change initiated",
      successBody: "You should recieve emails at both the old and new address to confirm the change. Please click the link in both emails to finalized the change. Until finalized, you must sign in with your current email.",
      formTarget: "/account/api?/updateEmail",
      fields: [
        {
          id: "email",
          label: "Email",
          initialValue: session?.user?.email ?? "",
          placeholder: "Email address"
        }
      ]
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
