import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL,
} from "$env/static/public"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import type { Database } from "../../../DatabaseDefinitions.js"
import { redirect } from "@sveltejs/kit"

import { profileStore } from "../../../stores/profileStore"
import { subscriptionStore } from '../../../stores/subscriptionStore';
import { connectedMapStore } from '../../../stores/connectedMapStore';
import { mapActivityStore } from '../../../stores/mapActivityStore';
import { operationStore, selectedOperationStore } from '$lib/stores/operationStore.js'

export const load = async ({ fetch, data, url }) => {
    const supabase = createSupabaseLoadClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event: { fetch },
        serverSession: data.session,
    })

    const { data: { session } } = await supabase.auth.getSession()
    const { profile, subscription, connected_map, map_activity, master_subscription, operations } = data

    // Onboarding flow
    const onboarding = {
        choose_type: '/account/choose_type',
        create_profile: (type: 'farmer' | 'operator') => `/account/create_profile/${type}`,
        join_map: '/account/join_map',
        survey: '/account/survey',
        select_plan: '/account/select_plan'
    }

    if (!profile) throw redirect(303, onboarding.choose_type)
    if (!profile.user_type && url.pathname !== onboarding.choose_type) throw redirect(303, onboarding.choose_type)
    if (profile.user_type && !profile.full_name && !url.pathname.startsWith('/account/create_profile')) {
        throw redirect(303, onboarding.create_profile(profile.user_type))
    }
    if (profile.user_type === 'farmer' && !profile.survey_completed && url.pathname !== onboarding.survey) {
        throw redirect(303, onboarding.survey)
    }
    if (profile.user_type === 'operator' && !profile.master_map_id && url.pathname !== onboarding.join_map) {
        throw redirect(303, onboarding.join_map)
    }

    // Initialize core stores
    profileStore.set({
        id: profile.id,
        full_name: profile.full_name,
        company_name: profile.company_name,
        website: profile.website,
        user_type: profile.user_type,
        survey_completed: profile.survey_completed,
        master_map_id: profile.master_map_id,
        recent_maps: profile.recent_maps,
        selected_operation_id: profile.selected_operation_id
    })

    subscriptionStore.set({
        subscription: subscription?.subscription,
        marker_limit: subscription?.marker_limit,
        trail_limit: subscription?.trail_limit,
        lingering_seats: subscription?.lingering_seats,
        current_seats: subscription?.current_seats,
        next_billing_date: subscription?.next_billing_date
    })

    // Handle map-related stores
    if (connected_map) {
        connectedMapStore.set({
            id: connected_map.id,
            map_name: connected_map.map_name,
            master_user_id: connected_map.master_user_id,
            owner: connected_map.owner,
            is_owner: connected_map.is_owner,
            masterSubscription: master_subscription,
            is_connected: true
        })

        mapActivityStore.set({
            marker_count: map_activity.marker_count,
            trail_count: map_activity.trail_count,
            connected_profiles: map_activity.connected_profiles,
            vehicle_states: map_activity.vehicle_states
        })

        operationStore.set(operations || [])
        const selectedOp = operations?.find(op =>
            op.id === profile.selected_operation_id
        )
        selectedOperationStore.set(selectedOp || null)
    } else {
        // Reset all map-related stores
        connectedMapStore.set({
            id: null,
            map_name: null,
            master_user_id: null,
            owner: null,
            is_owner: false,
            masterSubscription: null,
            is_connected: false
        })

        mapActivityStore.set({
            marker_count: 0,
            trail_count: 0,
            connected_profiles: [],
            vehicle_states: []
        })

        operationStore.set([])
        selectedOperationStore.set(null)
    }

    return {
        supabase,
        session,
        profile,
        subscription,
        connected_map,
        map_activity,
        master_subscription,
        operations
    }
}