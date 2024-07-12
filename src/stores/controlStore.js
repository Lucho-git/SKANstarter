import { writable } from 'svelte/store';

export const controlStore = writable({
  showMarkerMenu: false,
  showVehicleMenu: false,
});

export const crispVisibility = writable(false);
