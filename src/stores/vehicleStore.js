// vehicleStore.js
import { writable } from 'svelte/store';

const defaultUserVehicle = {
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
};

export const userVehicleStore = writable(defaultUserVehicle);

export const otherVehiclesStore = writable([]);
export const serverOtherVehiclesData = writable([]);
export const otherVehiclesDataChanges = writable([]);