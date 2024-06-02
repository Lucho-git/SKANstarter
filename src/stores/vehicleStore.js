// vehicleStore.js
import { writable } from 'svelte/store';

export const userVehicleStore = writable({
  id: null,
  coordinates: null,
  last_update: null,
  heading: null,
  is_trailing: false,
  vehicle_marker: {
    type: 'tractor',
    color: 'white',
    size: '25px',
  },
});

export const otherVehiclesStore = writable([]);