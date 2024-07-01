import { c as create_ssr_component, j as getContext, v as validate_component } from "../../../../../../../chunks/ssr.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let adminSection = getContext("adminSection");
  adminSection.set("settings");
  let { data } = $$props;
  let { session } = data;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `${$$result.head += `<!-- HEAD_svelte-7jomat_START -->${$$result.title = `<title>Delete Account</title>`, ""}<!-- HEAD_svelte-7jomat_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-19ti8ej">Settings</h1> ${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Delete Account",
      editable: true,
      dangerous: true,
      message: "Deleting your account can not be undone. You are currently logged in as '" + session?.user?.email + "'",
      saveButtonTitle: "Delete Account",
      successTitle: "Account queued for deletion",
      successBody: "Your account will be deleted shortly.",
      formTarget: "/account/api?/deleteAccount",
      fields: [
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
  )}`;
});
export {
  Page as default
};
