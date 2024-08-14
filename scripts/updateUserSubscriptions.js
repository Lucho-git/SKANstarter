import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PRIVATE_SUPABASE_SERVICE_ROLE)
const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY, { apiVersion: '2023-08-16' })

async function updateUserSubscriptions() {
  const { data: stripeCustomers, error } = await supabase
    .from('stripe_customers')
    .select('user_id, stripe_customer_id')

  if (error) {
    console.error('Error fetching stripe customers:', error)
    return
  }

  for (const customer of stripeCustomers) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.stripe_customer_id,
        status: 'active',
      })

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0]
        const { data, error } = await supabase
          .from('user_subscriptions')
          .update({
            subscription: subscription.plan.nickname || 'PAID',
            current_seats: subscription.quantity,
            next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', customer.user_id)

        if (error) {
          console.error(`Error updating user ${customer.user_id}:`, error)
        } else {
          console.log(`Updated subscription for user ${customer.user_id}`)
        }
      } else {
        console.log(`No active subscription found for user ${customer.user_id}`)
      }
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        console.error(`Stripe error for customer ${customer.stripe_customer_id}:`, error.message)
        if (error.type === 'StripeInvalidRequestError' && error.raw?.code === 'resource_missing') {
          console.log(`Customer ${customer.stripe_customer_id} not found in Stripe. Consider removing from database.`)
        }
      } else {
        console.error(`Unexpected error processing customer ${customer.stripe_customer_id}:`, error)
      }
    }
  }
}

updateUserSubscriptions()
  .then(() => console.log('Finished updating user subscriptions'))
  .catch(console.error)
