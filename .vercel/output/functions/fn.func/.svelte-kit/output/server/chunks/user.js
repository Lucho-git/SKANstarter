import { w as writable } from "./index2.js";
import { s as supabase } from "./supabaseClient.js";
const user = writable(null);
const session = writable(null);
async function getAuthState() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
      user.set(null);
      session.set(null);
      return null;
    } else if (data.session) {
      user.set(data.session.user);
      session.set(data.session);
      return data.session;
    } else {
      user.set(null);
      session.set(null);
      return null;
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    user.set(null);
    session.set(null);
    return null;
  }
}
supabase.auth.onAuthStateChange((event, currentSession) => {
  if (event === "SIGNED_IN" && currentSession) {
    user.set(currentSession.user);
    session.set(currentSession);
  } else if (event === "SIGNED_OUT") {
    user.set(null);
    session.set(null);
  }
});
getAuthState();
export {
  session as s
};
