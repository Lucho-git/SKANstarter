// vehicleStore.js
import { writable } from 'svelte/store';

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
        path: () => import('$lib/vehicles/SimpleTractor.svelte')
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
            path: () => import(`../components/SVG/${newMarker.type}.svelte`)
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