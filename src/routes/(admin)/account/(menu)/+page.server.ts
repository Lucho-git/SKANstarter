import { redirect, fail } from "@sveltejs/kit"
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()
    if (!session) {
        throw redirect(303, "/login")
    }

    console.log("Session loaded, user ID:", session.user.id)

    // Step 1: Get user's profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

    if (profileError) {
        console.error("Error fetching profile:", profileError)
        return { profile: null }
    }

    console.log("Profile loaded:", profile)

    // Step 2: Get subscription data
    const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

    if (subscriptionError) {
        console.error("Error fetching subscription data:", subscriptionError)
    }

    console.log("Subscription data loaded:", subscriptionData)

    // If no master_map_id, return early
    if (!profile.master_map_id) {
        console.log("No master_map_id found, returning early")
        return {
            profile,
            subscription: subscriptionData || null,
            connectedMap: null,
            mapActivity: null
        }
    }

    // Step 3: Get master map data
    const { data: masterMap, error: masterMapError } = await supabase
        .from("master_maps")
        .select("*")
        .eq("id", profile.master_map_id)
        .single()

    if (masterMapError) {
        console.error("Error fetching master map:", masterMapError)
        return {
            profile,
            subscription: subscriptionData || null,
            connectedMap: null,
            mapActivity: null
        }
    }

    console.log("Master map loaded:", masterMap)

    // Step 4: Get owner's profile
    const { data: ownerProfile, error: ownerProfileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", masterMap.master_user_id)
        .single()

    if (ownerProfileError) {
        console.error("Error fetching owner profile:", ownerProfileError)
    }

    console.log("Owner profile loaded:", ownerProfile)

    // Step 5: Get map activity data
    const [
        { count: markerCount, error: markerError },
        { count: trailCount, error: trailError },
        { data: connectedProfiles, error: profilesError },
    ] = await Promise.all([
        supabase.from("map_markers").select("id", { count: "exact" }).eq("master_map_id", profile.master_map_id),
        supabase.from("trail_data").select("id", { count: "exact" }).eq("master_map_id", profile.master_map_id),
        supabase.from("profiles").select("id, full_name").eq("master_map_id", profile.master_map_id),
    ])

    // Now use the connectedProfiles to filter vehicle_state
    const { data: vehicleStates, error: vehicleError } = await supabase
        .from("vehicle_state")
        .select("*")
        .eq("master_map_id", profile.master_map_id)
        .in("vehicle_id", connectedProfiles.map(profile => profile.id))

    if (markerError) console.error("Error fetching marker count:", markerError)
    if (trailError) console.error("Error fetching trail count:", trailError)
    if (profilesError) console.error("Error fetching connected profiles:", profilesError)
    if (vehicleError) console.error("Error fetching vehicle states:", vehicleError)

    console.log("Map activity data loaded:", { markerCount, trailCount, connectedProfiles, vehicleStates })

    return {
        profile,
        subscription: subscriptionData || null,
        connectedMap: {
            id: masterMap.id,
            map_name: masterMap.map_name,
            master_user_id: masterMap.master_user_id,
            owner: ownerProfile?.full_name || 'Unknown',
            is_current_user_owner: session.user.id === masterMap.master_user_id
        },
        mapActivity: {
            marker_count: markerCount || 0,
            trail_count: trailCount || 0,
            connected_profiles: connectedProfiles || [],
            vehicle_states: vehicleStates || []
        }
    }
}


export const actions = {

    disconnectFromMap: async ({ locals }) => {
        const session = await locals.getSession();
        if (!session) {
            return fail(401, { message: 'Unauthorized' });
        }

        const { error } = await locals.supabase
            .from("profiles")
            .update({ master_map_id: null })
            .eq("id", session.user.id);

        if (error) {
            return fail(500, { message: 'Failed to disconnect from map' });
        }

        return { success: true, message: 'Successfully disconnected from map' };
    },

    kickUser: async ({ locals, request }) => {
        const session = await locals.getSession();
        if (!session) {
            return fail(401, { message: 'Unauthorized' });
        }

        const formData = await request.formData();
        const userIdToKick = formData.get('userId');

        // Add logic to check if the current user has permission to kick

        const { error } = await locals.supabase
            .from("profiles")
            .update({ master_map_id: null })
            .eq("id", userIdToKick);

        if (error) {
            return fail(500, { message: 'Failed to kick user' });
        }

        return { success: true, message: 'Successfully kicked user from map' };
    },

    signout: async ({ locals: { supabase, getSession } }) => {
        const session = await getSession()

        try {
            console.log('Attempting to sign out1...')
            await supabase.auth.signOut()
        } catch (error) {
            console.error("Error during sign-out:", error)
        } finally {
            if (typeof window !== 'undefined') {
                console.log('Clearing local storage session...')
                localStorage.removeItem('supabase.auth.token')
            }
            throw redirect(303, "/")
        }
    }
}
