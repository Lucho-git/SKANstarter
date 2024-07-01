import { _hasSurveyCompleted } from "../_layout.ts.js";
import { r as redirect } from "../../../../../chunks/index.js";
async function load({ parent }) {
  const data = await parent();
  if (_hasSurveyCompleted(data?.profile)) {
    throw redirect(303, "/account/select_plan");
  }
  return data;
}
export {
  load
};
