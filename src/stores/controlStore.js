//controStore.js
import { writable } from 'svelte/store';

export const controlStore = writable({
  showMarkerMenu: false,
  showVehicleMenu: false,
});

export const showOpenTrailModal = writable(false)
export const showEndTrailModal = writable(false)
export const trailingButtonPressed = writable(false);

export const crispVisibility = writable(false);
