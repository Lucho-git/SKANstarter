// src/stores/mapStore.js
import { writable } from 'svelte/store';

export const mapStore = writable(null);
export const userVehicleStore = writable({
    type: 'tractor',
    color: 'orange',
    size: '60px',
  });

  export const selectedMarkerStore = writable(null);
  export const confirmedMarkersStore = writable([]);
  export const removeMarkerStore = writable([]);

  export const markerActionsStore = writable([]);






