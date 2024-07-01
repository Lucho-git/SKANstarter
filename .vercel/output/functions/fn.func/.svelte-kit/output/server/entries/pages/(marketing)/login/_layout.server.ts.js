import { r as redirect } from "../../../../chunks/index.js";
const load = async ({
  url,
  locals: { getSession }
}) => {
  const session = await getSession();
  if (session) {
    throw redirect(303, "/account");
  }
  return {
    session,
    url: url.origin
  };
};
export {
  load
};
