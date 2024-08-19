// stores/mapActivityStore.ts
import { writable } from 'svelte/store';

export const mapActivityStore = writable({
    marker_count: 0,
    trail_count: 0,
    connected_profiles: [],
    vehicle_states: []
});
