import { r as redirect } from "../../../../chunks/index.js";
const load = async ({
  locals: { supabase, getSession }
}) => {
  const session = await getSession();
  if (!session) {
    throw redirect(303, "/login");
  }
  const { data: profile } = await supabase.from("profiles").select(`*`).eq("id", session.user.id).single();
  return { session, profile };
};
export {
  load
};
