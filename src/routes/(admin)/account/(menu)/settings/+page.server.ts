import { redirect, error } from "@sveltejs/kit"
import { getOrCreateCustomerId, fetchSubscription } from "../../subscription_helpers.server"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({
  locals: { getSession, supabaseServiceRole },
}) => {
  const session = await getSession()
  if (!session) {
    throw redirect(303, "/login")
  }

//   const { data: profile, error: profileError } = await supabaseServiceRole
//     .from("profiles")
//     .select(`full_name, website, company_name`)
//     .eq("id", session.user.id)
//     .single()

//   if (profileError) {
//     throw error(500, "Error fetching profile")
//   }

//   const { error: idError, customerId } = await getOrCreateCustomerId({
//     supabaseServiceRole,
//     session,
//   })

//   if (idError || !customerId) {
//     console.error("Error getting customer ID:", idError)
//     return { session, profile, subscriptionData: null }
//   }

//   const { primarySubscription, error: subError } = await fetchSubscription({ customerId })

//   if (subError) {
//     console.error("Error fetching subscription:", subError)
//   }

//   console.log("Subscription Data:", JSON.stringify(primarySubscription, null, 2))

//   return {
//     session,
//     profile,
//     subscriptionData: primarySubscription
//   }
}
