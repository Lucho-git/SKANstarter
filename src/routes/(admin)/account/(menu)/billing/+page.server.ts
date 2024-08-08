import { redirect, error } from "@sveltejs/kit"
import {
  getOrCreateCustomerId,
  fetchSubscription,
} from "../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"

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
    return {
      logMessages: [`Error creating customer ID: ${idError}`],
      isActiveCustomer: false,
      hasEverHadSubscription: false,
      currentPlanId: null,
      subscriptionData: null,
    }
  }

  const {
    primarySubscription,
    hasEverHadSubscription,
    error: fetchErr,
  } = await fetchSubscription({
    customerId,
  })
  if (fetchErr) {
    return {
      logMessages: [`Error fetching subscription: ${fetchErr}`],
      isActiveCustomer: false,
      hasEverHadSubscription: false,
      currentPlanId: null,
      subscriptionData: null,
    }
  }

  return {
    logMessages: [
      `Primary Subscription: ${JSON.stringify(primarySubscription)}`,
      `Has Ever Had Subscription: ${hasEverHadSubscription}`,
    ],
    isActiveCustomer: !!primarySubscription,
    hasEverHadSubscription,
    currentPlanId: primarySubscription?.appSubscription?.id,
    subscriptionData: primarySubscription,
  }
}
