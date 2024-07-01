import { c as create_ssr_component, b as subscribe, f as escape, d as add_attribute, e as each } from "./ssr.js";
import "devalue";
import { p as page } from "./stores.js";
const Settings_module = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const fieldError = (liveForm, name) => {
    let errors = liveForm?.errorFields ?? [];
    return errors.includes(name);
  };
  let { editable = false } = $$props;
  let { dangerous = false } = $$props;
  let { title = "" } = $$props;
  let { message = "" } = $$props;
  let { fields } = $$props;
  let { formTarget = "" } = $$props;
  let { successTitle = "Success" } = $$props;
  let { successBody = "" } = $$props;
  let { editButtonTitle = "" } = $$props;
  let { editLink = "" } = $$props;
  let { saveButtonTitle = "Save" } = $$props;
  if ($$props.editable === void 0 && $$bindings.editable && editable !== void 0)
    $$bindings.editable(editable);
  if ($$props.dangerous === void 0 && $$bindings.dangerous && dangerous !== void 0)
    $$bindings.dangerous(dangerous);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.message === void 0 && $$bindings.message && message !== void 0)
    $$bindings.message(message);
  if ($$props.fields === void 0 && $$bindings.fields && fields !== void 0)
    $$bindings.fields(fields);
  if ($$props.formTarget === void 0 && $$bindings.formTarget && formTarget !== void 0)
    $$bindings.formTarget(formTarget);
  if ($$props.successTitle === void 0 && $$bindings.successTitle && successTitle !== void 0)
    $$bindings.successTitle(successTitle);
  if ($$props.successBody === void 0 && $$bindings.successBody && successBody !== void 0)
    $$bindings.successBody(successBody);
  if ($$props.editButtonTitle === void 0 && $$bindings.editButtonTitle && editButtonTitle !== void 0)
    $$bindings.editButtonTitle(editButtonTitle);
  if ($$props.editLink === void 0 && $$bindings.editLink && editLink !== void 0)
    $$bindings.editLink(editLink);
  if ($$props.saveButtonTitle === void 0 && $$bindings.saveButtonTitle && saveButtonTitle !== void 0)
    $$bindings.saveButtonTitle(saveButtonTitle);
  $$unsubscribe_page();
  return `<div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow">${title ? `<div class="text-xl font-bold mb-3 w-48 flex-none">${escape(title)}</div>` : ``} <div class="w-full min-w-48">${`${message ? `<div class="${"mb-6 " + escape(dangerous ? "alert alert-warning" : "", true)}">${dangerous ? `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>` : ``} <span>${escape(message)}</span></div>` : ``} <form class="form-widget flex flex-col" method="POST"${add_attribute("action", formTarget, 0)}>${each(fields, (field) => {
    return `${field.label ? `<label${add_attribute("for", field.id, 0)}><span class="text-sm text-gray-500">${escape(field.label)}</span> </label>` : ``} ${editable ? `<input${add_attribute("id", field.id, 0)}${add_attribute("name", field.id, 0)}${add_attribute("type", field.inputType ?? "text", 0)} ${!editable ? "disabled" : ""}${add_attribute("placeholder", field.placeholder ?? field.label ?? "", 0)} class="${escape(fieldError($page?.form, field.id) ? "input-error" : "", true) + " input-sm mt-1 input input-bordered w-full max-w-xs mb-3 text-base py-4"}"${add_attribute("value", $page.form ? $page.form[field.id] : field.initialValue, 0)}>` : `<div class="text-lg mb-3">${escape(field.initialValue)}</div>`}`;
  })} ${$page?.form?.errorMessage ? `<p class="text-red-700 text-sm font-bold mt-1">${escape($page?.form?.errorMessage)}</p>` : ``} ${editable ? `<div><button type="submit" class="${"ml-auto btn btn-sm mt-3 min-w-[145px] " + escape(dangerous ? "btn-error" : "btn-success", true)}" ${""}>${`${escape(saveButtonTitle)}`}</button></div>` : ` <a${add_attribute("href", editLink, 0)} class="mt-1"><button class="${"btn btn-outline btn-sm " + escape(dangerous ? "btn-error" : "", true) + " min-w-[145px]"}">${escape(editButtonTitle)}</button></a>`}</form>`}</div></div>`;
});
export {
  Settings_module as S
};
