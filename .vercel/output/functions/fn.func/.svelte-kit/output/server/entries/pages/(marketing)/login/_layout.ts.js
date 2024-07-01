import { a as PUBLIC_SUPABASE_URL, b as PUBLIC_SUPABASE_ANON_KEY } from "../../../../chunks/public.js";
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit";
const load = async ({ fetch, data, depends }) => {
  depends("supabase:auth");
  const supabase = createSupabaseLoadClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session
  });
  const url = data.url;
  return { supabase, url };
};
export {
  load
};
