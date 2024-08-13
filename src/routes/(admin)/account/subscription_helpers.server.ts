import type { SupabaseClient, Session } from "@supabase/supabase-js"
import type { Database } from "../../../DatabaseDefinitions"

import { pricingPlans } from "../../(marketing)/pricing/pricing_plans"
import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
import Stripe from "stripe"
const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })

export const getOrCreateCustomerId = async ({
    supabaseServiceRole,
    session,
  }: {
    supabaseServiceRole: SupabaseClient<Database>
    session: Session
  }) => {
    console.log("Attempting to retrieve customer ID for user:", session.user.id);
  
    const { data: dbCustomer, error } = await supabaseServiceRole
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", session.user.id)
      .single()
  
    console.log("Database query result:", { dbCustomer, error });
  
    if (error && error.code != "PGRST116") {
      console.error("Error retrieving customer ID:", error);
      return { error: error }
    }
  
    if (dbCustomer?.stripe_customer_id) {
      console.log("Existing customer ID found:", dbCustomer.stripe_customer_id);
      return { customerId: dbCustomer.stripe_customer_id }
    }
  
    console.log("No existing customer ID found. Creating new customer.");
  
    // Fetch data needed to create customer
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from("profiles")
      .select(`full_name, website, company_name`)
      .eq("id", session.user.id)
      .single()
  
    console.log("Profile data:", { profile, profileError });
  
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return { error: profileError }
    }
  
    // Create a stripe customer
    let customer
    try {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: profile.full_name ?? "",
        metadata: {
          user_id: session.user.id,
          company_name: profile.company_name ?? "",
          website: profile.website ?? "",
        },
      })
      console.log("New Stripe customer created:", customer.id);
    } catch (e) {
      console.error("Error creating Stripe customer:", e);
      return { error: e }
    }
  
    if (!customer.id) {
        console.error("Unknown stripe user creation error");
        return { error: "Unknown stripe user creation error" }
      }
    
      // Insert the new Stripe customer
      const { error: stripeCustomerError } = await supabaseServiceRole
        .from("stripe_customers")
        .insert({
          user_id: session.user.id,
          stripe_customer_id: customer.id,
          updated_at: new Date(),
        })
    
      if (stripeCustomerError) {
        console.error("Error inserting new customer ID:", stripeCustomerError);
        return { error: stripeCustomerError }
      }
    
    //   // Create or update the user_subscription entry
    //   const { error: userSubscriptionError } = await supabaseServiceRole
    //     .from("user_subscriptions")
    //     .upsert({
    //       user_id: session.user.id,
    //       subscription: 'FREE',
    //       current_seats: 1,
    //       updated_at: new Date()
    //     }, {
    //       onConflict: 'user_id'
    //     })
    
    //   if (userSubscriptionError) {
    //     console.error("Error upserting user subscription:", userSubscriptionError);
    //     return { error: userSubscriptionError }
    //   }
    
    //   console.log("Successfully created and stored new customer ID and user subscription:", customer.id);
    //   return { customerId: customer.id }
    }
  

export const fetchSubscription = async ({
  customerId,
}: {
  customerId: string
}) => {
  // Fetch user's subscriptions
  let stripeSubscriptions
  try {
    stripeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
      status: "all",
    })
  } catch (e) {
    return { error: e }
  }

  // find "primary". The user may have several old ones, we want an active one (including trials, and past_due in grace period).
  const primaryStripeSubscription = stripeSubscriptions.data.find((x) => {
    return (
      x.status === "active" ||
      x.status === "trialing" ||
      x.status === "past_due"
    )
  })
  let appSubscription = null
  if (primaryStripeSubscription) {
    const productId =
      primaryStripeSubscription?.items?.data?.[0]?.price.product ?? ""
    appSubscription = pricingPlans.find((x) => {
      return x.stripe_product_id === productId
    })
    if (!appSubscription) {
      return {
        error:
          "Stripe subscription does not have matching app subscription in pricing_plans.ts (via product id match)",
      }
    }
  }
  let primarySubscription = null
  if (primaryStripeSubscription && appSubscription) {
    primarySubscription = {
      stripeSubscription: primaryStripeSubscription,
      appSubscription: appSubscription,
    }
  }

  const hasEverHadSubscription = stripeSubscriptions.data.length > 0

  return {
    primarySubscription,
    hasEverHadSubscription,
  }
}
