// routes/(admin)/account/+layout.server.ts
import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({
    locals: { supabase, getSession }, cookies, depends
}) => {

    depends('data:profile')
    console.log('1. Layout Server Load Starting')
    const session = await getSession()

    // Log server-side auth state
    console.log('Server Auth State:', {
        hasSession: !!session,
        userId: session?.user?.id,
    })

    if (!session) {
        throw redirect(303, "/login")
    }

    const userId = session.user.id

    // Check for pending map cookie and join it if exists
    const pendingMapId = cookies.get('pending_map_id')
    if (pendingMapId) {
        cookies.delete('pending_map_id', { path: '/' })
        const { error } = await supabase
            .from('profiles')
            .update({ master_map_id: pendingMapId })
            .eq('id', userId)

        if (!error) {
            throw redirect(303, '/account')
        }
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

    console.log('2. Profile Query Result:', {
        selectedOperationId: profileResult.data?.selected_operation_id,
    });

    const profile = profileResult.data
    const subscription = subscriptionResult.data

    if (!profile?.master_map_id) {
        return {
            session,
            profile,
            subscription,
            connected_map: null,
            map_activity: null,
            master_subscription: null,
            operations: null
        }
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

    console.log('3. Operations Query Result:', {
        operations: operationsResult.data?.map(op => ({ id: op.id, name: op.name })),
    });

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

    console.log('4. Final Data:', {
        profileSelectedOpId: profile?.selected_operation_id,
        availableOpIds: operations?.map(op => op.id),
    });

    return {
        session,
        profile,
        subscription: subscription || null,
        connected_map: {
            id: masterMap.id,
            map_name: masterMap.map_name,
            master_user_id: masterMap.master_user_id,
            owner: ownerProfileResult.data?.full_name || 'Unknown',
            is_owner: userId === masterMap.master_user_id
        },
        map_activity: {
            marker_count: markerCount.count || 0,
            trail_count: trailCount.count || 0,
            connected_profiles: connectedProfiles.data || [],
            vehicle_states: vehicleStatesResult.data || []
        },
        master_subscription: masterSubscriptionResult.data || null,
        operations: operations || null
    }
}