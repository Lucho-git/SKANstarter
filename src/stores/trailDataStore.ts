// stores/trailDataStore.js

import { writable } from 'svelte/store';

export const userTrailStore = writable([]);
export const newUserTrail = writable([]);

export const otherTrailStore = writable([]);
export const newOtherTrail = writable([]);

export const unsavedTrailStore = writable([]);



