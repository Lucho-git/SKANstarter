import { c as create_ssr_component, j as getContext, v as validate_component } from "../../../../../../chunks/ssr.js";
import { S as Settings_module } from "../../../../../../chunks/settings_module.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let adminSection = getContext("adminSection");
  adminSection.set("settings");
  let { data } = $$props;
  let { session, profile } = data;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `${$$result.head += `<!-- HEAD_svelte-hosjka_START -->${$$result.title = `<title>Settings</title>`, ""}<!-- HEAD_svelte-hosjka_END -->`, ""} <h1 class="text-2xl font-bold mb-6" data-svelte-h="svelte-19ti8ej">Settings</h1> ${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Profile",
      editable: false,
      fields: [
        {
          id: "fullName",
          label: "Name",
          initialValue: profile?.full_name ?? ""
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
      ],
      editButtonTitle: "Edit Profile",
      editLink: "/account/settings/edit_profile"
    },
    {},
    {}
  )} ${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Email",
      editable: false,
      fields: [
        {
          id: "email",
          initialValue: session?.user?.email || ""
        }
      ],
      editButtonTitle: "Change Email",
      editLink: "/account/settings/change_email"
    },
    {},
    {}
  )} ${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Password",
      editable: false,
      fields: [
        {
          id: "password",
          initialValue: "••••••••••••••••"
        }
      ],
      editButtonTitle: "Change Password",
      editLink: "/account/settings/change_password"
    },
    {},
    {}
  )} ${validate_component(Settings_module, "SettingsModule").$$render(
    $$result,
    {
      title: "Danger Zone",
      editable: false,
      dangerous: true,
      fields: [],
      editButtonTitle: "Delete Account",
      editLink: "/account/settings/delete_account"
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
