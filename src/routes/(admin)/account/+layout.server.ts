import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({
    locals: { supabase, getSession },
}) => {
    const session = await getSession()

    // Log server-side auth state
    console.log('Server Auth State:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        accessToken: session?.access_token?.substring(0, 10) + '...', // First 10 chars for debugging
        tokenExpiry: session?.expires_at,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        authProvider: session?.user?.app_metadata?.provider,
        lastSignIn: session?.user?.last_sign_in_at,
        aud: session?.user?.aud, // Audience claim from JWT
        role: session?.user?.role // User's role if any
    })

    if (!session) {
        console.log('Server: No session found, redirecting to login')
        throw redirect(303, "/login")
    }

    const userId = session.user.id

    // Rest of your existing code without additional logging
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

    const profile = profileResult.data
    const subscription = subscriptionResult.data

    if (!profile?.master_map_id) {
        return { session, profile, subscription, connectedMap: null, mapActivity: null, masterSubscription: null, operations: null }
    }

    const [masterMapResult, mapActivityResult, operationsResult] = await Promise.all([
        supabase.from("master_maps").select("*").eq("id", profile.master_map_id).single(),
        Promise.all([
            supabase.from("map_markers").select("id", { count: "exact" }).eq("master_map_id", profile.master_map_id),
            supabase.from("trail_data").select("id", { count: "exact" }).eq("master_map_id", profile.master_map_id),
            supabase.from("profiles").select("id, full_name").eq("master_map_id", profile.master_map_id)
        ]),
        supabase.from("operations").select("*").eq("master_map_id", profile.master_map_id)
    ])

    const masterMap = masterMapResult.data
    const [markerCount, trailCount, connectedProfiles] = mapActivityResult
    const operations = operationsResult.data

    if (!masterMap) {
        return { session, profile, subscription, connectedMap: null, mapActivity: null, masterSubscription: null, operations: null }
    }

    const [ownerProfileResult, masterSubscriptionResult, vehicleStatesResult] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", masterMap.master_user_id).single(),
        supabase.from('user_subscriptions').select('*').eq('user_id', masterMap.master_user_id).single(),
        supabase.from("vehicle_state").select("*")
            .eq("master_map_id", profile.master_map_id)
            .in("vehicle_id", connectedProfiles.data?.map(profile => profile.id) || [])
    ])

    return {
        session,
        profile,
        subscription: subscription || null,
        connectedMap: {
            id: masterMap.id,
            map_name: masterMap.map_name,
            master_user_id: masterMap.master_user_id,
            owner: ownerProfileResult.data?.full_name || 'Unknown',
            is_owner: userId === masterMap.master_user_id
        },
        mapActivity: {
            marker_count: markerCount.count || 0,
            trail_count: trailCount.count || 0,
            connected_profiles: connectedProfiles.data || [],
            vehicle_states: vehicleStatesResult.data || []
        },
        masterSubscription: masterSubscriptionResult.data || null,
        operations: operations || null
    }
}