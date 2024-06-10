// stores/trailDataStore.js

import { writable } from 'svelte/store';

export const userTrailStore = writable([]);
export const otherTrailStore = writable([]);
export const unsavedMarkers = writable([]);



