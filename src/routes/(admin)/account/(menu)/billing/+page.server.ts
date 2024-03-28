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

  console.log("Session:", session) // Debugging message

  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    session,
  })
  if (idError || !customerId) {
    console.error("Error creating customer ID:", idError) // Debugging message
    throw error(500, {
      message: "Unknown error. If issue persists, please contact us.",
    })
  }

  console.log("Customer ID:", customerId) // Debugging message

  const {
    primarySubscription,
    hasEverHadSubscription,
    error: fetchErr,
  } = await fetchSubscription({
    customerId,
  })
  if (fetchErr) {
    console.error("Error fetching subscription:", fetchErr) // Debugging message
    throw error(500, {
      message: "Unknown error. If issue persists, please contact us.",
    })
  }

  console.log("Primary Subscription:", primarySubscription) // Debugging message
  console.log("Has Ever Had Subscription:", hasEverHadSubscription) // Debugging message

  return {
    isActiveCustomer: !!primarySubscription,
    hasEverHadSubscription,
    currentPlanId: primarySubscription?.appSubscription?.id,
  }
}