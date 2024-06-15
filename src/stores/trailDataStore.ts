// stores/trailDataStore.js

import { writable } from 'svelte/store';

export const userTrailStore = writable([]);
export const newUserTrail = writable([]);

export const otherTrailStore = writable([]);
export const newOtherTrail = writable([]);

export const unsavedTrailStore = writable([]);

export const antLineConfigStore = writable({
    noTrails: true,
    allTrails: false,
    latestTrail: false,
    userLatestTrail: false,
  });
