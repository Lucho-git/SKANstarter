import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL,
} from "$env/static/public"
import { createSupabaseLoadClient } from "@supabase/auth-helpers-sveltekit"
import type { Database } from "../../../DatabaseDefinitions.js"
import { redirect } from "@sveltejs/kit"
import { browser } from '$app/environment'

import { profileStore } from "../../../stores/profileStore"
import { subscriptionStore } from '../../../stores/subscriptionStore';
import { connectedMapStore } from '../../../stores/connectedMapStore';
import { mapActivityStore } from '../../../stores/mapActivityStore';
import { operationStore, selectedOperationStore } from '$lib/stores/operationStore.js'

function isTokenValid(session: any) {
    if (!session?.expires_at) return false;

    // Log the expires_at value to understand its format
    console.log('Token expiry debug:', {
        raw_expires_at: session.expires_at,
        type: typeof session.expires_at,
        length: String(session.expires_at).length
    });

    // Convert expires_at to milliseconds if it's in seconds
    const expiryTime = String(session.expires_at).length === 10
        ? session.expires_at * 1000  // Convert seconds to milliseconds
        : new Date(session.expires_at).getTime();

    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;

    const isValid = expiryTime > (currentTime + fiveMinutesInMs);

    // Log the calculation details
    console.log('Token validation debug:', {
        expiryTime,
        currentTime,
        timeUntilExpiry: expiryTime - currentTime,
        isValid
    });

    return isValid;
}

export const load = async ({ fetch, data, depends, url }) => {
    depends("supabase:auth")

    // Log server-provided session data
    console.log('Client Load - Server Session:', {
        hasServerSession: !!data.session,
        serverAccessToken: data.session?.access_token?.substring(0, 10) + '...',
        serverTokenExpiry: data.session?.expires_at,
    })

    const supabase = createSupabaseLoadClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event: { fetch },
        serverSession: data.session,
    })

    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession()

    // Log client-side auth state only in browser environment

    if (browser) {
        const hasRefreshToken = () => {
            const cookies = document.cookie.split(';');
            return cookies.some(cookie =>
                cookie.trim().startsWith('sb-') &&
                cookie.includes('-auth-token')
            );
        };

        // First log the initial session state
        console.log('Initial session state:', {
            session,
            expires_at: session?.expires_at
        });

        const isValid = isTokenValid(session);

        // Only attempt refresh if we have a session but it's invalid
        if (session && !isValid) {
            console.log('Attempting to refresh invalid token...');
            try {
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                console.log('Refresh attempt result:', { refreshData, refreshError });

                if (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                } else if (refreshData?.session) {
                    console.log('Successfully refreshed session');
                    session = refreshData.session;
                }
            } catch (error) {
                console.error('Error during refresh:', error);
            }
        }

        const timeUntilExpiry = session?.expires_at ?
            (String(session.expires_at).length === 10
                ? session.expires_at * 1000
                : new Date(session.expires_at).getTime()) - Date.now()
            : null;

        console.log('Client Auth State:', {
            hasClientSession: !!session,
            clientAccessToken: session?.access_token?.substring(0, 10) + '...',
            clientTokenExpiry: session?.expires_at,
            timeUntilExpiryMs: timeUntilExpiry,
            isTokenValid: isValid,
            hasUser: !!session?.user,
            userId: session?.user?.id,
            hasRefreshToken: hasRefreshToken(),
            sessionError,
            tokensMatch: session?.access_token === data.session?.access_token,
            serverClientTimeDiff: session?.expires_at && data.session?.expires_at ?
                new Date(session.expires_at).getTime() - new Date(data.session.expires_at).getTime() :
                null
        });
    }

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
    const profileData = {
        id: data.profile.id,
        full_name: data.profile.full_name,
        company_name: data.profile.company_name,
        website: data.profile.website,
        survey_completed: data.profile.survey_completed,
        master_map_id: data.profile.master_map_id,
        recent_maps: data.profile.recent_maps,
        selected_operation_id: typeof data.profile.selected_operation_id === 'string'
            ? data.profile.selected_operation_id
            : null
    };
    profileStore.set(profileData);

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

            // Set selected operation if it exists in profile
            if (profileData.selected_operation_id && typeof profileData.selected_operation_id === 'string') {
                const selectedOperation = data.operations.find(op => op.id === profileData.selected_operation_id);
                if (selectedOperation) {
                    console.log('Setting selected operation as', selectedOperation)
                    selectedOperationStore.set(selectedOperation);
                } else {
                    selectedOperationStore.set(null);
                    profileStore.update(profile => ({
                        ...profile,
                        selected_operation_id: null
                    }));
                }
            } else {
                selectedOperationStore.set(null);
            }
        } else {
            operationStore.set([]);
            selectedOperationStore.set(null);
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
        selectedOperationStore.set(null);
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