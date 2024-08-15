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
        console.log("Updating seats...");
        const session = await getSession()
        if (!session) {
          throw error(401, "Unauthorized")
        }
    
        const formData = await request.formData()
        const newQuantity = parseInt(formData.get('quantity') as string)
        const appliedDate = formData.get('appliedDate') as string
        const promotionCode = 'promo_1PmvAuK3At0l0k1H32XUkuL5'
        // const promotionCode = ''

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
    
          console.log('Updated subscription:', updatedSubscription)
    
          // Update user_subscriptions table
          const { data, error: updateError } = await supabaseServiceRole
            .from('user_subscriptions')
            .update({
              current_seats: newQuantity,
              lingering_seats: isIncrease ? null : primarySubscription.stripeSubscription.quantity - newQuantity,
              next_billing_date: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', session.user.id)
    
          if (updateError) {
            console.error('Error updating user_subscriptions:', updateError)
            throw error(500, "Failed to update user subscription data")
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



      cancelSubscription: async ({ locals: { getSession, supabaseServiceRole } }) => {
        const session = await getSession();
        if (!session) {
          throw error(401, "Unauthorized");
        }
    
        const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session });
        const { primarySubscription } = await fetchSubscription({ customerId });
    
        if (!primarySubscription) {
          throw error(400, "No active subscription found");
        }
    
        try {
          const updatedSubscription = await stripe.subscriptions.update(
            primarySubscription.stripeSubscription.id,
            {
              cancel_at_period_end: true,
            }
          );
    
          return { 
            success: true, 
            message: "Subscription scheduled for cancellation at the end of the billing period.",
            cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end
          };
        } catch (e) {
          console.error("Error cancelling subscription:", e);
          return { 
            success: false, 
            message: "Failed to cancel subscription. Please try again or contact support."
          };
        }
      },


  reverseSubscriptionCancellation: async ({ locals: { getSession, supabaseServiceRole } }) => {
    const session = await getSession();
    if (!session) {
      throw error(401, "Unauthorized");
    }

    const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session });
    const { primarySubscription } = await fetchSubscription({ customerId });

    if (!primarySubscription) {
      throw error(400, "No active subscription found");
    }

    try {
      const updatedSubscription = await stripe.subscriptions.update(
        primarySubscription.stripeSubscription.id,
        {
          cancel_at_period_end: false,
        }
      );

      return { 
        success: true, 
        message: "Subscription cancellation reversed. Your subscription will continue.",
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end
      };
    } catch (e) {
      console.error("Error reversing subscription cancellation:", e);
      return { 
        success: false, 
        message: "Failed to reverse subscription cancellation. Please try again or contact support."
      };
    }
  },

  reverseSubscriptionCancellation: async ({ locals: { getSession, supabaseServiceRole } }) => {
    const session = await getSession();
    if (!session) {
      throw error(401, "Unauthorized");
    }

    const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session });
    const { primarySubscription } = await fetchSubscription({ customerId });

    if (!primarySubscription) {
      throw error(400, "No active subscription found");
    }

    try {
      const updatedSubscription = await stripe.subscriptions.update(
        primarySubscription.stripeSubscription.id,
        {
          cancel_at_period_end: false,
        }
      );

      return { 
        success: true, 
        message: "Subscription cancellation reversed. Your subscription will continue.",
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end
      };
    } catch (e) {
      console.error("Error reversing subscription cancellation:", e);
      return { 
        success: false, 
        message: "Failed to reverse subscription cancellation. Please try again or contact support."
      };
    }
  },

  getProratedSeatsPreview: async ({ request, locals: { getSession, supabaseServiceRole } }) => {
    console.log("Starting getProratedSeatsPreview");
  
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
      console.error(`Error in getProratedSeatsPreview: ${e}`);
      return {
        type: 'error',
        status: 500,
        error: e.message
      };
    }
  },
  
  getIntervalChangePreview: async ({ request, locals: { getSession, supabaseServiceRole } }) => {
    console.log("Starting getIntervalChangePreview");
  
    const session = await getSession()
    if (!session) {
      console.log("No session found");
      throw error(401, "Unauthorized")
    }
  
    const formData = await request.formData()
    const newInterval = formData.get('interval') as 'month' | 'year'
    console.log(`New interval: ${newInterval}`);
  
    const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session })
    const { primarySubscription } = await fetchSubscription({ customerId })
  
    if (!primarySubscription) {
      console.log("No active subscription found");
      throw error(400, "No active subscription found")
    }
  
    const productId = primarySubscription.stripeSubscription.plan.product
    console.log(`Product ID: ${productId}`);
    const currentAnchorDate = new Date(primarySubscription.stripeSubscription.current_period_end * 1000);
  
    try {
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        expand: ['data.tiers']
      });
  
      console.log(`Fetched ${JSON.stringify(prices.data)} prices`);
      console.log('New interval:', newInterval);

      const currentPrice = prices.data.find(price => price.recurring.interval === primarySubscription.stripeSubscription.plan.interval);
      console.log('Current price:', currentPrice);
      const newPrice = prices.data.find(price => price.recurring.interval === newInterval);
      console.log('New price:', newPrice);
      if (!currentPrice || !newPrice) {
        throw error(400, "Unable to find valid prices for the current or new billing cycle");
      }
  
      const prorationPreview = await stripe.invoices.retrieveUpcoming({
        customer: primarySubscription.stripeSubscription.customer,
        subscription: primarySubscription.stripeSubscription.id,
        subscription_items: [
          {
            id: primarySubscription.stripeSubscription.items.data[0].id,
            price: newPrice.id,
          },
        ],
        subscription_proration_behavior: 'none',
        subscription_trial_end: Math.floor(currentAnchorDate.getTime() / 1000),
      });
  
      const quantity = primarySubscription.stripeSubscription.quantity;
  
      const getCurrentPriceAmount = (price) => price.tiers[0].unit_amount;
      const currentPriceAmount = getCurrentPriceAmount(currentPrice);
      const newPriceAmount = getCurrentPriceAmount(newPrice);
  
      const currentMonthlyPrice = currentPrice.recurring.interval === 'year' ? currentPriceAmount / 12 : currentPriceAmount;
      const newMonthlyPrice = newPrice.recurring.interval === 'year' ? newPriceAmount / 12 : newPriceAmount;
  
      const previewData = {
        currentBillingCycle: currentPrice.recurring.interval,
        newBillingCycle: newPrice.recurring.interval,
        currentAnchorDate,
        nextBillingDate: new Date(prorationPreview.lines.data[0].period.start * 1000),
        currentPricePerMonth: (currentMonthlyPrice * quantity) / 100,
        newPricePerMonth: (newMonthlyPrice * quantity) / 100,
        currentPriceWithoutDiscount: (currentPriceAmount * quantity) / 100,
        newPriceWithoutDiscount: (newPriceAmount * quantity) / 100,
        currency: currentPrice.currency,
        quantity,

      };
  
      return {
        type: 'success',
        status: 200,
        data: JSON.stringify(previewData)
      };
    } catch (e) {
      console.error(`Error in getIntervalChangePreview: ${e}`);
      return {
        type: 'error',
        status: 500,
        error: e.message
      };
    }
  },
  
  
  changeInterval: async ({ request, locals: { getSession, supabaseServiceRole } }) => {
    const session = await getSession()
    if (!session) {
      throw error(401, "Unauthorized")
    }
  
    const formData = await request.formData()
    const newInterval = formData.get('interval') as string
    const trialEndTimestamp = parseInt(formData.get('trialEnd') as string)
    const promotionCode = 'promo_1PmvAuK3At0l0k1H32XUkuL5'
  
    const { customerId } = await getOrCreateCustomerId({ supabaseServiceRole, session })
    const { primarySubscription } = await fetchSubscription({ customerId })
  
    if (!primarySubscription) {
      throw error(400, "No active subscription found")
    }
  
    const newPriceId = primarySubscription.appSubscription.stripe_price_id[newInterval]
  
    try {
      const updateParams: Stripe.SubscriptionUpdateParams = {
        items: [{ id: primarySubscription.stripeSubscription.items.data[0].id, price: newPriceId }],
        trial_end: trialEndTimestamp,
        proration_behavior: 'none',
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
  
      console.log('Updated subscription:', updatedSubscription)
  
      // Update user_subscriptions table
      const { data, error: updateError } = await supabaseServiceRole
        .from('user_subscriptions')
        .update({
          payment_interval: newInterval,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
  
      if (updateError) {
        console.error('Error updating user_subscriptions:', updateError)
        throw error(500, "Failed to update user subscription data")
      }
  
      return {
        success: true,
        subscription: updatedSubscription,
        message: "Subscription updated successfully",
        newInterval: newInterval,
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
      console.error("Error updating subscription:", e)
      throw error(500, "Failed to update subscription")
    }
  },
  
  
  


}
