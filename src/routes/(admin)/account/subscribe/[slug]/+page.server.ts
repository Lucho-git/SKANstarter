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
  const coupons = await stripe.coupons.list({
    limit: 100,
  });

  console.log("Coupons:");
  coupons.data.forEach(coupon => {
    console.log(`ID: ${coupon.id}, Name: ${coupon.name}, Active: ${coupon.valid}`);
  });
}

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

  console.log('Got customer id:', customerId);

  const { primarySubscription } = await fetchSubscription({
    customerId,
  })
  if (primarySubscription) {
    throw redirect(303, "/account/billing")
  }

  const quantity = parseInt(url.searchParams.get('seats') || '1', 10);

  let checkoutUrl

  console.log('Trying payment')

  try {
    const isOneTimePayment = params.slug === "price_1Oy7FOK3At0l0k1HrMFJ1gcc";
    const isDiscount = url.searchParams.get('discount') === 'true';
    console.log('IdDiscount', isDiscount);

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
      cancel_url: `${url.origin}/account/billing`,
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
    checkoutUrl = stripeSession.url

    await listCoupons();

  } catch (e) {
    console.log('e', e)
  }

  throw redirect(303, checkoutUrl ?? "/pricing")
}
