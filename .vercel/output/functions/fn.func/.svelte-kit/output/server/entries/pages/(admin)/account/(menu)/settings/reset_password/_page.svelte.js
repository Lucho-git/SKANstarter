import { c as create_ssr_component, j as getContext, v as validate_component } from "../../../../../../../chunks/ssr.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let adminSection = getContext("adminSection");
  adminSection.set("settings");
  return `${$$result.head += `<!-- HEAD_svelte-1w1powp_START -->${$$result.title = `<title>Reset Password</title>`, ""}<!-- HEAD_svelte-1w1powp_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-19ti8ej">Settings</h1> ${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Reset Password",
      editable: true,
      saveButtonTitle: "Reset Password",
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
