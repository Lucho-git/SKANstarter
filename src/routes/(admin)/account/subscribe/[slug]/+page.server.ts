import { redirect, error } from "@sveltejs/kit"
import {
  getOrCreateCustomerId,
  fetchSubscription,
} from "../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"
import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
import Stripe from "stripe"
const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })

export const load: PageServerLoad = async ({
  params,
  url,
  locals: { getSession, supabaseServiceRole },
}) => {
  const session = await getSession()
  if (!session) {
    throw redirect(303, "/login")
  }

  if (params.slug === "free_plan") {
    // plan with no stripe_price_id. Redirect to account home
    throw redirect(303, "/account")
  }

  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    session,
  })
  if (idError || !customerId) {
    throw error(500, {
      message: "Unknown error. If issue persists, please contact us.",
    })
  }

  const { primarySubscription } = await fetchSubscription({
    customerId,
  })
  if (primarySubscription) {
    // User already has plan, we shouldn't let them buy another
    throw redirect(303, "/account/billing")
  }

  let checkoutUrl
  try {
    const stripeSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: params.slug,
          quantity: 1,
        },
      ],
      customer: customerId,
      mode: "subscription",
      success_url: `${url.origin}/account`,
      cancel_url: `${url.origin}/account/billing`,
      consent_collection: {
        terms_of_service: 'required',
      },
    })
    checkoutUrl = stripeSession.url
  } catch (err) {
    console.error("Error creating Stripe Checkout session:", err)
    
    // Log the error details
    console.error("Error message:", err.message)
    console.error("Error stack trace:", err.stack)
    
    // Check if the error is a Stripe-specific error
    if (err.type === 'StripeError') {
      console.error("Stripe error details:")
      console.error("  Type:", err.type)
      console.error("  Code:", err.code)
      console.error("  Param:", err.param)
      console.error("  Docs:", err.docs)
    }
    
    throw error(
      500,
      "An error occurred while creating the Stripe Checkout session. Please check the server logs for more details.",
    )
  }

  throw redirect(303, checkoutUrl ?? "/pricing")
}
