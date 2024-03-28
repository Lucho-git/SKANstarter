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
    locals: { getSession, supabaseServiceRole },
  }) => {
    const session = await getSession()
    console.log("Session:", session)
  
    if (!session) {
      throw redirect(303, "/login")
    }
  
    const { error: idError, customerId } = await getOrCreateCustomerId({
      supabaseServiceRole,
      session,
    })
    console.log("Customer ID:", customerId)
    console.log("ID Error:", idError)
  
    if (idError || !customerId) {
      return {
        logMessages: [`Error creating customer ID: ${idError}`],
        isActiveCustomer: false,
        hasEverHadSubscription: false,
        currentPlanId: null,
      }
    }
  
    const {
      primarySubscription,
      hasEverHadSubscription,
      error: fetchErr,
    } = await fetchSubscription({
      customerId,
    })
    console.log("Fetch Error:", fetchErr)
  
    if (fetchErr) {
      return {
        logMessages: [`Error fetching subscription: ${fetchErr}`],
        isActiveCustomer: false,
        hasEverHadSubscription: false,
        currentPlanId: null,
      }
    }
  
    console.log("Returned Data:", {
      logMessages: [
        `Primary Subscription: ${JSON.stringify(primarySubscription)}`,
        `Has Ever Had Subscription: ${hasEverHadSubscription}`,
      ],
      isActiveCustomer: !!primarySubscription,
      hasEverHadSubscription,
      currentPlanId: primarySubscription?.appSubscription?.id,
    })
  
    return {
      logMessages: [
        `Primary Subscription: ${JSON.stringify(primarySubscription)}`,
        `Has Ever Had Subscription: ${hasEverHadSubscription}`,
      ],
      isActiveCustomer: !!primarySubscription,
      hasEverHadSubscription,
      currentPlanId: primarySubscription?.appSubscription?.id,
    }
  }