import { redirect, error } from "@sveltejs/kit"
import {
    getOrCreateCustomerId,
    fetchSubscription,
} from "../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"
import { PRIVATE_STRIPE_API_KEY } from "$env/static/private"
import Stripe from "stripe"
const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })

async function listCoupons() {
    try {
        const coupons = await stripe.coupons.list({
            limit: 100,
        });
        console.log("Available Coupons:");
        coupons.data.forEach(coupon => {
            console.log(`ID: ${coupon.id}, Name: ${coupon.name}, Active: ${coupon.valid}`);
        });
        return coupons;
    } catch (e) {
        console.error("Error fetching coupons:", e);
        return null;
    }
}

export const load: PageServerLoad = async ({
    params,
    url,
    locals: { getSession, supabaseServiceRole },
    fetch,
    request
}) => {
    try {
        const session = await getSession()
        if (!session) {
            throw redirect(303, "/login")
        }

        // Handle free plan subscription
        if (params.slug === "free_plan") {
            console.log("Processing free plan subscription...")
            const response = await fetch("/account/api?/updateUserSubscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "updateUserSubscription" }),
            })

            if (!response.ok) {
                console.error("Failed to update user subscription:", await response.text())
                throw error(500, {
                    message: "Failed to update user subscription",
                })
            }

            console.log("Free plan subscription processed successfully")
            return {
                subscriptionUpdated: true
            };
        }

        // Get or create customer ID
        const { error: idError, customerId } = await getOrCreateCustomerId({
            supabaseServiceRole,
            session,
        })

        if (idError || !customerId) {
            console.error("Customer ID error:", idError)
            throw error(500, {
                message: "Failed to setup customer account. Please contact support.",
            })
        }

        console.log('Customer ID retrieved:', customerId);

        // Check existing subscription
        const result = await fetchSubscription({ customerId })

        if ('error' in result && result.error) {
            console.error("Error fetching subscription:", result.error)
            throw error(500, {
                message: "Error checking subscription status.",
            })
        }

        const { primarySubscription } = result

        // Redirect if active subscription exists
        if (primarySubscription) {
            console.log('Active subscription found, redirecting to billing')
            throw redirect(303, "/account/billing")
        }

        // Get referrer and validate it
        const referrer = request.headers.get('referer') || '/account/billing'
        const onboardingPaths = [
            '/account/select_role',
            '/account/join_map',
            '/account/onboard_manager',
            '/account/payment_plans',
            '/account/user_survey',
            '/account/select_plan'
        ];

        const safeReferrer = new URL(referrer, url.origin).pathname;
        const isValidOnboardingPath = onboardingPaths.some(path => safeReferrer.startsWith(path));
        const cancelUrl = isValidOnboardingPath ? safeReferrer : '/account/billing';

        // Process new subscription
        const quantity = parseInt(url.searchParams.get('seats') || '1', 10);
        const isOneTimePayment = params.slug === "price_1Oy7FOK3At0l0k1HrMFJ1gcc";
        const isDiscount = url.searchParams.get('discount') === 'true';

        console.log('Creating checkout session:', {
            isOneTimePayment,
            isDiscount,
            quantity,
            cancelUrl
        })

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            line_items: [
                {
                    price: params.slug,
                    quantity: quantity,
                },
            ],
            customer: customerId,
            mode: isOneTimePayment ? "payment" : "subscription",
            success_url: `${url.origin}/account`,
            cancel_url: `${url.origin}${cancelUrl}`,
            consent_collection: {
                terms_of_service: 'required',
            },
        };

        if (isDiscount) {
            sessionParams.discounts = [
                {
                    coupon: '9VKe40q5',
                },
            ];
        }

        const stripeSession = await stripe.checkout.sessions.create(sessionParams);

        if (!stripeSession?.url) {
            console.error("No checkout URL in Stripe session")
            throw error(500, {
                message: "Failed to create checkout session.",
            })
        }

        // List available coupons for debugging
        await listCoupons();

        // Return the Stripe URL instead of redirecting
        return {
            stripeUrl: stripeSession.url
        }

    } catch (e) {
        console.error("Unexpected error in load function:", e)

        // If it's an internal redirect (like to /login), throw it
        if (e instanceof Response && e.status === 303 && !e.headers.get('location')?.includes('checkout.stripe.com')) {
            throw e
        }

        // For other errors, throw a generic error
        throw error(500, {
            message: "An unexpected error occurred. Please try again later.",
        })
    }
}