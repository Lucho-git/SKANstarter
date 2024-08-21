// stores/connectedMapStore.ts
import { writable } from 'svelte/store';

export const connectedMapStore = writable({
    id: null,
    map_name: null,
    master_user_id: null,
    owner: null,
    is_owner: false,
    masterSubscription: null,
    is_connected: false,
});
