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

const checkOnboardingStatus = async (profile: any, connected_map: any, subscription: any, url: URL) => {
    const onboarding = {
        select_role: '/account/select_role',
        join_map: '/account/join_map',
        onboard_manager: '/account/onboard_manager',
        payment_plans: '/account/payment_plans',
        user_survey: '/account/user_survey',
        select_plan: '/account/select_plan'
    }

    const isOnboardingPath = Object.values(onboarding).some(path =>
        url.pathname === path || url.pathname.startsWith(path)
    )

    if (!isOnboardingPath) {
        if (profile?.role === 'manager' && !profile?.onboarded && !subscription) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        if (!profile) {
            throw redirect(303, onboarding.select_role)
        }

        if (!profile.role) {
            throw redirect(303, onboarding.select_role)
        }

        if (!profile.onboarded) {
            if (profile.role === 'operator') {
                if (!connected_map) {
                    throw redirect(303, onboarding.join_map)
                }
            } else if (profile.role === 'manager') {
                if (!subscription) {
                    throw redirect(303, onboarding.payment_plans)
                }
                throw redirect(303, onboarding.onboard_manager)
            }
        }
    }
}

export const load = async ({ fetch, data, url }) => {
    console.log('1. Layout Load Starting:', {
        url: url.pathname
    });

    const supabase = createSupabaseLoadClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event: { fetch },
        serverSession: data.session,
    })

    const { data: { session } } = await supabase.auth.getSession()
    const { profile, subscription, connected_map, map_activity, master_subscription, operations } = data

    console.log('2. Server Data:', {
        profileSelectedOpId: profile?.selected_operation_id,
        operationsAvailable: operations?.length > 0
    });

    await checkOnboardingStatus(profile, connected_map, subscription, url)

    profileStore.set({
        id: profile.id,
        full_name: profile.full_name,
        company_name: profile.company_name,
        website: profile.website,
        user_type: profile.role,
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

    if (connected_map) {
        console.log('3. Setting Operation Stores:', {
            profileSelectedOpId: profile?.selected_operation_id,
            availableOps: operations?.map(op => ({ id: op.id, name: op.name }))
        });

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

        console.log('4. Operation Stores Set:', {
            selectedOpId: selectedOp?.id,
            selectedOpName: selectedOp?.name
        });
    } else {
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