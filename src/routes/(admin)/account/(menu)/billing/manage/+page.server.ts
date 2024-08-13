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

  const subscription = await stripe.subscriptions.retrieve(primarySubscription.stripeSubscription.id, {
    expand: ['items.data.price']
  });

  const priceId = subscription.items.data[0].price.id;
  const priceWithTiers = await stripe.prices.retrieve(priceId, {
    expand: ['tiers']
  });

  const currentQuantity = subscription.items.data[0].quantity;
  const currency = subscription.currency;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  return {
    subscriptionData: primarySubscription,
    seatManagementInfo: {
      currentQuantity,
      currency,
      currentPeriodEnd,
      priceWithTiers,
    }
  };
}

//Actual seat update function, applies real money changes to a users plan, takes in the number of seats and now or later date to decide the proration behaviours
//Now proration immediately charges the user for increasing their seats, later modifies the number of seats which will only be applied at the next billing cycle to stop abuse of the system
export const actions = {
    updateSeats: async ({ request, locals: { getSession, supabaseServiceRole } }) => {
        const session = await getSession()
        if (!session) {
          throw error(401, "Unauthorized")
        }
      
        const formData = await request.formData()
        const newQuantity = parseInt(formData.get('quantity') as string)
        const appliedDate = formData.get('appliedDate') as string
        const promotionCode = 'promo_1PmvAuK3At0l0k1H32XUkuL5'
      
        const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session })
        const { primarySubscription } = await fetchSubscription({ customerId })
      
        if (!primarySubscription) {
          throw error(400, "No active subscription found")
        }
      
        try {
          const isIncrease = appliedDate === 'now'
          const updateParams: Stripe.SubscriptionUpdateParams = {
            items: [{
              id: primarySubscription.stripeSubscription.items.data[0].id,
              quantity: newQuantity,
            }],
            proration_behavior: isIncrease ? 'always_invoice' : 'none',
          }
      
          if (!isIncrease) {
            updateParams.billing_cycle_anchor = 'unchanged'
          }
      
          if (promotionCode) {
            const promotion = await stripe.promotionCodes.retrieve(promotionCode)
            if (promotion.coupon) {
              updateParams.coupon = promotion.coupon.id
            }
          }
      
          const updatedSubscription = await stripe.subscriptions.update(
            primarySubscription.stripeSubscription.id,
            updateParams
          )
      
          if (isIncrease) {
            await stripe.invoices.pay(updatedSubscription.latest_invoice as string)
          }
      
          return {
            success: true,
            subscription: updatedSubscription,
            message: "Subscription updated successfully",
            newQuantity: newQuantity,
            appliedDate: appliedDate,
            discountApplied: !!updateParams.coupon
          }
        } catch (e) {
          if (e instanceof Stripe.errors.StripeError) {
            return {
              success: false,
              error: e.message,
              code: e.code,
              type: e.type
            }
          }
          throw error(500, "Failed to update subscription")
        }
      }
      
      
      ,

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

  getProratedChangePreview: async ({ request, locals: { getSession, supabaseServiceRole } }) => {
    console.log("Starting getProratedChangePreview");
  
    const session = await getSession()
    if (!session) {
      console.log("No session found");
      throw error(401, "Unauthorized")
    }
  
    const formData = await request.formData()
    const newQuantity = parseInt(formData.get('quantity') as string)
    const appliedDate = formData.get('appliedDate') as string
    console.log(`New quantity: ${newQuantity}, Applied Date: ${appliedDate}`);
  
    const { customerId, error: customerError } = await getOrCreateCustomerId({ supabaseServiceRole, session })
    if (customerError) {
      console.log(`Error getting customer ID: ${customerError}`);
      throw error(500, "Failed to get customer ID")
    }
  
    const { primarySubscription, error: subscriptionError } = await fetchSubscription({ customerId })
    if (subscriptionError || !primarySubscription) {
      console.log(`Error fetching subscription: ${subscriptionError}`);
      throw error(400, "No active subscription found")
    }
  
    try {
      const subscription = await stripe.subscriptions.retrieve(primarySubscription.stripeSubscription.id, {
        expand: ['items.data.price']
      });
  
      const prorationPreview = await stripe.invoices.retrieveUpcoming({
        customer: subscription.customer,
        subscription: subscription.id,
        subscription_items: [
          {
            id: subscription.items.data[0].id,
            quantity: newQuantity,
          },
        ],
        subscription_proration_behavior: appliedDate === 'now' ? 'create_prorations' : 'create_prorations',
      });
  
      const dataArray = [
        { success: true, prorationPreview: true },
        true,
        prorationPreview
      ];
  
      return {
        type: 'success',
        status: 200,
        data: JSON.stringify(dataArray)
      };
    } catch (e) {
      console.error(`Error in getProratedChangePreview: ${e}`);
      return {
        type: 'error',
        status: 500,
        error: e.message
      };
    }
  },
  
  

}
