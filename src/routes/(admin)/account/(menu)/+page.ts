// +page.ts
import { profileStore } from "../../../../stores/profileStore"
import { subscriptionStore } from '../../../../stores/subscriptionStore';
import { connectedMapStore } from '../../../../stores/connectedMapStore';
import { mapActivityStore } from '../../../../stores/mapActivityStore';

export const load = async ({ data }) => {
    console.log("Loading data into stores:", data);


    // Load profile data
    profileStore.set({
        id: data.profile.id,
        full_name: data.profile.full_name,
        company_name: data.profile.company_name,
        website: data.profile.website,
        survey_completed: data.profile.survey_completed,
        master_map_id: data.profile.master_map_id
    });

    // Load subscription data
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
            is_current_user_owner: data.connectedMap.is_current_user_owner
        });

        // Load map activity data
        mapActivityStore.set({
            marker_count: data.mapActivity.marker_count,
            trail_count: data.mapActivity.trail_count,
            connected_profiles: data.mapActivity.connected_profiles,
            vehicle_states: data.mapActivity.vehicle_states
        });
    } else {
        // Reset connected map and map activity stores if no map is connected
        connectedMapStore.set({
            id: null,
            map_name: null,
            master_user_id: null,
            owner: null,
            is_current_user_owner: false
        });
        mapActivityStore.set({
            marker_count: 0,
            trail_count: 0,
            connected_profiles: [],
            vehicle_states: []
        });
    }

    // Return the original data in case it's needed elsewhere
    console.log("Loaded data:", data);
    return data;
};
