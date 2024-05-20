// src/stores/mapStore.js
import { writable } from 'svelte/store';

export const mapStore = writable(null);
export const userVehicleStore = writable('harvester');
export const vehicleColorSizeStore = writable({ color: 'red', size: '60px' });
