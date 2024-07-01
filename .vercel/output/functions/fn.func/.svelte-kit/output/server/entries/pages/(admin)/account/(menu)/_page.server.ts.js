import { r as redirect } from "../../../../../chunks/index.js";
const actions = {
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (session) {
      await supabase.auth.signOut();
      throw redirect(303, "/");
    }
  }
};
export {
  actions
};
