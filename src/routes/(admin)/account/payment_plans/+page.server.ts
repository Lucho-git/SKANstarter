import { redirect, error } from "@sveltejs/kit"
import {
    getOrCreateCustomerId,
    fetchSubscription,
} from "../subscription_helpers.server"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({
    locals: { getSession, supabaseServiceRole },
}) => {
    const session = await getSession()
    if (!session) {
        throw redirect(303, "/login")
    }

    // Update onboarded status immediately
    const { error: updateError } = await supabaseServiceRole
        .from('profiles')
        .update({
            onboarded: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

    if (updateError) {
        console.error('Error updating onboarded status:', updateError)
    }

    // Add error handling around this call
    try {
        const result = await getOrCreateCustomerId({
            supabaseServiceRole,
            session,
        })

        // Guard against undefined or malformed response
        if (!result || typeof result !== 'object') {
            console.error('Invalid response from getOrCreateCustomerId:', result)
            return {
                logMessages: ['Invalid response from customer creation'],
                isActiveCustomer: false,
                hasEverHadSubscription: false,
                currentPlanId: null,
                subscriptionData: null,
            }
        }

        const { error: idError, customerId } = result

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

    } catch (err) {
        console.error('Error in payment_plans load function:', err)
        return {
            logMessages: [`Unexpected error: ${err.message}`],
            isActiveCustomer: false,
            hasEverHadSubscription: false,
            currentPlanId: null,
            subscriptionData: null,
        }
    }
}