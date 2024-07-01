import { a as PUBLIC_SUPABASE_URL, b as PUBLIC_SUPABASE_ANON_KEY } from "../../../../chunks/public.js";
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit";
import { r as redirect } from "../../../../chunks/index.js";
const load = async ({ fetch, data, depends, url }) => {
  depends("supabase:auth");
  const supabase = createSupabaseLoadClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session
  });
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const profile = data.profile;
  const createProfilePath = "/account/create_profile";
  const userSurveyPath = "/account/user_survey";
  const selectPlanPath = "/account/select_plan";
  if (profile && !_hasFullProfile(profile) && url.pathname !== createProfilePath) {
    throw redirect(303, createProfilePath);
  }
  if (profile && _hasFullProfile(profile) && !_hasSurveyCompleted(profile) && url.pathname !== userSurveyPath && url.pathname !== selectPlanPath) {
    console.log("Redict to survey");
    throw redirect(303, userSurveyPath);
  }
  return { supabase, session, profile };
};
const _hasFullProfile = (profile) => {
  if (!profile) {
    return false;
  }
  if (!profile.full_name) {
    return false;
  }
  return true;
};
const _hasSurveyCompleted = (profile) => {
  if (!profile) {
    return false;
  }
  if (!profile.survey_completed) {
    return false;
  }
  return true;
};
export {
  _hasFullProfile,
  _hasSurveyCompleted,
  load
};
