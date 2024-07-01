import { r as redirect, e as error } from "../../../../../../../chunks/index.js";
import { g as getOrCreateCustomerId } from "../../../../../../../chunks/subscription_helpers.server.js";
import { a as PRIVATE_STRIPE_API_KEY } from "../../../../../../../chunks/private.js";
import Stripe from "stripe";
const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" });
const load = async ({
  url,
  locals: { getSession, supabaseServiceRole }
}) => {
  const session = await getSession();
  if (!session) {
    throw redirect(303, "/login");
  }
  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    session
  });
  if (idError || !customerId) {
    throw error(500, {
      message: "Unknown error (PCID). If issue persists, please contact us."
    });
  }
  let portalLink;
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${url.origin}/account/billing`
    });
    portalLink = portalSession?.url;
  } catch (e) {
    throw error(
      500,
      "Unknown error (PSE). If issue persists, please contact us."
    );
  }
  throw redirect(303, portalLink ?? "/account/billing");
};
export {
  load
};
