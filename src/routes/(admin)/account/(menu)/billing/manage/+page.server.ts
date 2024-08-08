import { redirect, error } from "@sveltejs/kit"
import { getOrCreateCustomerId, fetchSubscription } from "../../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"
import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
import Stripe from "stripe"

const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })

export const load: PageServerLoad = async ({
  locals: { getSession, supabaseServiceRole },
}) => {
  const session = await getSession()
  if (!session) {
    throw redirect(303, "/login")
  }

  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    session,
  })
  if (idError || !customerId) {
    throw error(500, {
      message: "Unknown error (PCID). If issue persists, please contact us.",
    })
  }

  const { primarySubscription, error: subError } = await fetchSubscription({ customerId })

  if (subError) {
    throw error(500, {
      message: "Error fetching subscription. If issue persists, please contact us.",
    })
  }

  if (!primarySubscription) {
    throw redirect(303, "/account/billing")
  }

  return {
    subscriptionData: primarySubscription,
  }
}

export const actions = {
  updateSeats: async ({ request, locals: { getSession, supabaseServiceRole } }) => {
    const session = await getSession()
    if (!session) {
      throw error(401, "Unauthorized")
    }

    const formData = await request.formData()
    const newQuantity = parseInt(formData.get('quantity') as string)

    const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session })
    const { primarySubscription } = await fetchSubscription({ customerId })

    if (!primarySubscription) {
      throw error(400, "No active subscription found")
    }

    try {
      await stripe.subscriptions.update(primarySubscription.stripeSubscription.id, {
        quantity: newQuantity,
      })
      return { success: true }
    } catch (e) {
      throw error(500, "Failed to update subscription")
    }
  },

  changePlan: async ({ request, locals: { getSession, supabaseServiceRole } }) => {
    const session = await getSession()
    if (!session) {
      throw error(401, "Unauthorized")
    }

    const formData = await request.formData()
    const newInterval = formData.get('interval') as string

    const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session })
    const { primarySubscription } = await fetchSubscription({ customerId })

    if (!primarySubscription) {
      throw error(400, "No active subscription found")
    }

    const newPriceId = primarySubscription.appSubscription.stripe_price_id[newInterval]

    try {
      await stripe.subscriptions.update(primarySubscription.stripeSubscription.id, {
        items: [{ id: primarySubscription.stripeSubscription.items.data[0].id, price: newPriceId }],
      })
      return { success: true }
    } catch (e) {
      throw error(500, "Failed to update subscription")
    }
  },

  cancelSubscription: async ({ locals: { getSession, supabaseServiceRole } }) => {
    const session = await getSession()
    if (!session) {
      throw error(401, "Unauthorized")
    }

    const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session })
    const { primarySubscription } = await fetchSubscription({ customerId })

    if (!primarySubscription) {
      throw error(400, "No active subscription found")
    }

    try {
      await stripe.subscriptions.del(primarySubscription.stripeSubscription.id)
      return { success: true }
    } catch (e) {
      throw error(500, "Failed to cancel subscription")
    }
  },
}
