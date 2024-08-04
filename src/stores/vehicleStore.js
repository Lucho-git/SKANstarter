// vehicleStore.js
import { writable } from 'svelte/store';
import SVGComponents from '../components/SVG/index.js';

function createUserVehicleStore() {
    const { subscribe, set, update } = writable({
      id: null,
      coordinates: null,
      last_update: null,
      is_trailing: false,
      vehicle_marker: {
        type: 'simpleTractor',
        color: 'red',
        size: '25px',
        swath: 30,
        path: SVGComponents.SimpleTractor
    },
      heading: 0
    });
  
    return {
      subscribe,
      set,
      update,
      updateVehicleMarker: (newMarker) => {
        update(store => ({
          ...store,
          vehicle_marker: {
            ...store.vehicle_marker,
            ...newMarker,
            path: SVGComponents[newMarker.type]
        }
        }));
      }
    };
  }
  
  export const userVehicleStore = createUserVehicleStore();
  export const userVehicleTrailing = writable(false);

export const otherVehiclesStore = writable([]);
export const serverOtherVehiclesData = writable([]);
export const otherVehiclesDataChanges = writable([]);