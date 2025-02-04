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

    if (error && error.code != "PGRST116") {
        console.error("Error retrieving customer ID:", error);
        return { error: error, customerId: null }  // Modified
    }

    if (dbCustomer?.stripe_customer_id) {
        console.log("Existing customer ID found:", dbCustomer.stripe_customer_id);
        return { error: null, customerId: dbCustomer.stripe_customer_id }  // Modified
    }

    console.log("No existing customer ID found. Creating new customer.");

    const { data: profile, error: profileError } = await supabaseServiceRole
        .from("profiles")
        .select(`full_name, website, company_name`)
        .eq("id", session.user.id)
        .single()

    console.log("Profile data:", { profile, profileError });

    if (profileError) {
        console.error("Error fetching profile:", profileError);
        return { error: profileError, customerId: null }  // Modified
    }

    try {
        const customer = await stripe.customers.create({
            email: session.user.email,
            name: profile.full_name ?? "",
            metadata: {
                user_id: session.user.id,
                company_name: profile.company_name ?? "",
                website: profile.website ?? "",
            },
        })
        console.log("New Stripe customer created:", customer.id);

        if (!customer.id) {
            console.error("Unknown stripe user creation error");
            return { error: "Unknown stripe user creation error", customerId: null }  // Modified
        }

        const { error: stripeCustomerError } = await supabaseServiceRole
            .from("stripe_customers")
            .insert({
                user_id: session.user.id,
                stripe_customer_id: customer.id,
                updated_at: new Date(),
            })

        if (stripeCustomerError) {
            console.error("Error inserting new customer ID:", stripeCustomerError);
            return { error: stripeCustomerError, customerId: null }  // Modified
        }

        console.log("Successfully created and stored new customer ID:", customer.id);
        console.log('Creating a new user subscription')

        return { error: null, customerId: customer.id }  // Modified

    } catch (e) {
        console.error("Error creating Stripe customer:", e);
        return { error: e, customerId: null }  // Modified
    }
}


export const fetchSubscription = async ({
    customerId,
}: {
    customerId: string
}) => {
    // Fetch user's subscriptions
    try {
        const stripeSubscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 100,
            status: "all",
        })

        // find "primary" subscription
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
                    error: "No matching app subscription found",
                    primarySubscription: null,
                    hasEverHadSubscription: stripeSubscriptions.data.length > 0
                }
            }
        }

        const primarySubscription = primaryStripeSubscription && appSubscription
            ? {
                stripeSubscription: primaryStripeSubscription,
                appSubscription: appSubscription,
            }
            : null

        return {
            primarySubscription,
            hasEverHadSubscription: stripeSubscriptions.data.length > 0,
        }

    } catch (e) {
        console.error("Error fetching subscription:", e)
        return {
            error: e,
            primarySubscription: null,
            hasEverHadSubscription: false
        }
    }
}
