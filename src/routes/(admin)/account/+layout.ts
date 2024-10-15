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
import { operationStore } from '$lib/stores/operationStore.js'

export const load = async ({ fetch, data, depends, url }) => {
    depends("supabase:auth")

    const supabase = createSupabaseLoadClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event: { fetch },
        serverSession: data.session,
    })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const subscription = data.subscription

    const profile: Database["public"]["Tables"]["profiles"]["Row"] | null =
        data.profile;

    const createProfilePath = "/account/create_profile";
    const userSurveyPath = "/account/user_survey";
    const selectPlanPath = "/account/select_plan";
    const dashboard = "/account";

    // Check if profile is incomplete and redirect to create profile page
    if (
        profile &&
        !_hasFullProfile(profile) &&
        url.pathname !== createProfilePath
    ) {
        throw redirect(303, createProfilePath);
    }

    // Check if profile is complete but survey is incomplete and redirect to survey page
    if (
        profile &&
        _hasFullProfile(profile) &&
        !_hasSurveyCompleted(profile) &&
        url.pathname !== userSurveyPath &&
        url.pathname !== selectPlanPath
    ) {
        console.log('Redirect to survey')
        throw redirect(303, userSurveyPath);
    }

    //Load all the stores with data
    data = { supabase, session, profile, subscription, connectedMap: data.connectedMap, mapActivity: data.mapActivity, masterSubscription: data.masterSubscription, operations: data.operations }

    console.log("Loading data into stores:", data);

    // Load profile data
    profileStore.set({
        id: data.profile.id,
        full_name: data.profile.full_name,
        company_name: data.profile.company_name,
        website: data.profile.website,
        survey_completed: data.profile.survey_completed,
        master_map_id: data.profile.master_map_id,
        recent_maps: data.profile.recent_maps
    });

    // Load user's subscription data
    subscriptionStore.set({
        subscription: data.subscription?.subscription,
        marker_limit: data.subscription?.marker_limit,
        trail_limit: data.subscription?.trail_limit,
        lingering_seats: data.subscription?.lingering_seats,
        current_seats: data.subscription?.current_seats,
        next_billing_date: data.subscription?.next_billing_date
    });

    // Load connected map data
    if (data.connectedMap) {
        connectedMapStore.set({
            id: data.connectedMap.id,
            map_name: data.connectedMap.map_name,
            master_user_id: data.connectedMap.master_user_id,
            owner: data.connectedMap.owner,
            is_owner: data.connectedMap.is_owner,
            masterSubscription: {
                subscription: data.masterSubscription?.subscription,
                marker_limit: data.masterSubscription?.marker_limit,
                trail_limit: data.masterSubscription?.trail_limit,
                lingering_seats: data.masterSubscription?.lingering_seats,
                current_seats: data.masterSubscription?.current_seats,
                next_billing_date: data.masterSubscription?.next_billing_date
            },
            is_connected: true
        });

        // Load map activity data
        mapActivityStore.set({
            marker_count: data.mapActivity.marker_count,
            trail_count: data.mapActivity.trail_count,
            connected_profiles: data.mapActivity.connected_profiles,
            vehicle_states: data.mapActivity.vehicle_states
        });

        // Load operations data
        if (data.operations) {
            operationStore.set(data.operations);
        } else {
            operationStore.set([]);
        }
    } else {
        // Reset connected map, map activity, and operations stores if no map is connected
        connectedMapStore.set({
            id: null,
            map_name: null,
            master_user_id: null,
            owner: null,
            is_owner: false,
            masterSubscription: null,
            is_connected: false,
        });
        mapActivityStore.set({
            marker_count: 0,
            trail_count: 0,
            connected_profiles: [],
            vehicle_states: []
        });
        operationStore.set([]);
    }

    return data;
};



//Required Fields
export const _hasFullProfile = (
    profile: Database["public"]["Tables"]["profiles"]["Row"] | null,
) => {
    if (!profile) {
        return false
    }
    if (!profile.full_name) {
        return false
    }
    //   if (!profile.company_name) {
    //     return false
    //   }

    return true
}


export const _hasSurveyCompleted = (
    profile: Database["public"]["Tables"]["profiles"]["Row"] | null,
) => {
    if (!profile) {
        return false;
    }
    if (!profile.survey_completed) {
        return false;
    }

    return true;
};