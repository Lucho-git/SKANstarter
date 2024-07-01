import { c as create_ssr_component, j as getContext, v as validate_component } from "../../../../../../../chunks/ssr.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let adminSection = getContext("adminSection");
  adminSection.set("settings");
  let { data } = $$props;
  let { profile } = data;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `${$$result.head += `<!-- HEAD_svelte-ewap0i_START -->${$$result.title = `<title>Edit Profile</title>`, ""}<!-- HEAD_svelte-ewap0i_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-19ti8ej">Settings</h1> ${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      editable: true,
      title: "Edit Profile",
      successTitle: "Saved Profile",
      formTarget: "/account/api?/updateProfile",
      fields: [
        {
          id: "fullName",
          label: "Name",
          initialValue: profile?.full_name ?? "",
          placeholder: "Your full name"
        },
        {
          id: "companyName",
          label: "Company Name",
          initialValue: profile?.company_name ?? ""
        },
        {
          id: "website",
          label: "Company Website",
          initialValue: profile?.website ?? ""
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
