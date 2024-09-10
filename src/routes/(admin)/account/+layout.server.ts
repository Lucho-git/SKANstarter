import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({
    locals: { supabase, getSession },
}) => {
    const session = await getSession()

    if (!session) {
        throw redirect(303, "/login")
    }

    const [profileResult, subscriptionResult] = await Promise.all([
        supabase
            .from("profiles")
            .select(`*`)
            .eq("id", session.user.id)
            .single(),
        supabase
            .from("user_subscriptions")
            .select('*')
            .eq('user_id', session.user.id)
            .single()
    ])

    return {
        session,
        profile: profileResult.data,
        subscription: subscriptionResult.data
    }
}
