import { r as redirect, e as error } from "../../../../../../chunks/index.js";
import { g as getOrCreateCustomerId, f as fetchSubscription } from "../../../../../../chunks/subscription_helpers.server.js";
import { a as PRIVATE_STRIPE_API_KEY } from "../../../../../../chunks/private.js";
import Stripe from "stripe";
const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" });
const load = async ({
  params,
  url,
  locals: { getSession, supabaseServiceRole }
}) => {
  const session = await getSession();
  if (!session) {
    throw redirect(303, "/login");
  }
  if (params.slug === "free_plan") {
    throw redirect(303, "/account");
  }
  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    session
  });
  if (idError || !customerId) {
    throw error(500, {
      message: "Unknown error. If issue persists, please contact us."
    });
  }
  const { primarySubscription } = await fetchSubscription({
    customerId
  });
  if (primarySubscription) {
    throw redirect(303, "/account/billing");
  }
  let checkoutUrl;
  try {
    const isOneTimePayment = params.slug === "price_1Oy7FOK3At0l0k1HrMFJ1gcc";
    const stripeSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: params.slug,
          quantity: 1
        }
      ],
      customer: customerId,
      mode: isOneTimePayment ? "payment" : "subscription",
      success_url: `${url.origin}/account`,
      cancel_url: `${url.origin}/account/billing`,
      consent_collection: {
        terms_of_service: "required"
      }
    });
    checkoutUrl = stripeSession.url;
  } catch (e) {
    throw error(
      500,
      "Unknown Error (SSE): If issue persists please contact us."
    );
  }
  throw redirect(303, checkoutUrl ?? "/pricing");
};
export {
  load
};
