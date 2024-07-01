import { _hasFullProfile } from "../_layout.ts.js";
import { r as redirect } from "../../../../../chunks/index.js";
async function load({ parent }) {
  const data = await parent();
  if (_hasFullProfile(data?.profile)) {
    throw redirect(303, "/account/user_survey");
  }
  return data;
}
export {
  load
};
