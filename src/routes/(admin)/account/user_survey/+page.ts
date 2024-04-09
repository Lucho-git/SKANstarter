import { _hasSurveyCompleted } from "../+layout.js";
import { redirect } from "@sveltejs/kit";

export async function load({ parent }) {
  const data = await parent();

  // Check if the survey is completed
  if (_hasSurveyCompleted(data?.profile)) {
    // Redirect to the "Select a Plan" page
    throw redirect(303, "/account/select_plan");
  }

  return data;
}