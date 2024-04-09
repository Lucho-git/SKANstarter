import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "$env/static/public"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import type { Database } from "../../../DatabaseDefinitions.js"
import { redirect } from "@sveltejs/kit"

export const load = async ({ fetch, data, depends, url }) => {
  depends("supabase:auth")

  const supabase = createSupabaseLoadClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const profile: Database["public"]["Tables"]["profiles"]["Row"] | null =
    data.profile;

    const createProfilePath = "/account/create_profile";
    const userSurveyPath = "/account/user_survey";
    const selectPlanPath = "/account/select_plan";
    const dashboard = "/account";
  
    // Check if profile is incomplete and redirect to create profile page
    if (
      profile &&
      !_hasFullProfile(profile) &&
      url.pathname !== createProfilePath
    ) {
      throw redirect(303, createProfilePath);
    }
  
    // Check if profile is complete but survey is incomplete and redirect to survey page
    if (
      profile &&
      _hasFullProfile(profile) &&
      !_hasSurveyCompleted(profile) &&
      url.pathname !== userSurveyPath &&
      url.pathname !== selectPlanPath
    ) {
        console.log('Redict to survey')
      throw redirect(303, userSurveyPath);
    }
  
    return { supabase, session, profile };
  };



//Required Fields
export const _hasFullProfile = (
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null,
) => {
  if (!profile) {
    return false
  }
  if (!profile.full_name) {
    return false
  }
//   if (!profile.company_name) {
//     return false
//   }

  return true
}


export const _hasSurveyCompleted = (
    profile: Database["public"]["Tables"]["profiles"]["Row"] | null,
  ) => {
    if (!profile) {
      return false;
    }
    if (!profile.survey_completed) {
      return false;
    }
  
    return true;
  };