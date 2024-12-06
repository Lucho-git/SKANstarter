//controStore.js
import { writable } from 'svelte/store';

export const controlStore = writable({
  showMarkerMenu: false,
  showVehicleMenu: false,
});

export const showEndTrailModal = writable(false)
export const trailingButtonPressed = writable();

export const crispVisibility = writable(false);

export const drawingModeEnabled = writable(false);