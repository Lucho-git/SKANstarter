import { c as create_ssr_component, e as each, f as escape, d as add_attribute } from "../../../../chunks/ssr.js";
import "devalue";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let errors = {};
  const formFields = [
    {
      id: "first_name",
      label: "First Name *",
      inputType: "text",
      autocomplete: "given-name"
    },
    {
      id: "last_name",
      label: "Last Name *",
      inputType: "text",
      autocomplete: "family-name"
    },
    {
      id: "email",
      label: "Email *",
      inputType: "email",
      autocomplete: "email"
    },
    {
      id: "phone",
      label: "Phone Number",
      inputType: "tel",
      autocomplete: "tel"
    },
    {
      id: "company",
      label: "Company Name",
      inputType: "text",
      autocomplete: "organization"
    },
    {
      id: "message",
      label: "Message",
      inputType: "textarea",
      autocomplete: "off"
    }
  ];
  return `<div class="flex flex-col lg:flex-row mx-auto my-4 min-h-[70vh] place-items-center lg:place-items-start place-content-center"><div class="max-w-[400px] lg:max-w-[500px] flex flex-col place-content-center p-4 lg:mr-8 lg:mb-8 lg:min-h-[70vh]" data-svelte-h="svelte-pb3b61"><div class="px-6"><h1 class="text-2xl lg:text-4xl font-bold mb-4">Contact Us</h1> <p class="text-lg">Talk to one of our service professionals to:</p> <ul class="list-disc list-outside pl-6 py-4 space-y-1"><li class="">Get a live demo</li> <li class="">Discuss your specific needs</li> <li>Get a quote</li> <li>Answer any technical questions you have</li></ul> <p>Once you complete the form, we&#39;ll reach out to you! *</p> <p class="text-sm pt-8">*Not really for this demo page, but you should say something like that
        😉</p></div></div> <div class="flex flex-col flex-grow m-4 lg:ml-10 min-w-[300px] stdphone:min-w-[360px] max-w-[400px] place-content-center lg:min-h-[70vh]">${`<div class="card card-bordered shadow-lg p-4 pt-6 mx-2 lg:mx-0 lg:p-6"><form class="form-widget flex flex-col" method="POST" action="?/submitContactUs">${each(formFields, (field) => {
    return `<label${add_attribute("for", field.id, 0)}><div class="flex flex-row"><div class="text-base font-bold">${escape(field.label)}</div> ${errors[field.id] ? `<div class="text-red-600 flex-grow text-sm ml-2 text-right">${escape(errors[field.id])} </div>` : ``}</div> ${field.inputType === "textarea" ? `<textarea${add_attribute("id", field.id, 0)}${add_attribute("name", field.id, 0)}${add_attribute("autocomplete", field.autocomplete, 0)}${add_attribute("rows", 4, 0)} class="${escape(errors[field.id] ? "input-error" : "", true) + " h-24 input-sm mt-1 input input-bordered w-full mb-3 text-base py-4"}"></textarea>` : `<input${add_attribute("id", field.id, 0)}${add_attribute("name", field.id, 0)}${add_attribute("type", field.inputType, 0)}${add_attribute("autocomplete", field.autocomplete, 0)} class="${escape(errors[field.id] ? "input-error" : "", true) + " input-sm mt-1 input input-bordered w-full mb-3 text-base py-4"}">`} </label>`;
  })} ${Object.keys(errors).length > 0 ? `<p class="text-red-600 text-sm mb-2" data-svelte-h="svelte-13reg1k">Please resolve above issues.</p>` : ``} <button class="${"btn btn-primary " + escape("", true)}">${escape("Submit")}</button></form></div>`}</div></div>`;
});
export {
  Page as default
};
