import { a as PUBLIC_SUPABASE_URL, b as PUBLIC_SUPABASE_ANON_KEY } from "./public.js";
import { b as PRIVATE_SUPABASE_SERVICE_ROLE } from "./private.js";
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit";
import { createClient } from "@supabase/supabase-js";
import { v4 } from "uuid";
async function getUserFullName(supabase, userId) {
  if (!userId)
    return null;
  const { data, error } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
  if (error) {
    console.error("Error fetching user full name:", error);
    return null;
  }
  return data?.full_name;
}
async function logErrorToDatabase(supabase, errorDetails, errorId) {
  try {
    const { error } = await supabase.from("error_logs").insert({
      id: errorId,
      user_id: errorDetails.userId,
      full_name: errorDetails.userFullName,
      url: errorDetails.url,
      status: errorDetails.status,
      timestamp: errorDetails.timestamp,
      error_details: {
        method: errorDetails.method,
        headers: errorDetails.headers,
        userAgent: errorDetails.userAgent,
        referer: errorDetails.referer,
        route: errorDetails.route,
        message: errorDetails.message,
        stack: errorDetails.stack,
        details: errorDetails.details
      }
    });
    if (error) {
      console.error("Failed to log error to database:", error);
    } else {
      console.log("Error logged to database successfully:", errorId);
    }
  } catch (logError) {
    console.error("Error while logging to database:", logError);
  }
}
const handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event,
    cookieOptions: {
      domain: "skanfarming.com.au",
      secure: true,
      sameSite: "lax",
      path: "/"
    }
  });
  event.locals.supabaseServiceRole = createClient(
    PUBLIC_SUPABASE_URL,
    PRIVATE_SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } }
  );
  event.locals.getSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();
    return session;
  };
  try {
    const response = await resolve(event);
    if (response.status === 404) {
      const session = await event.locals.getSession();
      const errorId = v4();
      const userId = session?.user?.id;
      const userFullName = await getUserFullName(event.locals.supabaseServiceRole, userId);
      const errorDetails = {
        id: errorId,
        status: 404,
        url: event.url.toString(),
        method: event.request.method,
        headers: Object.fromEntries(event.request.headers),
        userAgent: event.request.headers.get("user-agent"),
        referer: event.request.headers.get("referer"),
        userId,
        userFullName,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        route: event.route?.id
      };
      console.error("404 Error:", errorDetails);
      await logErrorToDatabase(event.locals.supabaseServiceRole, errorDetails, errorId);
    }
    return response;
  } catch (error) {
    throw error;
  }
};
const handleError = async ({ error, event }) => {
  const errorId = v4();
  const session = await event.locals.getSession();
  const userId = session?.user?.id;
  const userFullName = await getUserFullName(event.locals.supabaseServiceRole, userId);
  const errorDetails = {
    id: errorId,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : void 0,
    status: error.status || 500,
    url: event.url.toString(),
    route: event.route?.id,
    details: error.toString(),
    method: event.request.method,
    headers: Object.fromEntries(event.request.headers),
    userAgent: event.request.headers.get("user-agent"),
    referer: event.request.headers.get("referer"),
    userId,
    userFullName,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  console.error("Detailed error:", errorDetails);
  await logErrorToDatabase(event.locals.supabaseServiceRole, errorDetails, errorId);
  return {
    message: "An error occurred. Our team has been notified.",
    errorId
  };
};
export {
  handle,
  handleError
};
