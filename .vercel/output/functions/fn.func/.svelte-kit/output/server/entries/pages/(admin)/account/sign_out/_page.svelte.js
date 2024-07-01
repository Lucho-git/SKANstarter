import { c as create_ssr_component, f as escape } from "../../../../../chunks/ssr.js";
function client_method(key) {
  {
    if (key === "before_navigate" || key === "after_navigate" || key === "on_navigate") {
      return () => {
      };
    } else {
      const name_lookup = {
        disable_scroll_handling: "disableScrollHandling",
        preload_data: "preloadData",
        preload_code: "preloadCode",
        invalidate_all: "invalidateAll"
      };
      return () => {
        throw new Error(`Cannot call ${name_lookup[key] ?? key}(...) on the server`);
      };
    }
  }
}
const goto = /* @__PURE__ */ client_method("goto");
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let { supabase } = data;
  let message = "Signing out....";
  supabase.auth.signOut().then(({ error }) => {
    if (error) {
      message = "There was an issue signing out.";
    } else {
      goto("/");
    }
  });
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `<h1 class="text-2xl font-bold m-6">${escape(message)}</h1>`;
});
export {
  Page as default
};
