// stores/profileStore.ts
import { writable } from 'svelte/store';

export const profileStore = writable({
    id: null,
    full_name: null,
    company_name: null,
    website: null,
    survey_completed: false,
    master_map_id: null
});
